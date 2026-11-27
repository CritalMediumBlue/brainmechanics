# Brain Mechanics: a starter course

A Quarto book (HTML) for new members of a brain-mechanics research group. It covers the
mechanical properties of brain tissue and neurons, mechanosensing, and how they shape
neurodevelopment. There is a full version (~2 hours, chapters 1–12) and a condensed version
(~30 minutes, `condensed.qmd`). Every factual claim is cited from the 39 papers in
`../sources/`; the reading notes behind each citation are in `../notes/`.

## Render

Requirements: [Quarto](https://quarto.org) ≥ 1.6 (tested with 1.6.42). No Python, R or Jupyter
is needed: nothing executes at build time, and all interactive figures (Observable JS, Three.js)
run in the reader's browser.

```bash
cd course
quarto render          # writes the site to _book/
quarto preview         # local preview with live reload
```

Open `_book/index.html`, or serve `_book/` with any static web server. The 3D atlas viewer in
chapter 6 loads `.glb` files with `fetch`, which some browsers block for `file://` pages, so
`quarto preview` or a local server (e.g. `npx http-server _book`) is the reliable way to view it.
The interactive figures load Observable Plot, d3 and Three.js r0.130 from a CDN, so viewing
needs an internet connection.

Quarto writes a `_book/search.json` even though search is disabled. Delete it before
publishing an encrypted copy (same policy as `quarto-gallery`).

## Layout

| Path | Contents |
| --- | --- |
| `_quarto.yml` | book configuration; bibliography `references.bib` |
| `index.qmd` | welcome page, conventions, concept map |
| `chapters/01-…12-*.qmd` | one chapter each; chapter 12 is the "Frontier" part |
| `condensed.qmd` | 30-minute version with the same citations |
| `references.qmd` | all bibliography entries (`nocite: @*`) |
| `references.bib` | copy of `../neuro_mechanics_merged.bib` plus two entries for the 3D atlas data (`kronman2024developmental`, `devccf2024dataset`), which are not part of the reading list |
| `chapters/pedagogy/` | widgets copied from `quarto-gallery` (predict-then-check, step-through, prerequisite check, explain-back, linked terms) and the new `timeline.js` |
| `_extensions/skyfroger/shortiquiz/` | quiz extension, copied from `quarto-gallery` |
| `assets/` | stylesheets from `quarto-gallery` plus `course.css`; `atlas/` holds the 3D meshes |
| `js/atlas-viewer.js`, `js/atlas-math.js` | Three.js viewer for the atlas meshes |
| `tools/atlas/` | Node scripts that built the meshes from DevCCF (see `assets/atlas/PROVENANCE.md`) |

## Conventions

- Citations: `[@citekey, p. N]`, `[@citekey, Fig. X]`, or `[@citekey, sec. "…"]` for sources read
  only as PubMed Central full text (no page numbers).
- Equations appear only when a source writes them out, and are cited. Hodgkin–Huxley, the Hill
  equation and the Boltzmann open-probability fit are named in the sources but not written,
  so they are not shown.
- Statements that are not from the literature are boxed as "Not from the literature".
- Every figure caption states its basis and assumptions; schematic and illustrative figures are
  labelled as such.

## Rebuilding the atlas meshes

```bash
cd tools/atlas && npm ci
# download the DevCCF v1 zips (figshare 10.6084/m9.figshare.26377171.v1) into a separate folder,
# then follow assets/atlas/PROVENANCE.md (build.mjs writes assets/atlas/*.glb and atlas-groups.json)
```

The meshes are derived from DevCCF v1 (CC BY 4.0); the required attribution is in
`assets/atlas/PROVENANCE.md` and in the chapter 6 figure caption.
