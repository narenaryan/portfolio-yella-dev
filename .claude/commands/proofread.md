Review new blog articles from git diff for grammatical mistakes and incorrect article usage (a/an/the), fix them in-place, and document every change in fixes.txt.

## Steps

1. Run `git diff --name-only` and `git status --short` to find new or modified markdown files under `content/blog/`.
2. Read each file that is new or changed.
3. Identify and fix all of the following:
   - Incorrect or missing articles (a / an / the)
   - Subject-verb agreement errors
   - Broken or malformed sentences
   - Wrong punctuation (e.g. `. ?` instead of `?`)
   - Wrong word choice that changes meaning (e.g. "redact" vs "reduce", "critique" vs "critic")
   - Unidiomatic phrases (e.g. "In opposite" → "In contrast")
   - Dangling or misused grammatical constructs
4. Edit the file(s) in-place with all fixes applied.
5. Write a fixes file at `proofread-fixes/<article-slug>.txt` (e.g. `proofread-fixes/2026-04-12-what-ai-needs-from-you.txt`) documenting every fix with:
   - The article file path at the top
   - Numbered list of: original text → fixed text, with a one-line explanation of why

Do not change the author's voice, style, or meaning. Only correct clear grammatical errors.
