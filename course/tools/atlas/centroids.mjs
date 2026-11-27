import fs from 'fs'; import {load} from './nii.mjs'; import {GROUPS,assign} from './groups.mjs';
const onto=JSON.parse(fs.readFileSync('ontology.json'));
for(const p of process.argv.slice(2)){ const {h,data,dims}=load(p); const A=h.affine; const [nx,ny,nz]=dims;
  const acc={}; const lut=new Map();
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ const v=data[i+nx*(j+ny*k)]; if(!v) continue;
    let g=lut.get(v); if(g===undefined){g=assign(onto,v)||'other:'+(onto[v]?.path.map(x=>onto[x]?.acr)[1]||v); lut.set(v,g);}
    const a=acc[g]||(acc[g]={n:0,x:0,y:0,z:0}); a.n++;
    a.x+=A[0][0]*i+A[0][1]*j+A[0][2]*k+A[0][3]; a.y+=A[1][0]*i+A[1][1]*j+A[1][2]*k+A[1][3]; a.z+=A[2][0]*i+A[2][1]*j+A[2][2]*k+A[2][3]; }
  console.log(p.split('/').pop()); for(const [g,a] of Object.entries(acc)) console.log('  ',g.padEnd(14),a.n,'x',(a.x/a.n).toFixed(2),'y',(a.y/a.n).toFixed(2),'z',(a.z/a.n).toFixed(2));
}
