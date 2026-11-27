// Interactive viewer for the DevCCF embryonic brain meshes (assets/atlas/<age>.glb).
//
// Expects the page to have loaded Three.js r0.130 and its classic-script examples so that
// window.THREE, THREE.OrbitControls and THREE.GLTFLoader exist, e.g. in an OJS cell:
//
//   THREE = {
//     const THREE = window.THREE = await require("three@0.130.0/build/three.min.js")
//     await require("three@0.130.0/examples/js/controls/OrbitControls.js").catch(() => {})
//     await require("three@0.130.0/examples/js/loaders/GLTFLoader.js").catch(() => {})
//     return THREE
//   }
//   atlas = FileAttachment("../assets/atlas/atlas-groups.json").json()
//   viewof picked = {
//     const el = atlasViewer({ THREE, url: "../assets/atlas/E13.5.glb", groups: atlas.groups, width })
//     invalidation.then(el.dispose)
//     return el
//   }
//
// Mesh coordinates are micrometres; +x anterior, +y dorsal, +z right. The default view is
// lateral, from the right: anterior points right on screen, dorsal up.
// The returned element has .value (last clicked group or null, with an "input" event, so it
// works with viewof) and .dispose().

import { scaleBar, fitOrtho, isClick, toNdc, hexToInt, groupIndex } from './atlas-math.js';

const VIEWS = {
  lateral: { dir: [0, 0, 1], up: [0, 1, 0] },   // from the right side
  dorsal: { dir: [0, 1, 0], up: [1, 0, 0] },    // from above, anterior up on screen
  frontal: { dir: [1, 0, 0], up: [0, 1, 0] },   // from the front
};

export function atlasViewer({
  THREE = window.THREE, url, groups, width = 640, height = 440,
  onPick = null, hidden = [], view = 'lateral', seeThroughOpacity = 0.28,
} = {}) {
  if (!THREE || !THREE.OrbitControls || !THREE.GLTFLoader) {
    throw new Error('atlasViewer: load three@0.130.0 plus examples/js OrbitControls.js and GLTFLoader.js first');
  }
  const info = groupIndex(groups || []);
  const hiddenSet = new Set(hidden);

  // ---- DOM ---------------------------------------------------------------
  const root = document.createElement('div');
  root.className = 'atlas-viewer';
  root.style.cssText = 'position:relative;color:inherit;font-size:0.85rem;line-height:1.3;max-width:100%;';
  const stage = document.createElement('div');
  stage.style.cssText = `position:relative;width:${width}px;height:${height}px;max-width:100%;touch-action:none;`;
  root.appendChild(stage);

  const overlay = (css) => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;pointer-events:none;color:currentColor;${css}`;
    stage.appendChild(d);
    return d;
  };
  const status = overlay('left:8px;top:6px;opacity:0.8;');
  status.textContent = 'Loading atlas…';
  const hoverLabel = overlay('right:8px;top:6px;font-weight:600;text-align:right;');
  const bar = overlay('left:10px;bottom:10px;');
  const barLine = document.createElement('div');
  barLine.style.cssText = 'border-bottom:2px solid currentColor;border-left:2px solid currentColor;border-right:2px solid currentColor;height:5px;';
  const barText = document.createElement('div');
  bar.append(barText, barLine);
  const axesHint = overlay('right:8px;bottom:8px;opacity:0.7;text-align:right;');

  const controlsRow = document.createElement('div');
  controlsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.3rem 0.9rem;margin-top:0.4rem;align-items:center;';
  root.appendChild(controlsRow);

  // ---- Three.js scene ----------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // transparent: page background shows through
  renderer.domElement.style.cssText = 'display:block;max-width:100%;';
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1e6);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.55));
  const headlight = new THREE.DirectionalLight(0xffffff, 0.6);
  headlight.position.set(0.4, 0.6, 1);
  camera.add(headlight); // light follows the camera, so every side is lit

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; // stop when the reader lets go
  controls.enablePan = true;

  const meshes = new Map(); // key -> THREE.Mesh
  let radius = 5000;
  let hovered = null;
  let seeThrough = false;
  let disposed = false;
  let frame = 0;

  const render = () => {
    frame = 0;
    if (disposed) return;
    renderer.render(scene, camera);
    const vw = (camera.right - camera.left) / camera.zoom;
    const sb = scaleBar(vw, stage.clientWidth || width);
    barLine.style.width = `${sb.px}px`;
    barText.textContent = sb.label;
  };
  const requestRender = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
  controls.addEventListener('change', requestRender);

  const setView = (name) => {
    const v = VIEWS[name] || VIEWS.lateral;
    const aspect = width / height;
    const { halfW, halfH } = fitOrtho(radius, aspect);
    Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH, zoom: 1, near: radius * 0.01, far: radius * 20 });
    camera.up.set(...v.up);
    camera.position.set(v.dir[0] * radius * 4, v.dir[1] * radius * 4, v.dir[2] * radius * 4);
    controls.target.set(0, 0, 0);
    camera.updateProjectionMatrix();
    controls.update();
    axesHint.textContent = { lateral: 'lateral view · anterior → · dorsal ↑', dorsal: 'dorsal view · anterior ↑', frontal: 'frontal view · dorsal ↑' }[name] || '';
    requestRender();
  };

  const paint = (mesh) => {
    const key = mesh.userData.groupKey;
    const m = mesh.material;
    const g = info.get(key);
    m.color.setHex(hexToInt(g ? g.color : '#9aa5b1'));
    m.emissive.setHex(mesh === hovered ? 0x333333 : 0x000000);
    const translucent = seeThrough && key !== 'ventricles';
    m.transparent = translucent;
    m.opacity = translucent ? seeThroughOpacity : 1;
    m.depthWrite = !translucent;
    m.needsUpdate = true;
  };

  // ---- Picking -------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const pickAt = (ev) => {
    const ndc = toNdc(ev.clientX, ev.clientY, renderer.domElement.getBoundingClientRect());
    raycaster.setFromCamera(ndc, camera);
    const visible = [...meshes.values()].filter((m) => m.visible); // r130 raycasts hidden objects too
    const hit = raycaster.intersectObjects(visible, false)[0];
    return hit ? hit.object : null;
  };
  const describe = (mesh) => {
    const key = mesh.userData.groupKey;
    const g = info.get(key);
    return { key, name: g ? g.name : key, color: g ? g.color : null };
  };
  const onMove = (ev) => {
    if (ev.buttons) return; // orbiting
    const m = pickAt(ev);
    if (m === hovered) return;
    const prev = hovered;
    hovered = m;
    if (prev) paint(prev);
    if (m) paint(m);
    hoverLabel.textContent = m ? describe(m).name : '';
    renderer.domElement.style.cursor = m ? 'pointer' : '';
    requestRender();
  };
  const onLeave = () => {
    if (!hovered) return;
    const prev = hovered;
    hovered = null;
    paint(prev);
    hoverLabel.textContent = '';
    requestRender();
  };
  let down = null;
  const onDown = (ev) => { down = { x: ev.clientX, y: ev.clientY }; };
  const onUp = (ev) => {
    if (!down || !isClick(down, { x: ev.clientX, y: ev.clientY })) { down = null; return; }
    down = null;
    const m = pickAt(ev);
    const picked = m ? describe(m) : null;
    root.value = picked;
    hoverLabel.textContent = picked ? picked.name : '';
    root.dispatchEvent(new Event('input', { bubbles: true }));
    if (onPick) onPick(picked);
  };
  const el = renderer.domElement;
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);

  // ---- UI: toggles, see-through, reset ------------------------------------
  const makeCheckbox = (labelNode, checked, onChange) => {
    const lab = document.createElement('label');
    lab.style.cssText = 'display:inline-flex;align-items:center;gap:0.3rem;cursor:pointer;white-space:nowrap;';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = checked;
    cb.addEventListener('change', () => onChange(cb.checked));
    lab.append(cb, labelNode);
    controlsRow.appendChild(lab);
    return cb;
  };
  const buildToggles = () => {
    const keys = [...meshes.keys()].sort((a, b) => (info.get(a)?.order ?? 99) - (info.get(b)?.order ?? 99));
    for (const key of keys) {
      const g = info.get(key);
      const span = document.createElement('span');
      const sw = document.createElement('span');
      sw.style.cssText = `display:inline-block;width:0.8em;height:0.8em;border-radius:2px;margin-right:0.25em;vertical-align:-0.05em;background:${g ? g.color : '#9aa5b1'};`;
      span.append(sw, document.createTextNode(g ? g.name : key));
      makeCheckbox(span, meshes.get(key).visible, (on) => {
        meshes.get(key).visible = on;
        if (!on && hovered === meshes.get(key)) onLeave();
        requestRender();
      });
    }
    makeCheckbox(document.createTextNode('see-through'), false, (on) => {
      seeThrough = on;
      meshes.forEach(paint);
      requestRender();
    });
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset view';
    reset.style.cssText = 'font:inherit;color:inherit;background:transparent;border:1px solid currentColor;border-radius:4px;padding:0 0.5em;cursor:pointer;opacity:0.8;';
    reset.addEventListener('click', () => setView(view));
    controlsRow.appendChild(reset);
  };

  // ---- Load ------------------------------------------------------------------
  new THREE.GLTFLoader().load(url, (gltf) => {
    if (disposed) {
      gltf.scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      return;
    }
    const box = new THREE.Box3();
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const key = o.userData.group || o.parent?.userData?.group || o.name;
      o.userData.groupKey = key;
      o.material?.dispose();
      o.material = new THREE.MeshLambertMaterial({ side: THREE.FrontSide });
      o.visible = !hiddenSet.has(key);
      meshes.set(key, o);
      paint(o);
      box.expandByObject(o);
    });
    scene.add(gltf.scene);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    radius = sphere.radius;
    status.textContent = '';
    buildToggles();
    setView(view);
  }, undefined, (err) => {
    status.textContent = `Could not load ${url}`;
    console.error(err);
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointerup', onUp);
    controls.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
    });
    renderer.dispose();
    renderer.forceContextLoss?.();
  };

  root.value = null;
  root.dispose = dispose;
  return root;
}
