# AGENTS.md — how this repo is built

Adapted from the hackathon template (v5.6) for a single-driver project.

## 1. The four gates

- **Gate A — do we agree on what we are building?** The SPEC is written before the UI: demo script first, then acceptance criteria that can be checked by a command. Includes the official judging rubric and the golden path. Scope is frozen after Gate A; it can shrink, never grow.
- **Gate B — did we go through the whole flow?** Every change is type-checked, built, and verified by `scripts/verify.sh`. No change lands on `main` while the build is red.
- **Gate C — can you prove it works?** A clean clone, following only the README, must build and run. Every acceptance criterion has evidence in `proof/` or in a command inside `verify.sh`.
- **Gate D — will a judge stop at the first glance?** The main screen is ranked blind against outside references by at least two models that did not build it. The bar: it must beat at least three of the references.

## 2. Rules of work

1. Push after every acceptance criterion is met, so an interrupted session loses nothing.
2. One competition, one repository.
3. The main screen goes on the real environment (GitHub Pages) before any feature is called done.
4. No secrets in the repo; `verify.sh` scans for key-like strings.
5. Copy is English; UI text is at least 16 px unless it is an uppercase label.
6. Accessibility is part of done: keyboard path, focus ring, `prefers-reduced-motion`, alt text.

## 3. Definition of done (project)

- [ ] Gate A artefacts: `docs/00-BRIEF.md`, `docs/01-SPEC.md`, `docs/07-UI.md` §1–4
- [ ] Gate B: `npm run verify` green on `main`
- [ ] Gate C: clean clone builds; `proof/` evidence for each AC
- [ ] Gate D: blind ranking recorded in `proof/rank/`
- [ ] Packaging: demo video ≤ 3 min, 1200×630 cover, Devpost copy, Kiro write-up
- [ ] Public URL live; repo public with `/.kiro` and a licence
