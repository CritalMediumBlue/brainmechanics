// Spike train -> ΔF/F₀ for GCaMP6, as an explicit cartoon model.
//
// Values from the literature (Chen et al. 2013, Supplementary Table 3; mouse V1
// in vivo, one action potential, cell-attached): peak ΔF/F₀, time to peak
// (τ_peak) and half-decay time (τ½). Minimum resolvable inter-spike intervals
// from the main text and Supplementary Fig. 10 of the same paper.
//
// NOT from the literature (stated in the figure caption):
//   * the kernel shape: a linear rise to the peak at τ_peak, then exponential
//     decay with half-time τ½;
//   * linear summation of the kernels of successive spikes (no saturation,
//     although the indicators bind Ca²⁺ cooperatively, with Hill coefficients
//     of 2.3-3.0 in Supplementary Table 2).
// No noise is added, so the curve cannot be mistaken for a recording.

export const GCAMP6 = {
  "GCaMP6s": { amp: 0.23, tPeak: 179, tHalf: 550, isi: [100, 150] },
  "GCaMP6m": { amp: 0.13, tPeak: 80, tHalf: 270, isi: [75, 100] },
  "GCaMP6f": { amp: 0.19, tPeak: 45, tHalf: 142, isi: [50, 75] }
};

/** ΔF/F₀ contribution of one spike at time t (ms) after it. */
export function kernel(t, { amp, tPeak, tHalf }) {
  if (t < 0) return 0;
  if (t < tPeak) return amp * t / tPeak;
  return amp * Math.pow(2, -(t - tPeak) / tHalf);
}

/** Spike times (ms) of a regular train: n spikes, interval isi, first at t0. */
export function train(n, isi, t0 = 200) {
  return Array.from({ length: n }, (_, i) => t0 + i * isi);
}

/** Linear sum of kernels on a time grid. Returns [{ t, dff }]. */
export function trace(spikes, p, { tEnd = 2500, dt = 2 } = {}) {
  const out = [];
  for (let t = 0; t <= tEnd; t += dt) {
    let s = 0;
    for (const ts of spikes) s += kernel(t - ts, p);
    out.push({ t, dff: s });
  }
  return out;
}

/** Largest ΔF/F₀ of a trace. */
export function peak(rows) {
  return rows.reduce((m, r) => Math.max(m, r.dff), 0);
}
