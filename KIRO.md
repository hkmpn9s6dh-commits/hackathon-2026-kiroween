# How Kiro was used

This project was built with **Kiro CLI 3.2.1 on Windows 11**, signed in with an AWS Builder ID. The `.kiro/` directory ships with the repo: three steering files, a full spec, two hooks and a custom reviewer agent.

## 1. Spec-driven development

The spec was written before the app, and Kiro was pointed at it before each implementation task:

- `.kiro/specs/necropolis/requirements.md` — EARS-style requirements (R1–R8), each one testable.
- `.kiro/specs/necropolis/design.md` — the pipeline, the rule engine, the canvas layers, failure modes.
- `.kiro/specs/necropolis/tasks.md` — the task list Kiro works from, with status.

The prompt given to Kiro always started with *read the steering and the spec first*, then named exactly one or two task IDs. That is the difference from vibe coding: the task existed, its acceptance criteria existed, and the model had to fit an existing architecture rather than invent one.

Example — the empty-yard task, as given:

> T4.6 empty-yard state: when a loaded account returns zero non-fork repositories, the Stage shows a centred message with the handle and a button that returns to the gate, styled in the existing visual language.

Kiro read `Stage.tsx`, `app.css` and the steering files, added an `isEmpty` branch, reused the existing `.btn btn-primary` and `.panel` vocabulary, and wrote a new `.empty-yard` block in `app.css`. No new dependency, no new colour.

## 2. Steering

Three always-on steering files (`product.md`, `tech.md`, `structure.md`) encode the non-obvious rules that a model would otherwise get wrong:

- **product.md** — no server, no runtime LLM, the demo graveyard must work offline, Halloween is the setting and not the product.
- **tech.md** — React 19 + TS strict, Canvas 2D only, bundle budget, self-hosted fonts, GitHub Pages with relative paths.
- **structure.md** — where a new grave state goes, where copy lives, which CSS variables exist.

The effect is visible in Kiro's output: it reused the existing button classes and tokens instead of inventing a second design system, and it did not add a library for the clipboard call.

## 3. Hooks

Two hooks in `.kiro/hooks/`:

| Hook | Trigger | Action |
|---|---|---|
| `verify-on-save.json` | `PostFileSave` on `*.ts` / `*.tsx` | `cmd /c scripts\verify-hook.cmd` → type-check, unit checks, repo hygiene |
| `verify-before-stop.json` | `Stop` | same, so a session cannot end on a red repository |

`scripts/verify-hook.cmd` is a small portable wrapper: it calls Git Bash when present, prints the result, and always exits 0 so a missing shell can never trap the agent in a cancelled session. (That failure mode was hit once during the build and fixed.)

## 4. Custom agent

`.kiro/agents/reviewer.json` is a read-only reviewer with only `fs_read` and `grep`, whose resources are the steering files and the two design documents. It validates with:

```
kiro-cli agent validate --path .kiro/agents/reviewer.json
```

It was then used for a real review of four files. It returned **FAIL** with five findings, three of which were genuine type-scale violations (15px and 26px outside the six-size system). Those were fixed; the remaining two (more than one amber object on the graveyard screen, shadows outside the panel) are intentional and are documented as exceptions in `docs/07-UI.md`. The raw review log is in `proof/kiro-review.log`.

## 5. What Kiro actually wrote

| Task | Files | Notes |
|---|---|---|
| T4.6 empty-yard state | `src/components/Stage.tsx`, `src/styles/app.css` | New branch + `.empty-yard` block, reusing existing tokens |
| T5.4 share caption | `src/components/ObituaryDialog.tsx` | `navigator.clipboard.writeText` with an `execCommand` fallback, two-second "Copied" state |

Both were verified by the main driver with `npm run build` and `bash scripts/verify.sh` (all checks green), then committed as `T4.6 empty yard + T5.4 share caption (implemented with Kiro CLI, deepseek-3.2)`.

The graveyard renderer, the autopsy engine, the obituary card and the video pipeline were written by the driver directly. This write-up only claims what Kiro did.

## 6. What did not work, and how it was handled

- **Headless mode with an API key** is the documented path for CI; no key was available, so every run used `kiro-cli chat --no-interactive -a --trust-workspace`.
- The default model on this account is `deepseek-3.2`. On long, multi-file prompts it occasionally emitted malformed tool-call markup and the session stalled. The fix was procedural: one or two tasks per run, one file per task, and a build at the end. Under that shape it completed reliably.
- `--model auto` and `--model claude-sonnet-4.5` are rejected by this account (`INVALID_MODEL_ID`); the working model is the default.

## 7. Not used (and not claimed)

- **MCP servers** — none were needed; the app talks to one public REST API.
- **Property-based testing** — the rule engine is tested with boundary cases in `scripts/test-vitality.mjs`, not PBT.
- **Kiro powers** — not used.
- **Kiro Web / Kiro Crew** — not used; the CLI was the only surface.

The repo keeps the full `.kiro/` directory, hooks included, so a judge can re-run the same setup.
