const yauzl=require('yauzl');
for (const f of process.argv.slice(2)) {
  yauzl.open(f,{lazyEntries:true},(e,z)=>{ if(e) throw e; z.readEntry(); z.on('entry',en=>{console.log(f.split('/').pop(), en.fileName, en.uncompressedSize); z.readEntry();});});
}
