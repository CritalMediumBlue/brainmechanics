// Pure mesh helpers: blur, surface nets, component filtering, Taubin smoothing, normals.

// Separable Gaussian blur of a Float32 volume (in place returns new array).
export function gaussianBlur3D(vol, dims, sigma) {
  const [nx, ny, nz] = dims;
  const r = Math.max(1, Math.ceil(3 * sigma));
  const k = new Float32Array(2 * r + 1);
  let s = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); s += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= s;
  let src = vol, dst = new Float32Array(vol.length);
  const strides = [1, nx, nx * ny], sizes = [nx, ny, nz];
  for (let axis = 0; axis < 3; axis++) {
    const st = strides[axis], n = sizes[axis];
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const c = [x, y, z][axis];
      const base = x + nx * (y + ny * z) - c * st;
      let acc = 0;
      for (let t = -r; t <= r; t++) {
        const cc = c + t;
        if (cc < 0 || cc >= n) continue; // zero padding outside
        acc += k[t + r] * src[base + cc * st];
      }
      dst[base + c * st] = acc;
    }
    const tmp = src === vol ? new Float32Array(vol.length) : src;
    src = dst; dst = tmp;
  }
  return src;
}

// Naive surface nets on a scalar field; inside where f > iso.
// Returns positions (in sample index coords) and triangle indices, outward-facing (CCW).
export function surfaceNets(f, dims, iso) {
  const [nx, ny, nz] = dims;
  const idx = (x, y, z) => x + nx * (y + ny * z);
  const cellVert = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const cidx = (x, y, z) => x + (nx - 1) * (y + (ny - 1) * z);
  const pos = [];
  const cornerOff = [];
  for (let c = 0; c < 8; c++) cornerOff.push([c & 1, (c >> 1) & 1, (c >> 2) & 1]);
  const edges = [];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const d = a ^ b; if (d === 1 || d === 2 || d === 4) edges.push([a, b]);
  }
  const v = new Float32Array(8);
  for (let z = 0; z < nz - 1; z++) for (let y = 0; y < ny - 1; y++) for (let x = 0; x < nx - 1; x++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) {
      const o = cornerOff[c];
      v[c] = f[idx(x + o[0], y + o[1], z + o[2])] - iso;
      if (v[c] > 0) mask |= 1 << c;
    }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of edges) {
      const ia = (mask >> a) & 1, ib = (mask >> b) & 1;
      if (ia === ib) continue;
      const t = v[a] / (v[a] - v[b]);
      const oa = cornerOff[a], ob = cornerOff[b];
      sx += oa[0] + t * (ob[0] - oa[0]); sy += oa[1] + t * (ob[1] - oa[1]); sz += oa[2] + t * (ob[2] - oa[2]); n++;
    }
    cellVert[cidx(x, y, z)] = pos.length / 3;
    pos.push(x + sx / n, y + sy / n, z + sz / n);
  }
  const tris = [];
  const e = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let z = 1; z < nz - 1; z++) for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
    const f0 = f[idx(x, y, z)] > iso;
    for (let d = 0; d < 3; d++) {
      const x1 = x + e[d][0], y1 = y + e[d][1], z1 = z + e[d][2];
      if (x1 >= nx || y1 >= ny || z1 >= nz) continue;
      const f1 = f[idx(x1, y1, z1)] > iso;
      if (f0 === f1) continue;
      const u = e[(d + 1) % 3], w = e[(d + 2) % 3];
      // cells sharing this edge, CCW around +d: (0,0), (-u), (-u-w), (-w)
      const q = [
        cellVert[cidx(x, y, z)],
        cellVert[cidx(x - u[0], y - u[1], z - u[2])],
        cellVert[cidx(x - u[0] - w[0], y - u[1] - w[1], z - u[2] - w[2])],
        cellVert[cidx(x - w[0], y - w[1], z - w[2])],
      ];
      if (q.some((i) => i < 0)) continue;
      if (f0) { tris.push(q[0], q[1], q[2], q[0], q[2], q[3]); } // normal +d (inside -> outside)
      else { tris.push(q[0], q[2], q[1], q[0], q[3], q[2]); }
    }
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(tris) };
}

export function signedVolume(P, I) {
  let s = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    s += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1])
       - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c])
       + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]);
  }
  return s / 6;
}

// Drop connected components with fewer than minTris triangles; compact vertices.
export function filterComponents(P, I, minFrac, minAbs) {
  const nv = P.length / 3, parent = new Int32Array(nv);
  for (let i = 0; i < nv; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let t = 0; t < I.length; t += 3) {
    const a = find(I[t]), b = find(I[t + 1]), c = find(I[t + 2]);
    parent[b] = a; parent[find(c)] = a;
  }
  const cnt = new Map();
  for (let t = 0; t < I.length; t += 3) { const r = find(I[t]); cnt.set(r, (cnt.get(r) || 0) + 1); }
  const total = I.length / 3, thr = Math.max(minAbs, minFrac * total);
  const keep = [];
  for (let t = 0; t < I.length; t += 3) if (cnt.get(find(I[t])) >= thr) keep.push(I[t], I[t + 1], I[t + 2]);
  const kept = [...cnt.values()].filter((n) => n >= thr).length;
  return { ...compact(P, new Uint32Array(keep)), components: cnt.size, keptComponents: kept };
}

export function compact(P, I) {
  const map = new Int32Array(P.length / 3).fill(-1);
  const out = []; const NI = new Uint32Array(I.length);
  for (let i = 0; i < I.length; i++) {
    let m = map[I[i]];
    if (m < 0) { m = map[I[i]] = out.length / 3; out.push(P[I[i] * 3], P[I[i] * 3 + 1], P[I[i] * 3 + 2]); }
    NI[i] = m;
  }
  return { positions: new Float32Array(out), indices: NI };
}

// Taubin (lambda|mu) smoothing with uniform umbrella weights.
export function taubin(P, I, iterations, lambda = 0.5, mu = -0.53) {
  const nv = P.length / 3;
  const nbr = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t], b = I[t + 1], c = I[t + 2];
    nbr[a].add(b); nbr[a].add(c); nbr[b].add(a); nbr[b].add(c); nbr[c].add(a); nbr[c].add(b);
  }
  const adj = nbr.map((s) => Int32Array.from(s));
  let cur = Float32Array.from(P);
  const step = (fac) => {
    const nxt = new Float32Array(cur.length);
    for (let i = 0; i < nv; i++) {
      const n = adj[i]; let x = 0, y = 0, z = 0;
      for (const j of n) { x += cur[j * 3]; y += cur[j * 3 + 1]; z += cur[j * 3 + 2]; }
      const k = n.length || 1;
      nxt[i * 3] = cur[i * 3] + fac * (x / k - cur[i * 3]);
      nxt[i * 3 + 1] = cur[i * 3 + 1] + fac * (y / k - cur[i * 3 + 1]);
      nxt[i * 3 + 2] = cur[i * 3 + 2] + fac * (z / k - cur[i * 3 + 2]);
    }
    cur = nxt;
  };
  for (let it = 0; it < iterations; it++) { step(lambda); step(mu); }
  return cur;
}

export function vertexNormals(P, I) {
  const N = new Float32Array(P.length);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const o of [a, b, c]) { N[o] += nx; N[o + 1] += ny; N[o + 2] += nz; }
  }
  for (let i = 0; i < N.length; i += 3) {
    const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1;
    N[i] /= l; N[i + 1] /= l; N[i + 2] /= l;
  }
  return N;
}
