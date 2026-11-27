// Build web meshes from DevCCFv1 embryonic annotations.
// usage: node build.mjs <extractedDir> <outDir>
import fs from 'fs';
import path from 'path';
import { load } from './nii.mjs';
import { GROUPS, assign } from './groups.mjs';
import { gaussianBlur3D, surfaceNets, signedVolume, filterComponents, compact, taubin, vertexNormals } from './meshlib.mjs';
import { MeshoptSimplifier } from 'meshoptimizer';
import { Document, NodeIO } from '@gltf-transform/core';

const [inDir, outDir] = process.argv.slice(2);
const PARAMS = {
  blurSigmaVoxels: 0.75,   // Gaussian pre-smoothing of each binary group mask
  iso: 0.4,               // < 0.5 so 1-voxel-thin sheets (roof plates) survive the blur
  trimSpinalCanal: true,  // drop ventricle voxels whose nearest tissue voxel is spinal cord (SpC is not meshed)
  minComponentFrac: 0.005, // drop islands < 0.5 % of the group's triangles ...
  minComponentTris: 60,    // ... or < 60 triangles
  taubinIterations: 4, taubinLambda: 0.5, taubinMu: -0.53,
  trianglesPerAge: 60000, minTrianglesPerGroup: 1500,
};
const AGES = [
  { age: 'E11.5', file: 'E11-5_DevCCF_Annotations_31.5um.nii.gz' },
  { age: 'E13.5', file: 'E13-5_DevCCF_Annotations_34um.nii.gz' },
  { age: 'E15.5', file: 'E15-5_DevCCF_Annotations_37.5um.nii.gz' },
  { age: 'E18.5', file: 'E18-5_DevCCF_Annotations_40um.nii.gz' },
];
const onto = JSON.parse(fs.readFileSync(new URL('./ontology.json', import.meta.url)));
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexToLinear = (h) => [1, 3, 5].map((i) => srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255));

await MeshoptSimplifier.ready;
fs.mkdirSync(outDir, { recursive: true });
const summary = { params: PARAMS, ages: [], labels: {} };

for (const { age, file } of AGES) {
  const t0 = Date.now();
  const { h, data, dims } = load(path.join(inDir, file));
  if (h.xyzt_units % 8 !== 2) throw new Error('expected mm units');
  const A = h.affine; const [nx, ny, nz] = dims;
  const voxelUm = Math.round(Math.abs(h.pixDims[1]) * 1e4) / 10;
  // label -> group index
  const gIndex = new Uint8Array(data.length);
  const lut = new Map(); const counts = new Map();
  for (let i = 0; i < data.length; i++) {
    const v = data[i]; if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
    let g = lut.get(v);
    if (g === undefined) { const key = assign(onto, v); g = key ? GROUPS.findIndex((x) => x.key === key) + 1 : 0; lut.set(v, g); }
    gIndex[i] = g;
  }
  for (const [v, n] of counts) {
    const o = onto[v];
    const L = summary.labels[v] || (summary.labels[v] = { id: v, acronym: o?.acr ?? null, name: o?.name ?? null,
      ontologyPath: o ? o.path.map((i) => onto[i]?.acr) : null, group: lut.get(v) ? GROUPS[lut.get(v) - 1].key : null, voxels: {} });
    L.voxels[age] = n;
  }
  // Trim the central canal: BFS from tissue voxels into ventricle voxels, remember whether nearest tissue is SpC.
  let trimmed = 0;
  if (PARAMS.trimSpinalCanal) {
    const vIdx = GROUPS.findIndex((x) => x.key === 'ventricles') + 1;
    const src = new Int8Array(data.length); // 0 unvisited, 1 brain, 2 spinal
    let q = new Int32Array(data.length), qh = 0, qt = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i]; if (!v || gIndex[i] === vIdx) continue;
      const spinal = onto[v]?.path.some((p) => onto[p]?.acr === 'SpC');
      src[i] = spinal ? 2 : 1; q[qt++] = i;
    }
    const st = [1, -1, nx, -nx, nx * ny, -nx * ny];
    while (qh < qt) { const i = q[qh++]; for (const d of st) { const j = i + d; if (j < 0 || j >= data.length || src[j] || gIndex[j] !== vIdx) continue; src[j] = src[i]; q[qt++] = j; } }
    for (let i = 0; i < data.length; i++) if (gIndex[i] === vIdx && src[i] === 2) { gIndex[i] = 0; trimmed++; }
  }
  // index (i,j,k) -> output frame in micrometres: X = anterior (RAS y), Y = dorsal (RAS z), Z = right (RAS x)
  const toOut = (i, j, k) => {
    const r = A[0][0] * i + A[0][1] * j + A[0][2] * k + A[0][3];
    const a = A[1][0] * i + A[1][1] * j + A[1][2] * k + A[1][3];
    const s = A[2][0] * i + A[2][1] * j + A[2][2] * k + A[2][3];
    return [a * 1000, s * 1000, r * 1000];
  };
  const meshes = [];
  for (let g = 1; g <= GROUPS.length; g++) {
    let lo = [nx, ny, nz], hi = [-1, -1, -1];
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      if (gIndex[i + nx * (j + ny * k)] !== g) continue;
      if (i < lo[0]) lo[0] = i; if (j < lo[1]) lo[1] = j; if (k < lo[2]) lo[2] = k;
      if (i > hi[0]) hi[0] = i; if (j > hi[1]) hi[1] = j; if (k > hi[2]) hi[2] = k;
    }
    if (hi[0] < 0) continue;
    const pad = 4;
    const o = lo.map((x) => x - pad);
    const cd = [0, 1, 2].map((d) => hi[d] - lo[d] + 1 + 2 * pad);
    const f = new Float32Array(cd[0] * cd[1] * cd[2]);
    for (let k = 0; k < cd[2]; k++) for (let j = 0; j < cd[1]; j++) for (let i = 0; i < cd[0]; i++) {
      const I = i + o[0], J = j + o[1], K = k + o[2];
      if (I < 0 || J < 0 || K < 0 || I >= nx || J >= ny || K >= nz) continue;
      if (gIndex[I + nx * (J + ny * K)] === g) f[i + cd[0] * (j + cd[1] * k)] = 1;
    }
    const fb = gaussianBlur3D(f, cd, PARAMS.blurSigmaVoxels);
    let { positions, indices } = surfaceNets(fb, cd, PARAMS.iso);
    const rawTris = indices.length / 3;
    const fc = filterComponents(positions, indices, PARAMS.minComponentFrac, PARAMS.minComponentTris);
    positions = fc.positions; indices = fc.indices;
    positions = taubin(positions, indices, PARAMS.taubinIterations, PARAMS.taubinLambda, PARAMS.taubinMu);
    const P = new Float32Array(positions.length);
    for (let v = 0; v < positions.length; v += 3) {
      const q = toOut(positions[v] + o[0], positions[v + 1] + o[1], positions[v + 2] + o[2]);
      P[v] = q[0]; P[v + 1] = q[1]; P[v + 2] = q[2];
    }
    meshes.push({ g, P, I: indices, rawTris, components: fc.components, keptComponents: fc.keptComponents });
  }
  // budget
  const totalTris = meshes.reduce((s, m) => s + m.I.length / 3, 0);
  for (const m of meshes) {
    const target = Math.max(PARAMS.minTrianglesPerGroup, Math.round(PARAMS.trianglesPerAge * (m.I.length / 3) / totalTris));
    const [si, err] = MeshoptSimplifier.simplify(m.I, m.P, 3, Math.min(m.I.length, target * 3), 1.0, []);
    const c = compact(m.P, si);
    m.P = c.positions; m.I = c.indices; m.simplifyError = err;
    if (signedVolume(m.P, m.I) < 0) { // ensure outward winding
      for (let t = 0; t < m.I.length; t += 3) { const x = m.I[t + 1]; m.I[t + 1] = m.I[t + 2]; m.I[t + 2] = x; }
    }
  }
  // centre on the bounding box of all meshes
  const bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
  for (const m of meshes) for (let v = 0; v < m.P.length; v += 3) for (let d = 0; d < 3; d++) {
    bmin[d] = Math.min(bmin[d], m.P[v + d]); bmax[d] = Math.max(bmax[d], m.P[v + d]);
  }
  const ctr = bmin.map((x, d) => (x + bmax[d]) / 2);
  for (const m of meshes) for (let v = 0; v < m.P.length; v += 3) for (let d = 0; d < 3; d++) m.P[v + d] -= ctr[d];

  // glb
  const doc = new Document(); const buf = doc.createBuffer();
  const scene = doc.createScene(age);
  const ageOut = { age, file: `${age}.glb`, source: file, voxelSizeUm: voxelUm, dims,
    centreOffsetUm: { anterior: ctr[0], dorsal: ctr[1], right: ctr[2], note: 'subtracted from DevCCF world coordinates (RAS, mm*1000) after axis permutation' },
    boundingBoxUm: { min: bmin.map((x, d) => +(x - ctr[d]).toFixed(1)), max: bmax.map((x, d) => +(x - ctr[d]).toFixed(1)), size: bmax.map((x, d) => +(x - bmin[d]).toFixed(1)) },
    groups: {}, ventricleVoxelsTrimmedAsSpinalCanal: trimmed };
  for (const m of meshes) {
    const G = GROUPS[m.g - 1];
    const N = vertexNormals(m.P, m.I);
    const nv = m.P.length / 3;
    const pos = doc.createAccessor().setBuffer(buf).setType('VEC3').setArray(m.P);
    const nor = doc.createAccessor().setBuffer(buf).setType('VEC3').setArray(N);
    const ind = doc.createAccessor().setBuffer(buf).setType('SCALAR').setArray(nv < 65536 ? Uint16Array.from(m.I) : m.I);
    const mat = doc.createMaterial(G.key).setBaseColorFactor([...hexToLinear(G.color), 1]).setMetallicFactor(0).setRoughnessFactor(0.7);
    const prim = doc.createPrimitive().setAttribute('POSITION', pos).setAttribute('NORMAL', nor).setIndices(ind).setMaterial(mat);
    const mesh = doc.createMesh(G.key).addPrimitive(prim).setExtras({ group: G.key, label: G.name, color: G.color });
    scene.addChild(doc.createNode(G.key).setMesh(mesh).setExtras({ group: G.key }));
    ageOut.groups[G.key] = { vertices: nv, triangles: m.I.length / 3, rawTriangles: m.rawTris,
      connectedComponents: m.components, keptComponents: m.keptComponents, simplifyRelError: +m.simplifyError.toFixed(4) };
  }
  doc.getRoot().setDefaultScene(scene);
  doc.getRoot().getAsset().generator = 'DevCCFv1 atlas mesh build (surface nets + meshoptimizer)';
  doc.getRoot().getAsset().copyright = 'DevCCFv1 (Kronman et al. 2024; Nova & Kim 2024, doi:10.6084/m9.figshare.26377171), CC BY 4.0; meshes derived (modified)';
  const io = new NodeIO();
  const glb = await io.writeBinary(doc);
  fs.writeFileSync(path.join(outDir, `${age}.glb`), glb);
  ageOut.bytes = glb.byteLength;
  summary.ages.push(ageOut);
  console.log(age, 'bytes', glb.byteLength, 'size µm', ageOut.boundingBoxUm.size, 'secs', (Date.now() - t0) / 1000);
  for (const [k, v] of Object.entries(ageOut.groups)) console.log('  ', k.padEnd(13), JSON.stringify(v));
}
fs.writeFileSync(path.join(outDir, 'build-summary.json'), JSON.stringify(summary, null, 1));
