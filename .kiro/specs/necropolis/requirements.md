# Requirements — Necropolis

Format: EARS (Easy Approach to Requirements Syntax). Each requirement is testable.

## R1 — Enter a graveyard

- **R1.1** WHEN the app loads THE SYSTEM SHALL show the gate with a handle input, a primary button and a link to the demo graveyard.
- **R1.2** WHEN the user submits a handle THE SYSTEM SHALL request that user's public repositories from `api.github.com`.
- **R1.3** IF the handle does not exist THEN THE SYSTEM SHALL show the inline message “No GitHub user named …” and keep the gate usable.
- **R1.4** IF GitHub rate-limits the request THEN THE SYSTEM SHALL explain the limit and offer the demo graveyard.
- **R1.5** WHEN the user chooses the demo graveyard THE SYSTEM SHALL render it without any network request.

## R2 — Lay out the graves

- **R2.1** WHEN repositories are loaded THE SYSTEM SHALL render one tombstone per non-fork repository.
- **R2.2** THE SYSTEM SHALL place older repositories in rows further from the viewer.
- **R2.3** THE SYSTEM SHALL assign each repository exactly one state: alive (≤ 45 days since push), fading (≤ 180), dormant (≤ 540), dead (≤ 1460), forgotten (> 1460), entombed (archived).
- **R2.4** WHERE a repository is entombed THE SYSTEM SHALL show the seal bar instead of a candle.
- **R2.5** WHERE a repository is alive or fading THE SYSTEM SHALL show a flickering candle.

## R3 — Read an autopsy

- **R3.1** WHEN the user selects a grave THE SYSTEM SHALL open a panel with the repository name, years, epitaph, cause of death, eight vital signs, a revival score and exactly three plan steps.
- **R3.2** THE SYSTEM SHALL compute the revival score deterministically from recency, stars, description, licence, size and state; the score SHALL be within 3–96.
- **R3.3** WHEN the user presses Escape or the close button THE SYSTEM SHALL close the panel.
- **R3.4** WHEN a grave is selected THE SYSTEM SHALL pan the camera so the grave remains visible beside the panel.

## R4 — Write the obituary

- **R4.1** WHEN the user chooses “Write the obituary” THE SYSTEM SHALL render a 1200×630 card containing the name, years, epitaph, state, revival score, days since last sign and star count.
- **R4.2** THE SYSTEM SHALL offer the card as a PNG download named `obituary-<repo>.png`.
- **R4.3** THE SYSTEM SHALL wait for webfonts before drawing text on the card.

## R5 — Accessibility

- **R5.1** THE SYSTEM SHALL expose every grave as a button in a visually hidden list.
- **R5.2** THE SYSTEM SHALL show a visible focus ring on every interactive element.
- **R5.3** WHEN `prefers-reduced-motion: reduce` is set THE SYSTEM SHALL stop camera easing, fog drift and candle flicker.
- **R5.4** THE SYSTEM SHALL keep body text at 16 px or larger and maintain a contrast ratio of at least 4.5:1 for body copy.

## R6 — Honest data handling

- **R6.1** THE SYSTEM SHALL make no network request other than `api.github.com` in live mode.
- **R6.2** THE SYSTEM SHALL store nothing on a server and SHALL cache responses locally for no longer than six hours.
- **R6.3** THE SYSTEM SHALL request no GitHub permissions and use no credentials.

## R7 — Operate

- **R7.1** WHEN `bash scripts/verify.sh` runs on a clean clone THE SYSTEM SHALL exit 0.
- **R7.2** THE SYSTEM SHALL build a production bundle under 400 kB JavaScript (120 kB gzip).
- **R7.3** THE SYSTEM SHALL deploy to GitHub Pages with relative asset paths.

## R8 — Kiro evidence

- **R8.1** THE REPOSITORY SHALL contain `.kiro/steering/` with product, tech and structure steering.
- **R8.2** THE REPOSITORY SHALL contain `.kiro/specs/necropolis/` with requirements, design and tasks.
- **R8.3** THE REPOSITORY SHALL contain at least two `.kiro/hooks/*.json` hooks that run verification.
- **R8.4** `KIRO.md` SHALL describe which Kiro surfaces and features were used, with concrete examples.
