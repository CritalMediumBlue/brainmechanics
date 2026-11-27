# Local patches to shortiquiz 2.2.4

The extension is vendored in this directory (that is how `quarto add` works).
Two user-visible strings of the flashcards were hard-coded in Russian and do
not go through `localize.lua`; they are replaced by English here:

- `shortiquiz-filter.lua`: "Показать ответ" -> "Show answer"
- `shortiquiz-filter.lua`: "Осталось карточек: N" -> "Cards left: N"

Re-apply after `quarto update skyfroger/shortiquiz`, or drop this patch once the
upstream release routes these strings through `localize.lua`.
