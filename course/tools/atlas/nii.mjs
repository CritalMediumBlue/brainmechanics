import * as nifti from 'nifti-reader-js'; import fs from 'fs'; import zlib from 'zlib';
export function load(p){
  const buf=zlib.gunzipSync(fs.readFileSync(p)); const ab=buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);
  const h=nifti.readHeader(ab); const img=nifti.readImage(h,ab);
  const C={2:Uint8Array,4:Int16Array,8:Int32Array,16:Float32Array,64:Float64Array,256:Int8Array,512:Uint16Array,768:Uint32Array}[h.datatypeCode];
  if(!C) throw new Error('dtype '+h.datatypeCode);
  return {h,data:new C(img.slice(0)),dims:h.dims.slice(1,4),pix:h.pixDims.slice(1,4)};
}
