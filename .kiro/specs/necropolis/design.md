# Design — Necropolis

## 1. Shape of the app

```
Gate ──submit──▶ loadGraveyard(handle) ──▶ Result { user, repos, source }
                                              │
                                              ▼
                                     Stage (canvas scene)
                                              │ select
                                              ▼
                                     AutopsyPanel ──▶ ObituaryDialog
```

- No router: two screens (gate, stage) and two overlays (panel, dialog).
- No global state: `App` owns `result`, `selected`, `obituaryOpen`.

## 2. Data

`github.ts` maps the REST payload to a narrow `Repo` type and filters forks. Three sources, in order: six-hour cache → live API → explicit error. The demo graveyard is a separate, hand-authored module that never touches the network.

## 3. The autopsy engine

Pure functions in `vitality.ts`:

- `classify(repo)` — state from `pushedAt` and `archived`.
- `causeOfDeath()` — ordered heuristics: archived → fork → no description and few stars → still alive → many stars → many issues → tiny size → no licence → default.
- `revivalScore()` — recency (0–30) + stars (0–20) + clarity (0–14) + size (0–8) + state (0–24) − archived (30), clamped to 3–96.
- `planFor()` — three steps, chosen by state and stars.

All copy lives here, not in components, so it can be reviewed and tested in one place.

## 4. Rendering

- Virtual coordinate space 1600×900, letterboxed into the viewport.
- `paintBackground()` draws sky, stars, moon, ridge, treeline, wall, ground, path and grass into an offscreen canvas once per resize.
- Each frame: clouds → fog (back) → graves → fog (front) → embers → vignette, under a camera transform `{x, y, zoom}` eased at 0.08/frame.
- Graves are laid out in three rows with a seeded PRNG (`mulberry32(hash(name))`) so the same account always produces the same graveyard.
- Hit testing converts screen → virtual coordinates and tests the topmost bounding box.

## 5. Failure modes

| Failure | Behaviour |
|---|---|
| GitHub 404 | Inline error under the input; gate stays. |
| GitHub 403/429 | Explain the limit, point at the demo graveyard. |
| No repos | Stage renders an empty yard with a one-line message. |
| Canvas unavailable | The app renders the gate; the accessible list still works. |
| Fonts blocked | Falls back to Georgia / system-ui; layout unchanged. |

## 6. Performance

- DPR capped at 2.
- One offscreen background per resize; no per-frame gradient creation except fog and candle glows.
- Animation stops on `visibilitychange` (browser default) and under reduced motion.

## 7. Testing

- `scripts/test-vitality.mjs` — classification boundaries, plan length, score range, deterministic layout hash.
- `scripts/verify.sh` — type-check, build, unit checks, repo hygiene, secret scan.
- `scripts/screenshots.mjs` — Playwright against the built site: gate, graveyard, autopsy, obituary.
