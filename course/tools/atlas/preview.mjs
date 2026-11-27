// usage: node preview.mjs out.png view(lateral|dorsal|frontal) hideCsv file.glb...
import { NodeIO } from '@gltf-transform/core'; import sharp from 'sharp';
const [out, view, hide, ...files] = process.argv.slice(2); const hidden = new Set(hide.split(','));
const W = 360, H = 300; const io = new NodeIO();
const tiles = [];
for (const f of files) {
  const doc = await io.read(f); const img = new Uint8Array(W * H * 3).fill(255); const zb = new Float32Array(W * H).fill(-Infinity);
  const prims = [];
  for (const node of doc.getRoot().listNodes()) { const m = node.getMesh(); if (!m || hidden.has(node.getName())) continue;
    const mat = m.listPrimitives()[0].getMaterial(); const c = mat.getBaseColorFactor().slice(0,3).map(x => Math.round(255 * x ** (1/2.2)));
    prims.push({ P: m.listPrimitives()[0].getAttribute('POSITION').getArray(), I: m.listPrimitives()[0].getIndices().getArray(), c }); }
  // projection: returns [sx, sy, depth]
  const proj = { lateral: (x,y,z)=>[x,y,z], dorsal: (x,y,z)=>[x,-z,y], frontal: (x,y,z)=>[-z,y,x] }[view];
  const scale = +(process.env.SCALE_UM || 9000) / 0.95; // fixed µm range for all ages
  const L = [0.3, 0.5, 0.8]; const ln = Math.hypot(...L);
  for (const { P, I, c } of prims) {
    for (let t = 0; t < I.length; t += 3) {
      const v = [0,1,2].map(k => proj(P[I[t+k]*3], P[I[t+k]*3+1], P[I[t+k]*3+2]));
      const s = v.map(([x,y,z]) => [W/2 + x/scale*W, H/2 - y/scale*W, z]);
      const ux=v[1][0]-v[0][0], uy=v[1][1]-v[0][1], uz=v[1][2]-v[0][2], wx=v[2][0]-v[0][0], wy=v[2][1]-v[0][1], wz=v[2][2]-v[0][2];
      const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const nl=Math.hypot(nx,ny,nz)||1;
      if (nz <= 0) continue; // backface (CCW outward expected)
      const sh = 0.35 + 0.65 * Math.max(0, (nx*L[0]+ny*L[1]+nz*L[2])/nl/ln);
      const minx=Math.max(0,Math.floor(Math.min(s[0][0],s[1][0],s[2][0]))), maxx=Math.min(W-1,Math.ceil(Math.max(s[0][0],s[1][0],s[2][0])));
      const miny=Math.max(0,Math.floor(Math.min(s[0][1],s[1][1],s[2][1]))), maxy=Math.min(H-1,Math.ceil(Math.max(s[0][1],s[1][1],s[2][1])));
      const area=(s[1][0]-s[0][0])*(s[2][1]-s[0][1])-(s[2][0]-s[0][0])*(s[1][1]-s[0][1]); if (Math.abs(area)<1e-9) continue;
      for (let py=miny; py<=maxy; py++) for (let px=minx; px<=maxx; px++) {
        const X=px+0.5, Y=py+0.5;
        const w0=((s[1][0]-X)*(s[2][1]-Y)-(s[2][0]-X)*(s[1][1]-Y))/area, w1=((s[2][0]-X)*(s[0][1]-Y)-(s[0][0]-X)*(s[2][1]-Y))/area, w2=1-w0-w1;
        if (w0<0||w1<0||w2<0) continue; const z=w0*s[0][2]+w1*s[1][2]+w2*s[2][2]; const o=py*W+px;
        if (z>zb[o]) { zb[o]=z; img[o*3]=c[0]*sh; img[o*3+1]=c[1]*sh; img[o*3+2]=c[2]*sh; }
      }
    }
  }
  tiles.push(await sharp(Buffer.from(img), { raw: { width: W, height: H, channels: 3 } }).png().toBuffer());
}
await sharp({ create: { width: W * tiles.length, height: H, channels: 3, background: '#fff' } })
  .composite(tiles.map((t, i) => ({ input: t, left: i * W, top: 0 }))).png().toFile(out);
