TASK
Build a Quarto learning course on brain mechanics for a new member of the research group "Brain Mechanics" (mechanical properties of brain tissue and neurons, mechanosensing, and how they shape neurodevelopment). The reader is a biological engineer / biophysics PhD student with little time to read the original papers.

INPUTS
- Literature PDFs: sources/. Bibliography: neuro_mechanics_merged.bib (use its citation keys). Match each PDF to a citation key by DOI or title. Report PDFs without a key and bibliography entries without a PDF. Entries without a PDF may be listed in the references but must not support specific claims.
- Quarto techniques and tools: the repository quarto-gallery at /mnt/data. Inspect it first and reuse its conventions (interactive elements, self-tests, plots, layout) where useful. If an important technique for explaining brain mechanics is missing, add it, but work on a copy or git branch and list every change in the README.

STEPS
1. Read every PDF in full, not just abstracts (OCR scanned files). For each, write notes/<citekey>.md: question, method, key result, key numbers, limitations, and foundational (before ~2015, textbook, or review) vs frontier (recent primary results).
2. Write a one-page OUTLINE.md: concept map, chapter order, and the papers supporting each chapter. Then STOP and wait for my approval.
3. After approval, write the course (about 2 hours of reading: ~15000 words plus exercises). Order: foundations (membrane potential and ion channels, neuronal culture, extracellular matrix, mouse embryo brain anatomy, voltage and calcium indicators including FLIPR, axon guidance, calcium signaling, tissue mechanics and mechanosensing including Piezo1, plus any other topics the PDFs make essential), then a "Frontier" part summarizing the latest findings in the PDFs.
4. Each chapter: learning goals, explanation with equations where useful, one figure or interactive element, 3-5 self-test questions with answers, and a short summary.
5. Also produce a condensed version (30 minutes, ~3500 words) with only the key concepts to remember, with the same citations.
6. Final check: render the project, fix unresolved citations and broken code, and report word counts, PDFs you could not read, and all assumptions.

RULES
- Every factual claim carries a citation [@citekey], with section or page when possible. Cite only what the PDF actually says.
- Standard equations (e.g. Nernst, Hodgkin-Huxley) are allowed only if a source in sources/ contains them, and they must be cited.
- If something is not supported by the PDFs, omit it or mark it clearly as "not from the literature". Never invent numbers, citations, or results.
- Every plot states its basis, assumptions, and symbols in a caption or title. Illustrative or toy data is labeled as such.
- Write in clear English for a non-specialist; define every term on first use.
- Output: a Quarto project that renders to HTML (_quarto.yml, one .qmd per chapter, condensed.qmd, references from the .bib) plus a short README with render instructions.

QUESTIONS
Ask me only about things that block you. Otherwise proceed and list your assumptions at the end.
