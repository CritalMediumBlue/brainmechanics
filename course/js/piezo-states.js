// Conditions of the Piezo1 → Ca²⁺ schematic in chapter 11, as data.
// Every condition and its outcome is from Pathak et al. 2014 (human fetal
// neural stem/progenitor cells, Fluo-4 TIRF imaging of spontaneous Ca²⁺
// transients). Perturbations were done on glass, so they are offered on glass
// only. `level` is an ORDINAL rank of transient activity built from the
// authors' words ("minimal or no transients" on 0.4 and 0.7 kPa, "increasing
// activity" on 3.7 kPa, 750 kPa and glass); it is not a measured amplitude.

export const PIEZO_CONDITIONS = [
  { id: "s04", label: "0.4 kPa gel", stiffness: 0.15, traction: true, channels: 3, calciumOutside: true, level: 0.1,
    note: "Minimal or no transients on soft substrates (0.4 and 0.7 kPa).",
    cite: "sec. \"Piezo1 Is Activated by Traction Forces\"; Fig. 4C–D" },
  { id: "s07", label: "0.7 kPa gel", stiffness: 0.25, traction: true, channels: 3, calciumOutside: true, level: 0.1,
    note: "Minimal or no transients on soft substrates (0.4 and 0.7 kPa).",
    cite: "sec. \"Piezo1 Is Activated by Traction Forces\"; Fig. 4C–D" },
  { id: "s37", label: "3.7 kPa gel", stiffness: 0.45, traction: true, channels: 3, calciumOutside: true, level: 0.4,
    note: "Activity increases on stiffer substrates.",
    cite: "sec. \"Piezo1 Is Activated by Traction Forces\"; Fig. 4C–D" },
  { id: "s750", label: "750 kPa gel", stiffness: 0.7, traction: true, channels: 3, calciumOutside: true, level: 0.7,
    note: "Activity increases on stiffer substrates.",
    cite: "sec. \"Piezo1 Is Activated by Traction Forces\"; Fig. 4C–D" },
  { id: "glass", label: "glass", stiffness: 1, traction: true, channels: 3, calciumOutside: true, level: 1,
    note: "Spontaneous Ca²⁺ transients (\"hotspots\") on glass, a substrate in the gigapascal range.",
    cite: "Fig. 3; Fig. 4C–D" },
  { id: "egta", label: "glass + EGTA (6 mM)", stiffness: 1, traction: true, channels: 3, calciumOutside: false, level: 0,
    note: "Chelating external Ca²⁺ abolished the transients, reversibly: they need Ca²⁺ influx across the plasma membrane.",
    cite: "Fig. 3C–D" },
  { id: "sirna", label: "glass + Piezo1 siRNA", stiffness: 1, traction: true, channels: 1, calciumOutside: true, level: 0.15,
    note: "Fewer and smaller transients; the residual signal was similar to that with EGTA.",
    cite: "Fig. 3E–F" },
  { id: "bleb", label: "glass + blebbistatin (50 µM)", stiffness: 1, traction: false, channels: 3, calciumOutside: true, level: 0,
    note: "Blocking myosin II, and with it traction forces, abolished the transients to a similar extent as EGTA: the cell's own pulling opens Piezo1.",
    cite: "sec. \"Piezo1 Is Activated by Traction Forces\"; Fig. 4A–B" }
];

/** Is a channel drawn open? Open when the cell pulls and the substrate resists. */
export function channelOpen(c) {
  return c.traction && c.level > 0.05 || (c.traction && !c.calciumOutside);
}
