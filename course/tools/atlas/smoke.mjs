// Smoke test of atlas-viewer.js under jsdom with real three r0.130 (scene, raycaster,
// OrbitControls, GLTFLoader) and a stubbed WebGLRenderer (no GPU here).
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { createRequire } from 'module'; import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
const [glb, viewerPath] = process.argv.slice(2);
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
const { window } = dom;
for (const k of ['window', 'document', 'Event', 'HTMLElement', 'requestAnimationFrame', 'cancelAnimationFrame']) globalThis[k] = k === 'window' ? window : window[k];
const THREE = { ...require('three') };
let renders = 0, disposedRenderer = false;
THREE.WebGLRenderer = class { constructor() { this.domElement = window.document.createElement('canvas'); this.domElement.getBoundingClientRect = () => ({ left: 0, top: 0, width: 640, height: 440 }); }
  setPixelRatio() {} setSize() {} setClearColor() {} render() { renders++; } dispose() { disposedRenderer = true; } forceContextLoss() {} };
const ctx = vm.createContext({ THREE, window, document: window.document, TextDecoder, console, self: window, URL, Blob, setTimeout });
vm.runInContext(fs.readFileSync(require.resolve('three/examples/js/controls/OrbitControls.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(require.resolve('three/examples/js/loaders/GLTFLoader.js'), 'utf8'), ctx);
const realParse = THREE.GLTFLoader.prototype.parse;
THREE.GLTFLoader.prototype.load = function (url, onLoad, _p, onError) { const b = fs.readFileSync(url); realParse.call(this, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '', onLoad, onError); };
window.THREE = THREE;
const { atlasViewer } = await import(viewerPath);
const groups = JSON.parse(fs.readFileSync(path.join(path.dirname(glb), 'atlas-groups.json'))).groups;
const picks = [];
const el = atlasViewer({ THREE, url: glb, groups, width: 640, height: 440, onPick: (p) => picks.push(p), hidden: ['ventricles'] });
document.body.appendChild(el);
await new Promise((r) => setTimeout(r, 300));
const boxes = el.querySelectorAll('input[type=checkbox]');
console.log('checkboxes', boxes.length, [...el.querySelectorAll('label')].map((l) => l.textContent).join(' | '));
console.log('renders after load', renders, 'scale bar:', el.textContent.match(/\d+(\.\d+)? (mm|µm)/)?.[0]);
const canvas = el.querySelector('canvas'); canvas.setPointerCapture = () => {}; canvas.releasePointerCapture = () => {};
const fire = (type, x, y) => canvas.dispatchEvent(Object.assign(new window.MouseEvent(type, { clientX: x, clientY: y, buttons: 0, bubbles: true }), { pointerType: 'mouse', pointerId: 1 }));
let inputEvents = 0; el.addEventListener('input', () => inputEvents++);
fire('pointermove', 320, 220); await new Promise((r) => setTimeout(r, 50));
console.log('hover label at centre:', JSON.stringify(el.querySelector('div > div:nth-child(3)')?.textContent));
fire('pointerdown', 320, 220); fire('pointerup', 321, 220);
console.log('click centre ->', JSON.stringify(el.value), 'input events', inputEvents, 'onPick calls', picks.length);
fire('pointerdown', 5, 5); fire('pointerup', 5, 5);
console.log('click empty corner ->', JSON.stringify(el.value));
// toggle the picked group off and click again: must pick something else or nothing
const firstKey = picks[0]?.key; const idx = groups.findIndex((g) => g.key === firstKey);
boxes[idx].checked = false; boxes[idx].dispatchEvent(new window.Event('change'));
fire('pointerdown', 320, 220); fire('pointerup', 320, 220);
console.log('after hiding', firstKey, '->', JSON.stringify(el.value?.key ?? null));
// see-through + reset
boxes[boxes.length - 1].checked = true; boxes[boxes.length - 1].dispatchEvent(new window.Event('change'));
el.querySelector('button').click(); await new Promise((r) => setTimeout(r, 50));
el.dispose(); el.dispose();
console.log('disposed renderer', disposedRenderer, 'total renders', renders);
window.close();
