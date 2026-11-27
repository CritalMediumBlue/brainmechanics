// Step-through: play, pause and step back and forth through the recorded
// states ("frames") of an algorithm, with the current line of its code
// highlighted. See chapters/10-dijkstra.qmd and AUTHORING.md.
//
// The algorithm itself records its frames (usually a generator that yields a
// snapshot of its state, including the key of the code line it is on). This
// module only displays them, so it works for any algorithm.
//
//   * clampStep(): pure, tested in tests/pedagogy.test.mjs;
//   * stepper(): `viewof` widget whose value is the current frame;
//   * codePanel(): the code listing with the active line highlighted.

/** Index after moving by `delta` frames, kept inside [0, n - 1]. */
export function clampStep(i, delta, n) {
  if (n < 1) throw new Error("no frames");
  return Math.min(n - 1, Math.max(0, i + delta));
}

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/**
 * Controls for a list of frames, for `viewof`.
 * value = the current frame; `.index` is its position.
 * Keyboard: ← and → step, space plays or pauses (when the widget has focus).
 */
export function stepper(frames, { delay = 900, start = 0 } = {}) {
  const n = frames.length;
  const root = el("div", "st-stepper");
  root.tabIndex = 0;
  const bar = el("div", "st-controls");
  const button = (label, title) => {
    const b = el("button", "btn btn-outline-primary btn-sm", label);
    b.type = "button";
    b.title = title;
    b.setAttribute("aria-label", title);
    return b;
  };
  const first = button("⏮", "First step");
  const back = button("◀", "Previous step");
  const play = button("▶ Play", "Play");
  const next = button("▶|", "Next step");
  const last = button("⏭", "Last step");
  const range = Object.assign(el("input", "st-range"), { type: "range", min: 0, max: n - 1, step: 1 });
  const counter = el("span", "st-counter");
  bar.append(first, back, play, next, last, range, counter);
  root.append(bar);

  let timer = null;
  const emit = () => root.dispatchEvent(new Event("input", { bubbles: true }));
  const go = (i) => {
    root.index = clampStep(i, 0, n);
    root.value = frames[root.index];
    range.value = root.index;
    counter.textContent = `step ${root.index + 1} of ${n}`;
    first.disabled = back.disabled = root.index === 0;
    next.disabled = last.disabled = root.index === n - 1;
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
    play.textContent = "▶ Play";
  };
  const move = (i) => { go(i); emit(); };

  first.onclick = () => { stop(); move(0); };
  back.onclick = () => { stop(); move(root.index - 1); };
  next.onclick = () => { stop(); move(root.index + 1); };
  last.onclick = () => { stop(); move(n - 1); };
  range.oninput = (e) => { e.stopPropagation(); stop(); move(+range.value); };
  play.onclick = () => {
    if (timer) return stop();
    if (root.index === n - 1) move(0);
    play.textContent = "⏸ Pause";
    timer = setInterval(() => {
      // Stop when the widget was removed from the page (OJS re-ran the cell).
      if (!root.isConnected || root.index === n - 1) return stop();
      move(root.index + 1);
    }, delay);
  };
  root.addEventListener("keydown", (e) => {
    if (e.target !== root) return;
    if (e.key === "ArrowRight") { stop(); move(root.index + 1); }
    else if (e.key === "ArrowLeft") { stop(); move(root.index - 1); }
    else if (e.key === " ") play.onclick();
    else return;
    e.preventDefault();
  });

  go(start);
  return root;
}

/**
 * A code listing with one highlighted line.
 * code: [{ key, text }]; active: the key of the current line (or null).
 */
export function codePanel(code, active) {
  const pre = el("pre", "st-code");
  code.forEach(({ key, text }, i) => {
    const line = el("span", key === active ? "st-line st-active" : "st-line");
    line.append(el("span", "st-lineno", String(i + 1).padStart(2)), document.createTextNode(" " + text));
    pre.append(line);
  });
  return pre;
}
