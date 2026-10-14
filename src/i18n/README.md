# Translations

English is the source. Spanish follows it.

- `en/*.ts` and `es/*.ts`: the app's words, one file per area (`common`, `pages`, `wizard`,
  `list`, `exports`). Each Spanish file is typed against its English file, so a missing or
  misnamed key fails the build. Functions (for counts and names) take the same arguments.
- `es/items.ts`: each item's name, why, and tip, by id. `buildList` swaps them in.
- `es/meta.ts`, `es/hazards.ts`: kit, category, store, stage, and hazard labels.
  Use `metaFor(lang)` and `hazardFor(id, lang)` instead of the English constants.
- Text built in data files (quantities, card lines, Know your home labels, the refresh log)
  reads `ctx.lang`.

In components, `const t = useT()` gives the current language's messages, and `useLang()` the
language itself. The language is saved in localStorage (`bayready:lang`); without a saved
choice it follows the browser's language. Share links don't carry it, so a list opens in the
viewer's language.

## Spanish style

- Use **usted**, warm and plain, like Listos California's Spanish materials. Short sentences.
- Latin American Spanish as spoken in California: carro, cajuela, celular, la llave (tap).
- Keep proper names in English: Bay Ready, PG&E, EBMUD, AC Alert, BART, MyShake, ShakeOut.
- Numbers and units stay American (gallons, °F, $), since that's what's on the store shelf.

## Glossary

| English | Spanish |
|---|---|
| Stay-at-home bin | Caja para quedarse en casa |
| Go bag | Mochila de emergencia |
| Car kit | Kit para el carro |
| Around the house (tasks) | En la casa |
| Basics / Advanced | Lo básico / Avanzado |
| The essentials | Lo esencial |
| Start here | Empiece aquí |
| Your full list | Su lista completa |
| Know your home | Conozca su casa |
| When it happens | Cuando ocurra |
| Keep it fresh | Manténgalo al día |
| Why this | Por qué |
| Skip / Bring back | Omitir / Recuperar |
| Drop, Cover, and Hold On | Agáchese, cúbrase y sujétese |
| Evacuation Warning / Order | Advertencia de evacuación / Orden de evacuación |
| Earthquake | Terremoto |
| Power outage / planned shutoff | Apagón / corte de luz planeado |
| Out-of-area contact | Contacto fuera del área |
| Meeting spot | Punto de encuentro |
| Share link | Enlace para compartir |
| Wallet card | Tarjeta para la cartera |
