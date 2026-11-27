import {load} from './nii.mjs';
for(const p of process.argv.slice(2)){ const {h,data,dims,pix}=load(p);
  const cnt=new Map(); for(const v of data) cnt.set(v,(cnt.get(v)||0)+1);
  console.log(p.split('/').pop(),'dtype',h.datatypeCode,'dims',dims,'pix',pix,'units',h.xyzt_units,'qform',h.qform_code,'sform',h.sform_code,'slope',h.scl_slope,h.scl_inter);
  console.log(' affine',JSON.stringify(h.affine.map(r=>r.map(x=>+x.toFixed(4)))),'quat',h.quatern_b,h.quatern_c,h.quatern_d);
  console.log(' nlabels',cnt.size,'labels',[...cnt.keys()].sort((a,b)=>a-b).join(','));
}
