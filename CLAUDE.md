@AGENTS.md

# Project rules

- Committing straight to `main` is fine for this project. This overrides the global "never commit directly to main" rule.
- Bypassing the global jeremy-gate hook is OK for this project only: prefix commits and pushes with `GIT_HOOK_ALLOW_JEREMY=1`. Push over SSH to `git@github.com:blanchardjeremy/bayready.git`.
- Run `npm test` and `npm run lint` before committing.
- Don't use the GitHub CLI (`gh`) in this project. Use plain `git` for pushing; anything else on GitHub (repo settings, Pages, Actions) is done by hand in the browser.
- Developer notes live in `DEVELOPING.md`. `README.md` is for people using the site, so keep it short and plain.
- **Translations:** whenever you add or change English user-facing text (UI strings, item names, why or tip text, card lines, labels, PDF or spreadsheet text), update the Spanish in the same change. UI strings live in `src/i18n/en/*.ts` with Spanish in `src/i18n/es/*.ts`; item text is in `src/i18n/es/items.ts`; see `src/i18n/README.md` for the rest and the glossary. Never hard-code new English text in a component; add it to the messages files. `npm test` checks the Spanish files match the English ones.
