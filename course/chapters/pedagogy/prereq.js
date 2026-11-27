// Prerequisite check: a few quick questions at the start of an explanation.
// Each wrong answer points the reader to a short refresher (a collapsed
// callout further down the page) and opens it. A static page cannot adapt to
// its reader in any other way. See AUTHORING.md, "Prerequisite check".
//
//   * diagnose(): pure, tested in tests/pedagogy.test.mjs;
//   * prereqCheck(): `viewof` widget, value = diagnose() result or null.

/**
 * questions: [{ prompt, options, answer, topic, refresher }]
 * answers:   one chosen option (or undefined) per question
 * Returns { ready, score, review: [{ topic, refresher }] } where `review`
 * lists each distinct refresher needed, in question order.
 */
export function diagnose(questions, answers) {
  if (answers.length !== questions.length) throw new Error("one answer per question");
  const review = [];
  let score = 0;
  questions.forEach((q, i) => {
    if (!q.options.includes(q.answer)) throw new Error(`answer not among the options: ${q.answer}`);
    if (answers[i] === q.answer) score++;
    else if (!review.some((r) => r.refresher === q.refresher)) review.push({ topic: q.topic, refresher: q.refresher });
  });
  return { ready: review.length === 0, score, review };
}

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/** Expand a collapsed Quarto callout (by the id of its outer div) and scroll to it. */
export function openCallout(id) {
  const box = document.getElementById(id);
  if (!box) return;
  const body = box.querySelector(".callout-collapse");
  if (body && !body.classList.contains("show")) {
    const B = window.bootstrap;
    if (B?.Collapse) B.Collapse.getOrCreateInstance(body).show();
    else body.classList.add("show");
  }
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

const typeset = (node) => window.MathJax?.typesetPromise?.([node]).catch(() => {});

/**
 * The widget. Prompts may contain inline TeX as \( ... \).
 * `next`: id of the section to continue with when the reader is ready.
 */
export function prereqCheck({ questions, next, title = "Before you start" }) {
  const root = el("div", "pr-check");
  root.append(el("div", "pr-title", title));
  const pick = questions.map((q, i) => {
    const box = el("div", "pr-question");
    box.append(el("div", "pr-prompt", `${i + 1}. ${q.prompt}`));
    const name = `pr-${Math.random().toString(36).slice(2)}`;
    const radios = q.options.map((opt) => {
      const lab = el("label", "pq-option");
      const r = Object.assign(el("input"), { type: "radio", name, value: opt });
      lab.append(r, document.createTextNode(" " + opt));
      box.append(lab);
      return r;
    });
    const mark = el("span", "pr-mark");
    box.append(mark);
    root.append(box);
    return { radios, mark };
  });
  const button = el("button", "btn btn-primary btn-sm", "Check my answers");
  button.type = "button";
  const result = el("div", "pr-result");
  root.append(button, result);
  root.value = null;

  button.onclick = () => {
    const answers = pick.map(({ radios }) => radios.find((r) => r.checked)?.value);
    const d = diagnose(questions, answers);
    pick.forEach(({ mark }, i) => {
      const ok = answers[i] === questions[i].answer;
      mark.textContent = ok ? " ✓" : answers[i] === undefined ? " (no answer)" : " ✗";
      mark.className = `pr-mark ${ok ? "pq-correct" : "pq-wrong"}`;
    });
    result.replaceChildren();
    if (d.ready) {
      result.append(el("strong", "pq-correct", "You have the background for this explanation. "));
      if (next) {
        const a = el("a", "", "Continue.");
        a.href = `#${next}`;
        result.append(a);
      }
    } else {
      result.append(el("span", "", `${d.score} of ${questions.length} correct. Read these short refreshers first: `));
      d.review.forEach((r, i) => {
        const a = el("a", "", r.topic);
        a.href = `#${r.refresher}`;
        a.onclick = (e) => { e.preventDefault(); openCallout(r.refresher); };
        result.append(a, document.createTextNode(i < d.review.length - 1 ? ", " : "."));
      });
    }
    root.value = d;
    root.dispatchEvent(new Event("input", { bubbles: true }));
  };
  root.addEventListener("input", (e) => { if (e.target !== root) e.stopPropagation(); });
  typeset(root);
  return root;
}
