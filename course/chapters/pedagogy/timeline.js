// Developmental timeline: events at embryonic (E) and postnatal (P) ages,
// one lane per species, each event with its source. Clicking an event shows
// its text and citation. See AUTHORING.md, "Developmental timeline".
//
// Embryonic and postnatal days are drawn on two separate segments with a
// "birth" break between them, so the widget never needs a gestation length
// (which differs between species and is easy to get wrong).
// Lanes share the label scale, not developmental equivalence: E12 in a rat is
// not E12 in a mouse. The widget says so under the axis.
//
//   * parseAge(), agePosition(), laneOrder(): pure, tested in tests/timeline.test.mjs;
//   * timeline(): `viewof` widget whose value is the selected event (or null).

/** "E10.5" -> { phase: "E", day: 10.5 }; "P0" -> { phase: "P", day: 0 }. */
export function parseAge(label) {
  const m = /^\s*([EP])\s*(\d+(?:\.\d+)?)\s*$/i.exec(String(label));
  if (!m) throw new Error(`age must look like E10.5 or P14, got "${label}"`);
  return { phase: m[1].toUpperCase(), day: Number(m[2]) };
}

/**
 * Horizontal position in [0, 1] of an age label.
 * The embryonic segment [0, split - gap/2] covers E0..eMax, the postnatal
 * segment [split + gap/2, 1] covers P0..pMax.
 */
export function agePosition(label, { eMax = 19, pMax = 28, split = 0.62, gap = 0.04 } = {}) {
  const { phase, day } = parseAge(label);
  if (phase === "E") {
    if (day > eMax) throw new Error(`${label} is beyond eMax = E${eMax}`);
    return (day / eMax) * (split - gap / 2);
  }
  if (day > pMax) throw new Error(`${label} is beyond pMax = P${pMax}`);
  return split + gap / 2 + (day / pMax) * (1 - split - gap / 2);
}

/** Species in first-appearance order, with `first` (if present) on top. */
export function laneOrder(events, first = "mouse") {
  const seen = [];
  for (const e of events) if (!seen.includes(e.species)) seen.push(e.species);
  return seen.includes(first) ? [first, ...seen.filter((s) => s !== first)] : seen;
}

const SVG = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/**
 * events: [{ age: "E10.5", end?: "E12", species: "mouse", label: "short", text: "longer", cite: "@key, p. 3" }]
 * colors: { mouse: "#2a78d6", rat: "#eb6834", ... }
 * Value: the selected event, or null. Keyboard: Tab to an event, Enter/space selects it.
 */
export function timeline(events, { width = 640, colors = {}, eMax = 19, pMax = 28, ticks, note } = {}) {
  const lanes = laneOrder(events);
  const left = 70, right = 12, top = 10, laneH = 34, axisH = 34;
  const h = top + lanes.length * laneH + axisH;
  const x = (a) => left + agePosition(a, { eMax, pMax }) * (width - left - right);
  const root = el("div", "tl-timeline");
  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${h}`, width, height: h, role: "group",
                             "aria-label": "Developmental timeline", class: "tl-svg" });
  root.append(svg);

  // Axis with a birth break.
  const yAxis = top + lanes.length * laneH + 6;
  const eEnd = x(`E${eMax}`), pStart = x("P0");
  svg.append(svgEl("line", { x1: left, x2: eEnd, y1: yAxis, y2: yAxis, class: "tl-axis" }));
  svg.append(svgEl("line", { x1: pStart, x2: width - right, y1: yAxis, y2: yAxis, class: "tl-axis" }));
  const birth = svgEl("text", { x: (eEnd + pStart) / 2, y: yAxis + 26, class: "tl-birth", "text-anchor": "middle" });
  birth.textContent = "birth";
  svg.append(birth);
  const tickLabels = ticks ?? ["E0", "E5", "E10", "E15", "P0", "P7", "P14", "P21", "P28"].filter((t) => {
    const { phase, day } = parseAge(t);
    return phase === "E" ? day <= eMax : day <= pMax;
  });
  for (const t of tickLabels) {
    const tx = x(t);
    svg.append(svgEl("line", { x1: tx, x2: tx, y1: yAxis, y2: yAxis + 4, class: "tl-axis" }));
    const lab = svgEl("text", { x: tx, y: yAxis + 15, "text-anchor": "middle", class: "tl-tick" });
    lab.textContent = t;
    svg.append(lab);
  }

  // Lanes and events.
  const marks = [];
  lanes.forEach((sp, i) => {
    const y = top + i * laneH + laneH / 2;
    const name = svgEl("text", { x: left - 8, y: y + 4, "text-anchor": "end", class: "tl-lane" });
    name.textContent = sp;
    svg.append(name);
    svg.append(svgEl("line", { x1: left, x2: width - right, y1: y, y2: y, class: "tl-guide" }));
    for (const ev of events.filter((e) => e.species === sp)) {
      const color = colors[sp] ?? "currentColor";
      const g = svgEl("g", { class: "tl-event", tabindex: 0, role: "button",
                             "aria-label": `${ev.age}${ev.end ? "–" + ev.end : ""}, ${sp}: ${ev.label}` });
      const x0 = x(ev.age);
      if (ev.end) {
        g.append(svgEl("rect", { x: x0, y: y - 5, width: Math.max(4, x(ev.end) - x0), height: 10, rx: 5, fill: color, opacity: 0.55 }));
      }
      g.append(svgEl("circle", { cx: x0, cy: y, r: 6, fill: color }));
      const title = svgEl("title");
      title.textContent = `${ev.age}${ev.end ? "–" + ev.end : ""}: ${ev.label}`;
      g.append(title);
      svg.append(g);
      marks.push([g, ev]);
    }
  });

  const caption = el("div", "tl-note", note ?? "Lanes share the age labels, not developmental equivalence: the same E-day is a different stage in different species.");
  const detail = el("div", "tl-detail", "Select an event to see what happens and where the evidence comes from.");
  root.append(caption, detail);

  root.value = null;
  const select = (g, ev) => {
    marks.forEach(([m]) => m.classList.toggle("tl-selected", m === g));
    detail.replaceChildren(
      el("strong", null, `${ev.age}${ev.end ? "–" + ev.end : ""} (${ev.species}): ${ev.label}. `),
      document.createTextNode(ev.text ?? ""),
      ev.cite ? el("span", "tl-cite", ` Source: ${ev.cite}.`) : document.createTextNode("")
    );
    root.value = ev;
    root.dispatchEvent(new Event("input", { bubbles: true }));
  };
  for (const [g, ev] of marks) {
    g.addEventListener("click", () => select(g, ev));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(g, ev); }
    });
  }
  return root;
}
