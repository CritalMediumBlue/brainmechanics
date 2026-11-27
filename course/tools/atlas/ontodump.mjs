import XLSX from 'xlsx'; import fs from 'fs'; import {load} from './nii.mjs';
const wb=XLSX.read(fs.readFileSync(process.argv[2])); const rows=XLSX.utils.sheet_to_json(wb.Sheets['DevCCFv1_Ontology'],{header:1}).slice(2);
const byId=new Map(); for(const r of rows){ byId.set(+r[8],{acr:r[1],name:r[10],path:String(r[12]).split('/').filter(Boolean).map(Number),hex:r[5]}); }
fs.writeFileSync(process.argv[3], JSON.stringify(Object.fromEntries(byId)));
const all=new Map();
for(const p of process.argv.slice(4)){ const {data}=load(p); const c=new Map(); for(const v of data) if(v) c.set(v,(c.get(v)||0)+1); const age=p.match(/E\d+-5/)[0]; for(const [k,n] of c){ if(!all.has(k)) all.set(k,{}); all.get(k)[age]=n; } }
for(const k of [...all.keys()].sort((a,b)=>a-b)){ const o=byId.get(k); console.log(k, o?o.acr:'??', '|', o?o.name:'', '|', o?o.path.slice(1).map(i=>byId.get(i)?.acr).join('/'):'', '|', JSON.stringify(all.get(k))); }
