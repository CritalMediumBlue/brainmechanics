#!/usr/bin/env node
// Lint the multiple-choice questions of a Quarto project for answer cues.
//
//   node scripts/lint_quizzes.mjs [--html _book] <file.qmd | dir> ...
//
// It reads shortiquiz questions (`.qmulti`, `.qcheck`, `{{< qselect >}}`) and
// predict-then-check gates (`predictGate({ spec: { kind: "choice", ... } })`)
// and enforces the rules in AUTHORING.md, "Writing multiple-choice questions":
//
//   options    single-answer questions have >= 4 options; multiple-answer
//              questions have >= 5 options and >= 3 wrong ones
//   order      the author fixes the order: `correct="N"` on .qmulti,
//              `correct=N` in qselect, `shuffle="false"` on .qcheck. Without it
//              shortiquiz shuffles at render time and positions cannot be checked
//   cues       no "all/none of the above"; no absolute word (always, never, ...)
//              that appears only in wrong options; no hedging word (often,
//              usually, ...) that appears only in the correct option
//   length     across the project, the correct option is the strictly longest
//              no more often than chance (sum over questions of 1/k), and the
//              strictly shortest no more often than chance plus a margin
//   position   across the project, no option position holds clearly more
//              correct answers than chance
//
// With --html <dir>, it also scans the rendered HTML for Cyrillic letters in
// visible text (untranslated widget strings).
//
// The pure functions are exported for tests/quizlint.test.mjs.

import fs from "node:fs";
import path from "node:path";

export const ABSOLUTE = ["always", "never", "only", "all", "none", "every", "completely",
  "entirely", "must", "cannot", "impossible", "solely", "exclusively", "nothing", "everything"];
export const HEDGE = ["may", "might", "can", "could", "often", "usually", "typically",
  "generally", "sometimes", "mainly", "mostly", "partly", "tends", "likely", "probably",
  "possibly", "some", "approximately", "roughly"];
const BANNED = /\b(all|none|both|neither) of (the above|these|them)\b/i;

/** Text a reader compares: no citations, markup or extra spaces. */
export function plain(s) {
  return s
    .replace(/\s*\[[^\]]*@[^\]]*\]/g, "")       // [@key, p. 3]
    .replace(/(^|\s)@[\w:-]+/g, "$1")            // @key
    .replace(/\{\{<[^>]*>\}\}/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function words(s) {
  return new Set(plain(s).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []);
}

/** Parse the questions of one .qmd source. Returns [{kind, file, line, stem, options, correct: [i...], fixed}]. */
export function parseQuestions(src, file = "") {
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^:{3,}\s*\{([^}]*\.(qmulti|qcheck)\b[^}]*)\}\s*$/);
    if (!open) continue;
    const kind = open[2], attrs = open[1];
    const body = [];
    let j = i + 1;
    for (; j < lines.length && !/^:{3,}\s*$/.test(lines[j]); j++) body.push(lines[j]);
    const q = { kind, file, line: i + 1, stem: "", options: [], correct: [], fixed: false };
    let cur = null;
    for (const l of body) {
      const item = l.match(/^(?:[-*+]|\d+[.)])\s+(.*)$/);
      if (item) { cur = { text: item[1], done: false }; q.options.push(cur); continue; }
      if (cur) {
        if (l.trim() === "" || /^\s*>/.test(l)) cur.done = true;
        else if (!cur.done) cur.text += " " + l.trim();
      } else if (!/^\s*>/.test(l)) q.stem += " " + l.trim();
    }
    q.stem = plain(q.stem);
    if (kind === "qmulti") {
      const m = attrs.match(/\bcorrect\s*=\s*"?(\d+)"?/);
      q.fixed = !!m;
      q.correct = [m ? Number(m[1]) - 1 : 0];
    } else {
      q.fixed = /\bshuffle\s*=\s*"?false"?/.test(attrs);
      q.options.forEach((o, k) => {
        if (/^\[[xX]\]|^☒/.test(o.text)) q.correct.push(k);
        o.text = o.text.replace(/^\[[ xX]\]\s*|^[☒☐]\s*/, "");
      });
    }
    q.options = q.options.map((o) => plain(o.text));
    out.push(q);
    i = j;
  }
  // Inline drop-downs: {{< qselect "a|b|c" correct=2 >}}
  const sel = /\{\{<\s*qselect\s+"([^"]*)"([^>]*)>\}\}/g;
  for (const m of src.matchAll(sel)) {
    const c = m[2].match(/\bcorrect\s*=\s*"?(\d+)"?/);
    out.push({
      kind: "qselect", file, line: src.slice(0, m.index).split("\n").length,
      stem: "", options: m[1].split("|").map(plain),
      correct: [c ? Number(c[1]) - 1 : 0], fixed: !!c
    });
  }
  // Predict-then-check gates with a choice spec. The widget keeps the authored order.
  const gate = /options:\s*\[([\s\S]*?)\]\s*,\s*answer:\s*("(?:[^"\\]|\\.)*")/g;
  for (const m of src.matchAll(gate)) {
    const options = [...m[1].matchAll(/"(?:[^"\\]|\\.)*"/g)].map((s) => JSON.parse(s[0]));
    const answer = JSON.parse(m[2]);
    out.push({
      kind: "predict", file, line: src.slice(0, m.index).split("\n").length,
      stem: "", options: options.map(plain), correct: [options.indexOf(answer)], fixed: true
    });
  }
  return out;
}

/** Rule violations of a single question: [{rule, msg}]. */
export function checkQuestion(q) {
  const errs = [];
  const k = q.options.length, nc = q.correct.length;
  const multi = q.kind === "qcheck";
  if (nc === 0 || q.correct.some((c) => c < 0 || c >= k)) errs.push({ rule: "answer", msg: "no valid correct option" });
  if (!multi && k < 4) errs.push({ rule: "options", msg: `${k} options; single-answer questions need at least 4` });
  if (multi && (k < 5 || k - nc < 3)) errs.push({ rule: "options", msg: `${k} options with ${nc} correct; multiple-answer questions need at least 5 options and 3 wrong ones` });
  if (!q.fixed) errs.push({ rule: "order", msg: multi ? 'add shuffle="false" and author the order' : "set the correct option's position with correct=N and author the order" });
  q.options.forEach((o, i) => { if (BANNED.test(o)) errs.push({ rule: "cue", msg: `option ${i + 1} uses "${o.match(BANNED)[0]}"` }); });
  const right = q.correct.filter((c) => c >= 0 && c < k);
  const wrong = q.options.map((_, i) => i).filter((i) => !right.includes(i));
  const inRight = new Set(right.flatMap((i) => [...words(q.options[i])]));
  const inWrong = new Set(wrong.flatMap((i) => [...words(q.options[i])]));
  for (const w of ABSOLUTE) if (inWrong.has(w) && !inRight.has(w)) errs.push({ rule: "cue", msg: `absolute word "${w}" appears only in wrong options` });
  for (const w of HEDGE) if (inRight.has(w) && !inWrong.has(w)) errs.push({ rule: "cue", msg: `hedging word "${w}" appears only in the correct option` });
  return errs;
}

/** Index of the strictly longest option, or -1 on a tie. */
export function longestIndex(options) {
  const len = options.map((o) => o.length);
  const max = Math.max(...len);
  return len.filter((l) => l === max).length === 1 ? len.indexOf(max) : -1;
}

/** Project-wide statistics over single-answer questions with at least 2 options. */
export function aggregate(questions) {
  const single = questions.filter((q) => q.kind !== "qcheck" && q.correct.length === 1 && q.options.length >= 2 && q.correct[0] >= 0);
  let longest = 0, shortest = 0, expectLongest = 0;
  const maxK = Math.max(0, ...single.map((q) => q.options.length));
  const pos = Array(maxK).fill(0), expectPos = Array(maxK).fill(0);
  for (const q of single) {
    const k = q.options.length;
    if (longestIndex(q.options) === q.correct[0]) longest++;
    if (longestIndex(q.options.map((o) => " ".repeat(1000 - o.length))) === q.correct[0]) shortest++;
    expectLongest += 1 / k;
    pos[q.correct[0]]++;
    for (let p = 0; p < k; p++) expectPos[p] += 1 / k;
  }
  return { n: single.length, longest, shortest, expectLongest, pos, expectPos };
}

/** Project-wide violations from aggregate(). */
export function checkAggregate(a) {
  const errs = [];
  if (a.longest > Math.round(a.expectLongest)) {
    errs.push({ rule: "length", msg: `the correct option is the longest in ${a.longest} of ${a.n} questions; chance is ${a.expectLongest.toFixed(1)}` });
  }
  // Over-correcting turns the shortest option into the cue: allow chance plus a margin.
  const e = a.expectLongest;
  if (a.shortest > e + Math.max(2, 0.25 * e)) {
    errs.push({ rule: "length", msg: `the correct option is the shortest in ${a.shortest} of ${a.n} questions; chance is ${e.toFixed(1)}` });
  }
  a.pos.forEach((c, p) => {
    const e = a.expectPos[p];
    if (c > e + Math.max(2, 0.25 * e)) errs.push({ rule: "position", msg: `position ${p + 1} holds ${c} correct answers; chance is ${e.toFixed(1)}` });
  });
  return errs;
}

/** Cyrillic letters in the visible text of an HTML page (scripts, styles and comments removed). */
export function cyrillicInHtml(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ");
  return [...new Set(text.match(/[Ѐ-ӿ][Ѐ-ӿ\s.,:!?-]*/g) ?? [])].map((s) => s.trim());
}

function walk(p, ext) {
  const st = fs.statSync(p);
  if (st.isFile()) return p.endsWith(ext) ? [p] : [];
  return fs.readdirSync(p).filter((f) => !f.startsWith(".") && !["_book", "_site", "_slides", "node_modules", "site_libs", "_extensions"].includes(f))
    .flatMap((f) => walk(path.join(p, f), ext));
}

function main(argv) {
  let html = null;
  const targets = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--html") html = argv[++i];
    else targets.push(argv[i]);
  }
  if (!targets.length) targets.push(".");
  const files = targets.flatMap((t) => walk(t, ".qmd")).filter((f) => !path.basename(f).startsWith("_"));
  const questions = files.flatMap((f) => parseQuestions(fs.readFileSync(f, "utf8"), f));
  let errors = 0;
  for (const q of questions) {
    for (const e of checkQuestion(q)) { console.log(`${q.file}:${q.line}: [${e.rule}] ${q.kind}: ${e.msg}`); errors++; }
  }
  const a = aggregate(questions);
  for (const e of checkAggregate(a)) { console.log(`project: [${e.rule}] ${e.msg}`); errors++; }
  if (html) {
    for (const f of walk(html, ".html")) {
      const hits = cyrillicInHtml(fs.readFileSync(f, "utf8"));
      if (hits.length) { console.log(`${f}: [language] Cyrillic UI text: ${hits.slice(0, 5).join(" | ")}`); errors++; }
    }
  }
  const kinds = {};
  for (const q of questions) kinds[q.kind] = (kinds[q.kind] ?? 0) + 1;
  console.log(`\n${questions.length} questions in ${files.length} files (${Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(", ")})`);
  console.log(`correct option strictly longest: ${a.longest} of ${a.n}, strictly shortest: ${a.shortest} (chance ${a.expectLongest.toFixed(1)} each)`);
  console.log(`correct position counts: ${a.pos.map((c, p) => `${p + 1}: ${c} (chance ${a.expectPos[p].toFixed(1)})`).join(", ")}`);
  console.log(errors ? `${errors} problem(s)` : "no problems");
  return errors ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("lint_quizzes.mjs")) {
  process.exitCode = main(process.argv.slice(2));
}
