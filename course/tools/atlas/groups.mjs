// Group definitions: each fine DevCCF label is assigned by its ancestor in the DevCCFv1 ontology (Structure ID Path16).
// Order matters: first matching ancestor wins.
export const GROUPS = [
  { key:'pallium',      name:'Pallium (cortex anlage)',          ontology:['Pall','TelR'], color:'#2a78d6' },
  { key:'subpallium',   name:'Subpallium (basal ganglia anlage)', ontology:['SPall'],      color:'#eb6834' },
  { key:'hypothalamus', name:'Hypothalamus and preoptic area',   ontology:['PHy','THy','POTel'], color:'#1baf7a' },
  { key:'diencephalon', name:'Diencephalon (prosomeres p1-p3)',  ontology:['D'],          color:'#eda100' },
  { key:'midbrain',     name:'Midbrain (mesencephalon m1-m2)',   ontology:['M'],          color:'#8e5ed6' },
  { key:'hindbrain',    name:'Hindbrain (rhombomeres r0-r11)',   ontology:['H'],          color:'#e34948' },
  { key:'ventricles',   name:'Ventricles',                       ontology:['ventricles'], color:'#9aa5b1' },
];
export function assign(onto, id){ // onto: {id:{acr,name,path:[ids]}}
  const o=onto[id]; if(!o) return null;
  const acrs=o.path.map(i=>onto[i]?.acr);
  for(const g of GROUPS) if(g.ontology.some(a=>acrs.includes(a))) return g.key;
  return null;
}
