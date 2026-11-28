// Stiffness gradient across an axon tract, and the direction of turning.
//
// From the literature (Koser et al. 2016, Methods, author-manuscript p. 16):
//   M = (K1 - K2) / 100 µm, with K1 and K2 the mean apparent reduced elastic
//   modulus over 100 µm x 100 µm areas on either side of the optic tract.
// Direction rule (Koser et al. 2016, Fig. 3 and Discussion p. 7): Xenopus
// retinal ganglion cell axons turn toward the softer side; non-neuronal cells
// usually migrate toward the stiffer side (durotaxis).
//
// NOT from the literature: how strongly the tract bends. The figure draws a
// fixed bend whose sign follows the rule; it does not scale with M.

/** Stiffness gradient in Pa/µm between two areas whose centres are d µm apart. */
export function gradientM(K1, K2, d = 100) {
  return (K1 - K2) / d;
}

/**
 * Turning direction for side 1 on the left and side 2 on the right:
 * -1 = toward side 1 (left), +1 = toward side 2 (right), 0 = straight.
 * rule: "neuron" (toward softer, Koser et al. 2016) or "durotaxis" (toward stiffer).
 */
export function turnDirection(K1, K2, rule) {
  if (K1 === K2) return 0;
  const softer = K1 < K2 ? -1 : 1;
  return rule === "durotaxis" ? -softer : softer;
}
