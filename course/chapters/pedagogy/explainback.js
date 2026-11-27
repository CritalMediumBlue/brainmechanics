// Explain it back: the reader writes an explanation in their own words, then
// compares it with a model answer and a checklist of key points. Writing
// exposes gaps that rereading hides. See AUTHORING.md, "Explain it back".
//
//   * wordCount(), coverage(): pure, tested in tests/pedagogy.test.mjs;
//   * explainBack(): the widget. The draft is kept in the browser (localStorage),
//     so it survives a reload; nothing is sent anywhere.

export function wordCount(text) {
  return (text.trim().match(/\S+/g) ?? []).length;
}

/**
 * For each key point, whether the text seems to mention it: true if any of
 * its `cues` (case-insensitive regular expressions) matches. This is only a
 * hint for the reader, who decides whether the point is really covered.
 */
export function coverage(text, points) {
  return points.map((p) => p.cues.some((c) => new RegExp(c, "i").test(text)));
}

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

const store = {
  get(k) { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
};

/**
 * id      unique key for the stored draft
 * prompt  the question (plain text; inline TeX as \( ... \))
 * model   the model answer (HTML string)
 * points  [{ text, cues: [regex strings] }]
 */
export function explainBack({ id, prompt, model, points, minWords = 25 }) {
  const key = `explainback:${id}`;
  const root = el("div", "eb-box");
  root.append(el("div", "pq-prompt", prompt));
  const area = Object.assign(el("textarea", "eb-text form-control"), { rows: 5, value: store.get(key) });
  area.placeholder = "Write as if explaining to a friend who missed this section. No peeking at the text above.";
  const status = el("div", "eb-status");
  const button = el("button", "btn btn-primary btn-sm", "Compare with a model answer");
  button.type = "button";
  const reveal = el("div", "eb-reveal");
  reveal.hidden = true;
  root.append(area, status, button, reveal);

  const update = () => {
    const n = wordCount(area.value);
    button.disabled = n < minWords;
    status.textContent = n < minWords ? `${n} words. Write at least ${minWords} before comparing.` : `${n} words.`;
    store.set(key, area.value);
  };
  area.addEventListener("input", (e) => { e.stopPropagation(); update(); });
  update();

  button.onclick = () => {
    const seen = coverage(area.value, points);
    const list = el("ul", "eb-points");
    const tally = el("div", "eb-tally");
    const boxes = points.map((p, i) => {
      const li = el("li");
      const lab = el("label");
      const cb = Object.assign(el("input"), { type: "checkbox" });
      lab.append(cb, document.createTextNode(" " + p.text));
      li.append(lab);
      if (seen[i]) li.append(el("span", "eb-seen", " (your text seems to mention this)"));
      list.append(li);
      return cb;
    });
    const recount = () => {
      const k = boxes.filter((b) => b.checked).length;
      tally.textContent = k === points.length
        ? "Every key point covered. Well done."
        : `${k} of ${points.length} points ticked. Add the missing ones to your text in your own words, then compare again.`;
    };
    boxes.forEach((b) => (b.onchange = recount));
    const answer = el("div", "eb-model");
    answer.innerHTML = model;
    reveal.replaceChildren(
      el("div", "pr-title", "A model answer"), answer,
      el("div", "pr-title", "Tick each point your explanation really makes"), list, tally
    );
    recount();
    reveal.hidden = false;
    window.MathJax?.typesetPromise?.([reveal]).catch(() => {});
  };
  window.MathJax?.typesetPromise?.([root]).catch(() => {});
  return root;
}
