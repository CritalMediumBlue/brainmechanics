// usage: node writejson.mjs build-summary.json out.json
import fs from 'fs'; import { GROUPS } from './groups.mjs';
const [inp, out] = process.argv.slice(2);
const sum = JSON.parse(fs.readFileSync(inp)); const onto = JSON.parse(fs.readFileSync(new URL('./ontology.json', import.meta.url)));
const byAcr = Object.fromEntries(Object.entries(onto).map(([id, o]) => [o.acr, { id: +id, name: o.name }]));
const labels = Object.values(sum.labels).sort((a, b) => a.id - b.id).map((l) => ({
  id: l.id, acronym: l.acronym, name: l.name, group: l.group, ages: Object.keys(l.voxels),
  ...(l.group ? {} : { excludedBecause: l.ontologyPath?.includes('SpC') ? 'spinal cord (not part of the brain groups)' : 'only assigned to the root neural plate (NP); stray voxels' }) }));
const json = {
  atlas: 'DevCCFv1 (Developmental Mouse Brain Common Coordinate Framework, version 1)',
  source: 'https://doi.org/10.6084/m9.figshare.26377171.v1',
  licence: 'CC BY 4.0',
  units: 'micrometre',
  axes: { x: 'anterior (+) / posterior (-)', y: 'dorsal (+) / ventral (-)', z: 'right (+) / left (-), assuming the NIfTI RAS convention of the source files (the templates are symmetric)' },
  frameNote: 'DevCCF world coordinates (RAS, mm) permuted to (A, S, R), scaled to micrometres, then centred on each age\'s bounding-box centre. Each age is its own template space: positions are not comparable across ages.',
  ages: sum.ages.map((a) => ({ age: a.age, file: a.file, bytes: a.bytes, sourceAnnotation: a.source, voxelSizeUm: a.voxelSizeUm, volumeDims: a.dims,
    boundingBoxUm: a.boundingBoxUm, centreOffsetUm: a.centreOffsetUm,
    meshes: Object.fromEntries(Object.entries(a.groups).map(([k, g]) => [k, { vertices: g.vertices, triangles: g.triangles }])) })),
  groups: GROUPS.map((g) => ({ key: g.key, name: g.name, color: g.color,
    ontology: g.ontology.map((acr) => ({ acronym: acr, id: byAcr[acr]?.id, name: byAcr[acr]?.name })) })),
  labels,
};
fs.writeFileSync(out, JSON.stringify(json, null, 1) + '\n');
console.log(JSON.stringify(json.groups, null, 0));
console.log('excluded', labels.filter((l) => !l.group).map((l) => l.acronym).join(','));
