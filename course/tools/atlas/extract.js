// usage: node extract.js outDir zip... ; extracts only *Annotations* and *MaskBrain* nii.gz entries by basename
const yauzl=require('yauzl'),fs=require('fs'),path=require('path');
const out=process.argv[2];
for (const f of process.argv.slice(3)) {
  yauzl.open(f,{lazyEntries:true},(e,z)=>{ if(e) throw e; z.readEntry();
    z.on('entry',en=>{ const b=path.basename(en.fileName);
      if(/^[A-Za-z0-9._-]+\.nii\.gz$/.test(b) && /(Annotations|MaskBrain)/.test(b)){
        z.openReadStream(en,(e2,s)=>{ if(e2) throw e2; const w=fs.createWriteStream(path.join(out,b)); s.pipe(w); w.on('finish',()=>{console.log(b); z.readEntry();});});
      } else z.readEntry(); });});
}
