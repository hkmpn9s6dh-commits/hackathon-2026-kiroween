# 05 — Submission (Devpost fields, written to be pasted)

> English only. Keep each field inside the character limit Devpost shows.

## Title

Necropolis — a graveyard for your dead side projects

## Tagline (≤ 200 chars)

Enter your GitHub handle. Necropolis builds a graveyard of your abandoned repositories, performs an autopsy on each, and gives you a revival plan — or a proper burial.

## Category

Costume Contest

## Inspiration

Every developer has a folder of dead projects. We keep them because deleting feels like admitting something. But we never look at them either — so the guilt compounds and nothing gets decided. Necropolis makes the graveyard visible, then turns it into a decision: revive, harvest, or bury with dignity.

## What it does

- Reads a public GitHub account and lays out every repository as a tombstone in a night graveyard — the oldest buried furthest back.
- Classifies each repo into six states, from *still breathing* to *entombed*.
- Performs an autopsy: cause of death, last sign of life, age, stars, forks, issues, language, size, licence.
- Scores revival odds out of 100 and gives three concrete steps to raise it — or to let it rest.
- Generates a downloadable 1200×630 obituary card so the decision becomes public.

## How we built it

- React 19 + TypeScript + Vite.
- The graveyard is drawn procedurally on Canvas 2D: a pre-rendered background (sky, moon, ridge, wall, grass) plus a live layer for fog, embers, candle flicker and camera easing.
- Data comes from the public GitHub REST API, cached in localStorage for six hours, with a hand-built demo graveyard that needs no network.
- No server, no accounts, no tracking. The autopsy is a deterministic rule engine, so it works offline and costs nothing.
- Deployed on GitHub Pages from the `gh-pages` branch.

## How we used Kiro

See [`KIRO.md`](../KIRO.md) for the full write-up: the spec-driven workflow (`/.kiro/specs/necropolis`), the steering files that fixed the design language, the hooks that ran verification on every edit, and the custom agent used for review.

## Challenges

- Making a canvas scene feel like a place rather than a widget: three iterations on the horizon, stone material and text scale before names were readable at a glance.
- Keeping the UI legible while everything is dark: one accent colour, six type sizes, and a hard rule that body copy is 16 px.
- Rate limits: the unauthenticated GitHub API allows 60 requests an hour, so the cache and the demo graveyard are part of the product, not an afterthought.

## What we learned

- A theme is a constraint, not a coat of paint: every Halloween element had to earn its place by making the data easier to read.
- Spec-first development paid off exactly where the design was subjective: writing the demo script before the UI forced the product to be demonstrable in 90 seconds.

## What's next

- Private repositories and organisations (OAuth).
- Team graveyards, so a team can decide together what to bury.
- A "harvest" mode that proposes which module to extract before archiving.

## Built with

react, typescript, vite, canvas, github-api, kiro, github-pages

## Links

- Live app: https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/
- Repo: https://github.com/hkmpn9s6dh-commits/hackathon-2026-kiroween
- Video: (to be filled after upload)
