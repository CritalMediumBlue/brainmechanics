// Predict, then check: the reader commits to a prediction before the figure
// that answers it is unlocked. See chapters/08-predict.qmd.
//
// Two layers, so that the logic can be tested without a browser:
//   * grade(), relativeError(): pure functions (tests/predict.test.mjs);
//   * predictGate(), targetMeter(): DOM widgets for OJS. predictGate follows
//     the `viewof` contract: an element with a `.value` that dispatches an
//     "input" event whenever the value changes.
//
// Plain DOM, no dependencies. Styling lives in assets/pedagogy.css and uses
// Bootstrap's CSS variables, so light and dark themes both work.

// ---------------------------------------------------------------------------
// Pure logic
// ---------------------------------------------------------------------------

/**
 * Grade a guess against a question spec.
 *
 * Choice spec:  { kind: "choice", options: [...], answer, feedback: { option: text } }
 * Number spec:  { kind: "number", answer, tol, feedback: { low, high, close } }
 *
 * Feedback is diagnostic: each wrong choice, and each direction of a wrong
 * number, maps to the misconception that typically produces it.
 *
 * @returns {{ correct: boolean, message: string, error?: number }}
 */
export function grade(spec, guess) {
  if (spec.kind === "choice") {
    if (!spec.options.includes(guess)) throw new Error(`unknown option: ${guess}`);
    const correct = guess === spec.answer;
    const fb = spec.feedback ?? {};
    return { correct, message: fb[guess] ?? (correct ? "Correct." : "Not quite.") };
  }
  if (spec.kind === "number") {
    if (!Number.isFinite(guess)) throw new Error(`not a number: ${guess}`);
    const error = guess - spec.answer;
    const fb = spec.feedback ?? {};
    // The epsilon keeps slider values exactly on the boundary inside the
    // tolerance: in floating point, 0.53 - 0.5 > 0.03.
    if (Math.abs(error) <= spec.tol + 1e-9 * Math.max(1, Math.abs(spec.answer))) {
      return { correct: true, error, message: fb.close ?? "Within tolerance." };
    }
    return {
      correct: false,
      error,
      message: (error < 0 ? fb.low : fb.high) ?? (error < 0 ? "Too low." : "Too high.")
    };
  }
  throw new Error(`unknown question kind: ${spec.kind}`);
}

/** Relative L2 distance ‖u − v‖ / ‖v‖ between two equally long arrays. */
export function relativeError(u, v) {
  if (u.length !== v.length) throw new Error("length mismatch");
  let num = 0, den = 0;
  for (let i = 0; i < u.length; i++) {
    num += (u[i] - v[i]) ** 2;
    den += v[i] ** 2;
  }
  if (den === 0) throw new Error("reference is identically zero");
  return Math.sqrt(num / den);
}

/** The three confidence levels a reader can state before committing. */
export const CONFIDENCE = ["guessing", "fairly sure", "certain"];

/**
 * A note on calibration: how the stated confidence relates to the outcome.
 * The two off-diagonal cases are the instructive ones. Confidently wrong marks
 * a misconception worth revisiting; right while guessing marks knowledge the
 * reader cannot yet justify.
 */
export function calibrationNote(confidence, correct) {
  if (!CONFIDENCE.includes(confidence)) throw new Error(`unknown confidence: ${confidence}`);
  if (correct) {
    return confidence === "guessing"
      ? "You were right, but guessing. Read the explanation until you could have said why."
      : "Right, and you knew it.";
  }
  return confidence === "certain"
    ? "You were certain and wrong. That is the most useful moment in learning: a belief just met the evidence. Find out where it came from."
    : "Wrong, but you were not sure: your doubt was justified. The figure shows what really happens.";
}

// ---------------------------------------------------------------------------
// DOM widgets
// ---------------------------------------------------------------------------

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/**
 * A prediction widget for `viewof`.
 *
 * value = { committed: false }                       before the reader commits
 * value = { committed: true, guess, correct, message, confidence? } afterwards
 *
 * Options:
 *   prompt      question text (plain text; use the surrounding Markdown for maths)
 *   spec        as for grade(); for "number" also { min, max, step, value, unit }
 *   label       label of the commit button
 *   confidence  ask "How sure are you?" before the commit (see calibrationNote)
 */
export function predictGate({ prompt, spec, label = "Commit my prediction", confidence = false }) {
  const root = el("div", "pq-gate");
  root.append(el("div", "pq-prompt", prompt));

  let read; // () => current guess
  const controls = el("div", "pq-controls");
  if (spec.kind === "choice") {
    const name = `pq-${Math.random().toString(36).slice(2)}`;
    const inputs = spec.options.map((opt) => {
      const lab = el("label", "pq-option");
      const r = el("input");
      r.type = "radio";
      r.name = name;
      r.value = opt;
      lab.append(r, document.createTextNode(" " + opt));
      controls.append(lab);
      return r;
    });
    read = () => inputs.find((r) => r.checked)?.value;
  } else {
    const range = el("input");
    Object.assign(range, { type: "range", min: spec.min, max: spec.max, step: spec.step, value: spec.value ?? spec.min });
    const out = el("output", "pq-readout");
    const show = () => (out.textContent = `${(+range.value).toFixed(2)}${spec.unit ? " " + spec.unit : ""}`);
    range.addEventListener("input", (e) => { e.stopPropagation(); show(); });
    show();
    controls.append(range, out);
    read = () => +range.value;
  }
  root.append(controls);

  let readConfidence = () => undefined;
  if (confidence) {
    const row = el("div", "pq-controls pq-confidence");
    row.append(el("span", "pq-confidence-label", "How sure are you?"));
    const name = `pq-c-${Math.random().toString(36).slice(2)}`;
    const radios = CONFIDENCE.map((level) => {
      const lab = el("label", "pq-option");
      const r = el("input");
      Object.assign(r, { type: "radio", name, value: level });
      lab.append(r, document.createTextNode(" " + level));
      row.append(lab);
      return r;
    });
    root.append(row);
    readConfidence = () => radios.find((r) => r.checked)?.value;
  }

  const button = el("button", "btn btn-primary btn-sm pq-commit", label);
  const verdict = el("div", "pq-verdict");
  const retry = el("button", "btn btn-outline-secondary btn-sm pq-retry", "Try again");
  retry.hidden = true;
  root.append(button, retry, verdict);

  root.value = { committed: false };
  const emit = () => root.dispatchEvent(new Event("input", { bubbles: true }));

  button.addEventListener("click", () => {
    const guess = read();
    if (guess === undefined) {
      verdict.className = "pq-verdict pq-hint";
      verdict.textContent = "Pick an answer first: the point is to commit before you look.";
      return;
    }
    const sure = readConfidence();
    if (confidence && sure === undefined) {
      verdict.className = "pq-verdict pq-hint";
      verdict.textContent = "Say how sure you are first: comparing confidence with the outcome is part of the exercise.";
      return;
    }
    const result = grade(spec, guess);
    root.value = { committed: true, guess, ...result, ...(confidence ? { confidence: sure } : {}) };
    verdict.className = `pq-verdict ${result.correct ? "pq-correct" : "pq-wrong"}`;
    verdict.replaceChildren(
      el("strong", "", result.correct ? "Your prediction holds. " : "Not what happens. "),
      document.createTextNode(result.message)
    );
    if (confidence) verdict.append(el("div", "pq-calibration", calibrationNote(sure, result.correct)));
    root.querySelectorAll("input").forEach((i) => (i.disabled = true));
    button.hidden = true;
    retry.hidden = false;
    emit();
  });

  retry.addEventListener("click", () => {
    root.value = { committed: false };
    root.querySelectorAll("input").forEach((i) => (i.disabled = false));
    verdict.textContent = "";
    verdict.className = "pq-verdict";
    button.hidden = false;
    retry.hidden = true;
    emit();
  });

  // Inner inputs must not leak their own "input" events to OJS: only a commit
  // or a retry changes the widget's value.
  // (bubble phase: the inputs' own listeners, such as the slider readout, run first).
  root.addEventListener("input", (e) => { if (e.target !== root) e.stopPropagation(); });
  return root;
}

/** Placeholder shown where a locked figure will appear. */
export function locked(text = "Commit a prediction above to unlock this figure.") {
  return el("div", "pq-locked", text);
}

/**
 * A progress meter for "match the target" challenges.
 * error: current relative error; tol: success threshold.
 */
export function targetMeter(error, tol, { start = 1 } = {}) {
  const root = el("div", "pq-meter");
  const bar = el("div", "pq-meter-bar");
  const fill = el("div", "pq-meter-fill");
  // Logarithmic scale between `start` and `tol`: halving the error always
  // moves the bar by the same amount, which keeps the last steps rewarding.
  const p = Math.min(1, Math.max(0, Math.log(start / error) / Math.log(start / tol)));
  fill.style.width = `${(100 * p).toFixed(1)}%`;
  const hit = error <= tol;
  if (hit) fill.classList.add("pq-meter-hit");
  bar.append(fill);
  root.append(
    bar,
    el("div", hit ? "pq-correct" : "pq-meter-text",
      hit ? `Matched: relative error ${(100 * error).toFixed(2)}% (≤ ${(100 * tol).toFixed(0)}%).`
          : `Relative error ${(100 * error).toFixed(1)}%. Target: ≤ ${(100 * tol).toFixed(0)}%.`)
  );
  return root;
}
