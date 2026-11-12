---
inclusion: always
---

# Structure and conventions

```
src/
  scene/       canvas rendering; one class per scene, no React inside
  lib/         pure data and copy logic; no DOM except documented canvas helpers
  components/  React; presentational, receive data through props
  styles/      tokens.css (variables only) + app.css (layout and components)
docs/          brief, spec, UI rules, submission copy, proof
scripts/       verify.sh, screenshots.mjs, deploy.sh
.kiro/         steering, specs, hooks (must stay committed)
proof/         evidence: screenshots, ranking sheets, logs
```

## Conventions

- Named exports, no default exports except React components where a default is conventional.
- Types live in `src/lib/types.ts`. `import type` for type-only imports.
- CSS: BEM-free flat class names (`.panel`, `.vital`, `.plan`), all colours and sizes from `tokens.css` variables.
- Copy: sentence case; no exclamation marks; no emoji in UI.
- Every new string that a user reads must be English and must fit the 16 px rule.

## Where to change what

- A new grave state → `src/lib/vitality.ts` + `STATE_LABEL` + `docs/07-UI.md`.
- A new screen → `src/components` + a section in `docs/07-UI.md` before the code.
- A new data field → `types.ts` → `github.ts` mapping → `autopsy().vitals` → panel.
