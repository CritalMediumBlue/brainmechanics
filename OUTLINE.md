# Brain Mechanics: a starter course (outline for approval)

Reader: a PhD student in biological engineering or biophysics joining a brain-mechanics group.
Length: ~15,000 words plus exercises (about 2 hours), and a 30-minute condensed version (~3,500 words).
Sources: 39 full texts in `notes/` (citation keys from `neuro_mechanics_merged.bib`). F = foundational, N = frontier.

## Concept map

```
 ions & membrane potential ──► electrical activity in the young brain (GABA switch) ──► calcium signalling
          │                                         │                                        │
          ▼                                         ▼                                        ▼
 voltage & calcium indicators (FLIPR) ◄── neuronal culture ──► growth cone & cytoskeleton ──► axon guidance
                                               │                        ▲                          ▲
 mouse embryo brain anatomy ◄──► extracellular matrix ──► tissue mechanics ──► mechanosensing (Piezo1)
                                                                       └──────────► FRONTIER: stiffness as a developmental signal
```

Through-line: neurons are electrical *and* mechanical cells. Stiffness is measured (tissue mechanics), sensed by channels such as Piezo1 (which let in Ca²⁺ and change the membrane potential, read out with indicators), and used to steer axons and to time maturation (frontier).

## Chapters (Part I: Foundations; Part II: Frontier)

| # | Chapter (~words) | Interactive element / figure (gallery technique) | Main sources |
|---|---|---|---|
| 0 | Welcome: how to use the course, concept map, units (300) | concept map (mermaid) | — |
| 1 | Membrane potential and ion channels (1,400) | slider: change external K⁺ and see ΔE by Nernst vs GHK, reproducing the 5.4→25 mM example (OJS) | F: fairless2013 (eqs. 1–2), brohawn2014, moody2005, sundelacruz2009, berridge2003; N: kreysing2025 (patch clamp) |
| 2 | Electrical activity in the developing brain and the GABA switch (1,200) | predict-then-check: is GABA depolarising at P0? Then E_Cl vs [Cl⁻]ᵢ with Ben-Ari's and Rivera's measured values marked | F: benari2002, rivera1999, moody2005, spitzer2006, sundelacruz2009 |
| 3 | Calcium signalling (1,200) | log-scale "calcium ladder" of reported concentrations and timescales (data from the papers, with sources on hover) | F: berridge2003, rosenberg2011, spitzer2006, moody2005, dickson2002; N: segel2019, pathak2014 |
| 4 | Voltage and calcium indicators, including FLIPR (1,500) | calculator: ΔF/F₀ → mV with the FMP calibration (Fairless eq. 9); SNR explorer (Knöpfel Box 2) | F: fairless2013, whiteaker2001, baxter2002, chen2013, knopfel2019; N: abdelfattah2019 (preprint numbers), syeda2015 (FLIPR Ca²⁺ screen), kreysing2025 (Rhod-4) |
| 5 | Neuronal culture (1,200) | step-through of the 5 polarisation stages with Dotti's timings; protocol comparison table | F: dotti1988, craig1994, chen2013, fairless2013, engler2006 (thin-gel warning); N: kreysing2025 (gels), nourse2022 (neurospheres) |
| 6 | Mouse embryo brain anatomy (1,300) | interactive timeline E8.5 → P28, each event tagged with species and source; SVG of the cortical wall (VZ, SVZ, cortical plate) | F: gotz2005, long2019, thompson2014 (staging), moody2005, fawcett2019; N: nourse2022 (E10.5) |
| 7 | Extracellular matrix (1,100) | schematic of brain ECM (hyaluronan, lecticans, tenascin-R, perineuronal nets), labelled "schematic, not to scale" | F: long2019, fawcett2019, franze2013, tessierlavigne1996, craig1994, engler2006, dupont2011; N: segel2019 |
| 8 | Growth cones and the cytoskeleton (1,100) | clutch-model diagram; quiz on forces (actin ~1 pN, microtubules ~5 pN, traction 71–537 pN) | F: mitchison1988, dotti1988, franze2013, tyler2012, vanessen1997 |
| 9 | Axon guidance (1,200) | the "four forces" (mermaid); cue/receptor matching quiz | F: tessierlavigne1996, dickson2002, kolodkin2010, rosenberg2011, moody2005; N: koser2016, pillai2026 |
| 10 | Tissue mechanics: how soft is the brain? (1,500) | Hertz indentation explorer (F vs δ for chosen K and R; Pillai/Koser/Thompson eq.); stiffness ladder of tissues; rate dependence (AFM ~100 Pa vs MRE ~10 kPa) | F: franze2013 (definitions), tyler2012, pillai2024, engler2006; N: koser2016, thompson2019, segel2019, pillai2026 |
| 11 | Mechanosensing and Piezo1 (1,300) | dot plot of reported Piezo1 parameters (P₅₀, conductance, E_rev) by source and condition; membrane-tension scale | F: coste2010, brohawn2014, engler2006, dupont2011, tyler2012, pillai2024; N: pathak2014, syeda2015, nourse2022 |
| 12 | Frontier: stiffness as a developmental signal (1,800) | evidence table (system, stiffness, readout, result) plus three data plots of published values: Thompson's gradient threshold, Pillai's Piezo1 knockdown (432 → 231 Pa), Kreysing's soft vs stiff maturation | N: koser2016, thompson2019, segel2019, pathak2014, nourse2022, kreysing2025, pillai2026, abdelfattah2019; F: knopfel2019 (open problems) |

Every chapter: learning goals → explanation (equations only where a source states them) → one figure or interactive → 3–5 self-test questions with answers (shortiquiz with feedback, plus a collapsed "Answers" box) → summary with flashcards. Gallery conventions reused: callouts, predict-then-check (`predict.js`), step-through (`stepper.js`), OJS/Plot figures, shortiquiz, palette, `search: false`, MathJax.

`condensed.qmd`: one section per chapter with the 3–5 facts to remember, the key equations, and the same citations.

## Decisions I have made (tell me if you disagree)

1. **Topics added beyond your list**, because the PDFs make them essential: the GABA/chloride switch (5 sources), growth cones and the cytoskeleton (5 sources), and Yes-associated protein / transcriptional coactivator with PDZ-binding motif (YAP/TAZ) as a mechanosensing route that does not depend on ion channels (dupont2011, engler2006).
2. **Equations.** Nernst (for K⁺) and the Goldman–Hodgkin–Katz (GHK) equation come from Fairless 2013, and the Hertz model from Pillai 2026, Koser 2016 and others. **Hodgkin–Huxley, the Hill equation and the Boltzmann open-probability fit are not written out in any source, so they are omitted**: the relevant papers only name or fit them. The general Nernst form, used for E_Cl, is derived in one visible step from Fairless eq. 7, the Boltzmann distribution of a charged species, and cited as such.
3. **Species.** Mouse embryo ages come only from mouse data: Götz 2005, Long 2019, Thompson 2014, Moody 2005 and Nourse 2022. Many results are in rat, *Xenopus* or human fetal cells, and every claim is labelled with its species. Rat ages are never transferred to mouse.
4. **Conflicts between sources** are reported, not resolved. For example, Dotti and Craig give different neurite lengths, and Dickson and Kolodkin disagree on netrin's range. Known errors in the papers are not quoted, such as Nourse's "lower doubling time" and Ben-Ari's sign typo. Values read off a figure are marked "approx."
5. **Figures.** Plots use published values with sources in the caption, or are labelled "illustrative/toy". I don't reuse paper figures: most are not CC BY.
6. **Gallery.** I'll copy the widgets and the shortiquiz extension into `course/`. I'll add one technique the gallery lacks, an **interactive timeline with species tags**, on the branch `brain-mechanics-techniques` in `/mnt/data`, listed in its README.

**→ Waiting for your approval before writing the course.**
