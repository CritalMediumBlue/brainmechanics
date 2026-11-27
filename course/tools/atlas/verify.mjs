// usage: node verify.mjs <atlasDir> <jsDir>
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { createRequire } from 'module';
import { NodeIO } from '@gltf-transform/core'; import { inspect } from '@gltf-transform/functions';
const require = createRequire(import.meta.url);
const [dir, jsDir] = process.argv.slice(2);
const io = new NodeIO(); let total = 0;
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'atlas-groups.json')));
// r0.130 classic GLTFLoader in a vm context with THREE global
const THREE = require('three'); console.log('three', THREE.REVISION);
const ctx = vm.createContext({ THREE, TextDecoder, console, Blob: globalThis.Blob, URL, self: {}, window: {} });
vm.runInContext(fs.readFileSync(require.resolve('three/examples/js/loaders/GLTFLoader.js'), 'utf8'), ctx);
for (const a of meta.ages) {
  const f = path.join(dir, a.file); const bytes = fs.statSync(f).size; total += bytes;
  const doc = await io.read(f);
  let v = 0, t = 0; const names = [];
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) { v += p.getAttribute('POSITION').getCount(); t += p.getIndices().getCount() / 3; names.push(m.getName()); }
  const ab = fs.readFileSync(f); const buf = ab.buffer.slice(ab.byteOffset, ab.byteOffset + ab.byteLength);
  const res = await new Promise((ok, no) => new ctx.THREE.GLTFLoader().parse(buf, '', ok, no));
  const keys = []; const box = new THREE.Box3();
  res.scene.traverse((o) => { if (o.isMesh) { keys.push(o.userData.group); box.expandByObject(o); } });
  const sz = box.getSize(new THREE.Vector3());
  console.log(`${a.age}: ${(bytes / 1024).toFixed(0)} KiB, ${v} vertices, ${t} triangles, meshes [${names}] | r130 GLTFLoader ok, groups [${keys}], size µm (A,D,R) ${sz.toArray().map((x) => x.toFixed(0))}`);
}
console.log('total', (total / 1048576).toFixed(2), 'MiB');
const M = await import(path.join(jsDir, 'atlas-math.js'));
const assert = (c, m) => { if (!c) throw new Error(m); };
assert(M.niceLength(1234) === 1000 && M.niceLength(260) === 200 && M.niceLength(60) === 50 && M.niceLength(0) === 0, 'niceLength');
assert(M.formatLength(1000) === '1 mm' && M.formatLength(500) === '500 µm' && M.formatLength(2500) === '2.5 mm', 'formatLength');
const sb = M.scaleBar(8000, 640, 120); assert(sb.um === 1000 && Math.abs(sb.px - 80) < 1e-9 && sb.label === '1 mm', 'scaleBar ' + JSON.stringify(sb));
const fo = M.fitOrtho(100, 2, 1); assert(fo.halfH === 100 && fo.halfW === 200, 'fitOrtho wide'); const fo2 = M.fitOrtho(100, 0.5, 1); assert(fo2.halfW === 100 && fo2.halfH === 200, 'fitOrtho tall');
assert(M.isClick({ x: 0, y: 0 }, { x: 3, y: 0 }) && !M.isClick({ x: 0, y: 0 }, { x: 5, y: 0 }), 'isClick');
const n = M.toNdc(50, 25, { left: 0, top: 0, width: 100, height: 100 }); assert(n.x === 0 && n.y === 0.5, 'toNdc');
assert(M.hexToInt('#2a78d6') === 0x2a78d6, 'hexToInt'); assert(M.boxRadius({ min: [0, 0, 0], max: [2, 0, 0] }) === 1, 'boxRadius');
assert(M.groupIndex([{ key: 'a' }, { key: 'b' }]).get('b').order === 1, 'groupIndex');
console.log('atlas-math checks ok');
