// Pure helpers for atlas-viewer.js: no DOM, no THREE. Testable in Node.
// All lengths are in micrometres (the unit of the atlas meshes).

// Largest "nice" length (1, 2 or 5 x 10^n µm) that is at most maxUm.
export function niceLength(maxUm) {
  if (!(maxUm > 0)) return 0;
  const p = 10 ** Math.floor(Math.log10(maxUm));
  for (const m of [5, 2, 1]) if (m * p <= maxUm) return m * p;
  return p;
}

// Human-readable length: mm for >= 1 mm, µm below.
export function formatLength(um) {
  if (um >= 1000) return `${+(um / 1000).toPrecision(3)} mm`;
  return `${+um.toPrecision(3)} µm`;
}

// Scale bar for an orthographic view: viewWidthUm is the visible world width,
// pixelWidth the canvas width in CSS pixels; the bar is at most targetPx long.
export function scaleBar(viewWidthUm, pixelWidth, targetPx = 120) {
  const umPerPx = viewWidthUm / pixelWidth;
  const um = niceLength(umPerPx * targetPx);
  return { um, px: um / umPerPx, label: formatLength(um) };
}

// Orthographic frustum half-sizes that fit a sphere of `radius` into a viewport of
// the given aspect ratio (width / height), with a margin factor.
export function fitOrtho(radius, aspect, margin = 1.1) {
  const halfH = aspect >= 1 ? radius * margin : (radius * margin) / aspect;
  return { halfW: halfH * aspect, halfH };
}

// Radius of the bounding sphere of an axis-aligned box given as {min:[x,y,z], max:[x,y,z]}.
export function boxRadius(box) {
  return Math.hypot(box.max[0] - box.min[0], box.max[1] - box.min[1], box.max[2] - box.min[2]) / 2;
}

// A pointer gesture counts as a click (not an orbit drag) if it moved less than tolPx.
export function isClick(down, up, tolPx = 4) {
  return Math.hypot(up.x - down.x, up.y - down.y) < tolPx;
}

// Pointer position in normalised device coordinates (-1..1, y up).
export function toNdc(clientX, clientY, rect) {
  return { x: ((clientX - rect.left) / rect.width) * 2 - 1, y: -((clientY - rect.top) / rect.height) * 2 + 1 };
}

// "#2a78d6" -> 0x2a78d6
export function hexToInt(hex) {
  return parseInt(String(hex).replace('#', ''), 16);
}

// Index groups by key, keeping the order given.
export function groupIndex(groups) {
  return new Map(groups.map((g, i) => [g.key, { ...g, order: i }]));
}
