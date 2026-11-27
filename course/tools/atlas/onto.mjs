import XLSX from 'xlsx'; import fs from 'fs';
const wb=XLSX.read(fs.readFileSync(process.argv[2]));
for(const n of wb.SheetNames){ const rows=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1}); console.log('SHEET',n,rows.length); for(const r of rows.slice(0,6)) console.log(JSON.stringify(r)); }
