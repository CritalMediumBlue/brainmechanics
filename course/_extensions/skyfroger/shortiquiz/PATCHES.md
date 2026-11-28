# Local patches to shortiquiz 2.2.4

The extension is vendored in this directory (that is how `quarto add` works).

## English UI text (flashcards and Parsons problems)

Upstream 2.2.4 hard-codes some user-visible strings in Russian in
`shortiquiz-filter.lua`. They bypass `localize.lua`, so they stay Russian
even when the document language is English. The flashcard buttons were the
visible symptom: "Не помню", "Помню" and "Повторить ещё раз".

All of them now go through `l10n(...)`. The new keys are in `localize.lua`,
with the original Russian kept in the `ru` table:

| Key | English (`en`) | Where it appears |
|---|---|---|
| `showAnswer` | Show answer | flashcard front |
| `dontRemember` | Don't remember | flashcard back, left button |
| `remember` | Remember | flashcard back, right button |
| `cardsLeft` | Cards left | flashcard counter |
| `startAgain` | Start again | flashcard deck finished |
| `attemptsUsed` | Attempts used | Parsons problem |
| `codeError` | The code contains an error. | Parsons problem |

The language comes from the document's `lang` metadata. A missing `lang`, or a
language that has no table, falls back to `en`. Set `lang: en` in `_quarto.yml`
anyway, so the language is stated explicitly.

To check for leftovers after an update, search the rendered HTML for Cyrillic
letters:

    grep -rlP '[\x{0400}-\x{04FF}]' _book --include=*.html

Re-apply this patch after `quarto update skyfroger/shortiquiz`. Drop it once
the upstream release routes these strings through `localize.lua`.

## Author-controlled answer order (`correct=`, `shuffle=`)

Upstream marks the first option of a `.qmulti` (and of a `qselect` list) as the
correct one and shuffles the options at render time with an unseeded random
generator. The position of the right answer then changes on every render and
cannot be checked or balanced across a book. Local patch:

- `:::{.qmulti correct="3"}`: option 3 (1-based) is the correct one and the
  options keep the authored order. Without `correct`, upstream behaviour.
- `{{< qselect "a|b|c|d" correct=2 >}}`: the same for the inline drop-down
  (`shortiquiz.lua`).
- `:::{.qcheck shuffle="false"}`: keeps the authored order of a
  multiple-answer question (correct options are still marked `[x]`).

An out-of-range `correct` is reported with `quarto.log.error` and falls back
to option 1. `scripts/lint_quizzes.mjs` requires these attributes, so that it
can check the course-wide balance of answer positions.
