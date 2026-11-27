// Linked terms: hovering (or tapping, or focusing) a term highlights every
// element that represents the same idea, in the equation, the prose and the
// figure. See chapters/09-logistic.qmd and AUTHORING.md.
//
// A term is any element with a class `term-<name>`:
//   equation  $$ \class{term-growth}{r N} $$          (MathJax)
//   prose     [the growth term]{.term-growth}         (Pandoc span)
//   figure    Plot.line(data, { ariaDescription: "term-growth" }), then tagTerms(plot)
//             (Observable Plot 0.6.11 has no className option for marks;
//             any other SVG element can simply carry the class)
//
// linkTerms() uses event delegation on a container, so figures that OJS
// redraws later are linked without calling it again.

/** The term name of an element's class list ("term-growth" → "growth"), or null. */
export function termOf(classes) {
  for (const c of classes) {
    const m = /^term-([\w-]+)$/.exec(c);
    if (m && m[1] !== "active") return m[1];
  }
  return null;
}

const termElement = (target) => {
  for (let e = target; e && e.nodeType === 1; e = e.parentNode) {
    const t = termOf(e.classList ?? []);
    if (t) return [e, t];
  }
  return [null, null];
};

/**
 * Give every element whose aria-description is "term-<name>" the class
 * "term-<name>", so that Observable Plot marks can take part (Plot puts the
 * mark option `ariaDescription` on the mark's <g>). Returns the node.
 */
export function tagTerms(node) {
  node.querySelectorAll("[aria-description^='term-']").forEach((e) => e.classList.add(e.getAttribute("aria-description")));
  return node;
}

/**
 * Link all terms inside `container` (default: the whole document).
 * Returns a function that removes the listeners.
 */
export function linkTerms(container = document.body) {
  let current = null;
  const set = (term) => {
    if (term === current) return;
    container.querySelectorAll(".term-active").forEach((e) => e.classList.remove("term-active"));
    current = term;
    container.classList.toggle("terms-linking", term !== null);
    if (term) container.querySelectorAll(`.term-${CSS.escape(term)}`).forEach((e) => e.classList.add("term-active"));
  };
  // Hover with a mouse only: touch screens emulate a hover after every tap,
  // which would undo the tap toggle below.
  const over = (e) => { if (e.pointerType === "mouse") set(termElement(e.target)[1]); };
  const out = (e) => { if (e.pointerType === "mouse" && !termElement(e.relatedTarget)[1]) set(null); };
  const blur = (e) => { if (!termElement(e.relatedTarget)[1]) set(null); };
  const click = (e) => {            // touch screens: tap to toggle (a mouse already hovers)
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    const [, t] = termElement(e.target);
    if (t) set(t === current ? null : t);
  };
  // Prose terms can be reached with the keyboard.
  container.querySelectorAll("span[class*='term-']").forEach((s) => { if (!s.hasAttribute("tabindex")) s.tabIndex = 0; });
  const focus = (e) => set(termElement(e.target)[1]);

  const listeners = [["pointerover", over], ["pointerout", out], ["pointerup", click], ["focusin", focus], ["focusout", blur]];
  for (const [ev, f] of listeners) container.addEventListener(ev, f);
  return () => {
    set(null);
    for (const [ev, f] of listeners) container.removeEventListener(ev, f);
  };
}
