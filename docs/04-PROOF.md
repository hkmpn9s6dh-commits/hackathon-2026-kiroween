# 04 — Proof

Evidence collected on 2026-11-12. Every claim here is reproducible from the repo.

## Gate C — clean clone, README only

```
git clone ssh://git@ssh.github.com:443/hkmpn9s6dh-commits/hackathon-2026-kiroween.git clean-clone
cd clean-clone
npm ci            # 71 packages in 3s
bash scripts/verify.sh
```

Result: **ALL CHECKS PASSED** (11/11). Raw log: `proof/gate-c.log`.

| Check | Result |
|---|---|
| node and npm available | PASS |
| TypeScript type check | PASS |
| Autopsy unit checks | PASS |
| Production build | PASS |
| MIT licence present | PASS |
| `.kiro/steering` committed | PASS |
| `.kiro/specs` present | PASS |
| At least two `.kiro` hooks | PASS |
| `.kiro` not gitignored | PASS |
| Secret scan | PASS |
| JS bundle < 400 kB | PASS (255,131 bytes) |

## Live smoke (AC-3 to AC-12)

`node scripts/smoke.mjs` against https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/

```
PASS  AC-12 page responds 200
PASS  AC-3 title contains Necropolis
PASS  AC-3 handle input present
PASS  AC-3 demo button present
PASS  AC-4 demo renders a canvas
PASS  AC-4 graves rendered — 14 graves
PASS  AC-5 autopsy opens — 605 chars
PASS  AC-5 has revival odds
PASS  AC-5 has three plan steps
PASS  AC-6 Escape closes the panel
PASS  AC-10 only the site host is contacted in demo mode
PASS  AC-12 no console errors
SMOKE PASSED
```

Raw JSON: `proof/smoke.json`.

## Screens

- `proof/ui/01-gate.png` — gate with the graveyard behind it.
- `proof/ui/02-graveyard.png` — the main screen (blind-ranking image `proof/rank/packet/B.png`).
- `proof/ui/03-autopsy.png` — autopsy panel with camera push-in.
- `proof/ui/04-obituary.png` — obituary card in the modal.
- `proof/ui/05-mobile.png` — 390×844, bottom sheet.
- `proof/ui/06-reduced-motion.jpg` — reduced motion renders the scene without camera animation.

## Kiro evidence

- `.kiro/steering/` — product, tech, structure.
- `.kiro/specs/necropolis/` — requirements (EARS), design, tasks.
- `.kiro/hooks/` — verify on save, verify before stop.
- `.kiro/agents/reviewer.json` — custom read-only reviewer, validated with `kiro-cli agent validate`.
- `proof/kiro-review.log` — the reviewer's real output (FAIL, five findings; three type-scale findings fixed, two recorded as exceptions).
- `KIRO.md` — the write-up.

## Gate D — blind ranking

Packet: `proof/rank/packet/A–G.png` (one is ours, six are external references), key in `proof/rank/KEY.md`, ticket text in `proof/rank/judge-ticket.md`.

Judges: two models of different families, neither involved in the build.

**Round 1 is invalid and is kept only as a record.** The GLM call was genuine (`providerData.model = glm-5.3-flash`); the second call requested `gpt-5.6-sol` but the transcript records `deepseek-v4.1-flash` — a silent fallback to the builder's own family. One family cannot count as two judges.

| Judge | Requested | Actually used | Counts? |
|---|---|---|---|
| GLM-5.3-Flash | `custom-local:BC-GLM-5.3-Flash` | `glm-5.3-flash` | yes |
| “GPT-5.6-sol” | `gpt-5.6-sol` | `deepseek-v4.1-flash` (fallback) | **no** |

Round 2 is dispatched through Multica agents on online runtimes (Seoul), following the AME-1145 pattern: GLM (`❶🐂【牛来|OMP】`) and gpt-6.1-sol (`❶🛰【天佬|OMP】`). Gate D stays **open** until both report.
