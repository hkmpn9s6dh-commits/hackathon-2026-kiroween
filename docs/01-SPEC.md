# 01 — SPEC: Necropolis

> Gate A artefact. Scope is frozen once this document is agreed: after Gate A, scope only shrinks, never grows.

## 0. The official rubric (pasted from the Kiroween 2026 rules)

| Criterion | Weight | What judges look for |
|---|---|---|
| Potential Impact | 20% | A credible case for a real problem and a real audience; useful, intuitive, accessible; would someone actually use this? |
| Technological Implementation | 20% | How thoroughly and skillfully Kiro is used; a thoughtful AI-development strategy; variety of Kiro tools; depth of understanding. |
| Design | 20% | A complete, coherent product experience, not a technical proof of concept; intuitive, polished, intentional. |
| Innovation / Idea | 20% | Creative and novel; differs from existing concepts; unusual technologies or public resources combined uniquely. |
| Presentation | 20% | The video demonstrates the project end to end; the pitch conveys problem, user and why it matters; easy to follow, memorable. |

## 1. One sentence

**Necropolis turns a developer's abandoned GitHub repositories into a walkable graveyard, gives each one an autopsy, and hands back a concrete resurrection plan.**

## 2. Why this is not a toy

- Every developer carries guilt about dead projects. The feeling is universal; the data is already public.
- Existing tools tell you *what* is stale (dependabot, repo dashboards). None of them help you decide *what to do*: revive, harvest, or bury with dignity.
- Necropolis converts a vague feeling into a decision: a revival score, a cause of death, and three concrete next steps — plus a shareable obituary that makes the decision public and therefore real.

## 3. Golden path (the only path that must be perfect)

1. Land on the gate. Understand in five seconds what this is.
2. Type a GitHub handle (or choose the demo graveyard).
3. Watch the graveyard assemble from real repos — the oldest buried furthest back.
4. Click a grave. Read the autopsy: state, cause of death, vital signs, revival odds, how to raise it.
5. Generate the obituary card and download it.
6. Leave, having decided something about at least one project.

## 4. Demo script (the video is written first, then built backwards)

| Time | Shot | Voice-over |
|---|---|---|
| 0:00–0:08 | Black. A single candle lights. Camera pulls back to the graveyard gate. | "Every developer has a graveyard. Projects we loved, abandoned, and never said goodbye to." |
| 0:08–0:20 | Type a handle. Graves rise out of the fog, one per repo, oldest at the back. | "Necropolis reads your public GitHub and builds the graveyard you already have." |
| 0:20–0:38 | Click a tombstone: camera pushes in, panel opens. State, cause of death. | "Each grave gets an autopsy: how long it has been gone, and what actually killed it." |
| 0:38–0:55 | Scroll to revival odds; 3-step plan. | "And a revival score — with three concrete steps, if you decide it deserves another night." |
| 0:55–1:10 | Click "Write the obituary"; card appears; download. | "When you decide to let go, give it a proper obituary. Share it. Make the burial official." |
| 1:10–1:25 | Cut to another handle with fewer graves; empty state. | "Works for any public GitHub account. Nothing stored, nothing scraped, just the data you already published." |
| 1:25–1:35 | Logo, URL, category. | "Necropolis. Walk yours before Halloween is over." |

## 5. Acceptance criteria (each one has a command or a reproducible check)

| # | Criterion | How it is checked |
|---|---|---|
| AC-1 | Clean clone builds | `git clone … && npm ci && npm run build` exits 0 |
| AC-2 | One-command verification | `bash scripts/verify.sh` exits 0; prints PASS per item |
| AC-3 | Gate renders | Home page contains `Necropolis`, a handle input and the demo button |
| AC-4 | Real data path | A valid public handle renders ≥ 3 graves within 10 s; an invalid handle shows an inline error, not a crash |
| AC-5 | Autopsy complete | Panel shows state, cause, 8 vital signs, revival score and exactly 3 plan steps |
| AC-6 | Keyboard | Tab reaches every grave through the accessible list; Enter opens it; Escape closes the panel |
| AC-7 | Obituary | The generated card is 1200×630 and downloads as a PNG |
| AC-8 | Mobile | At 390×844 the panel becomes a bottom sheet; no horizontal scrolling |
| AC-9 | Reduced motion | With `prefers-reduced-motion: reduce`, the camera does not animate |
| AC-10 | Network honesty | In demo mode there are zero network requests; in live mode the only third-party host is `api.github.com` |
| AC-11 | No secrets | `scripts/verify.sh` scans for key-like strings; the repo contains none |
| AC-12 | Public deployment | The app is reachable at the GitHub Pages URL and loads without console errors |

## 6. Out of scope (explicitly not built)

- No OAuth, no private repos, no write access to GitHub.
- No accounts, no database, no server. Everything is client-side.
- No LLM at runtime. The autopsy is a rule engine over public metadata; it must work offline and cost nothing.
- No multi-user features, no leaderboards, no social feed.

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| GitHub API rate limit (60/h per IP) | 6-hour localStorage cache; a demo graveyard that needs no network; a clear error message with a retry hint. |
| Canvas scene looks flat on low-end laptops | Cap DPR at 2, pre-render the static background once per resize, animate only fog/embers/candles. |
| Names unreadable on small stones | Hover card with the full name; the accessible list; front row scale ≥ 1.3. |
| Kiro usage not convincing | Real specs, steering, hooks and custom agents committed under `.kiro/`; the write-up quotes the actual sessions. |
