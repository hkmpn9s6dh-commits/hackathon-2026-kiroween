---
inclusion: always
---

# Tech stack and constraints

- **React 19 + TypeScript (strict) + Vite 7.** No UI framework, no CSS-in-JS, no state library.
- **Canvas 2D** for the graveyard. Static background pre-rendered into an offscreen canvas on resize; the animation loop only redraws fog, embers, candle flames and the camera transform.
- **GitHub REST API v3**, unauthenticated, `GET /users/{handle}/repos?per_page=100&sort=pushed`. Cache in `localStorage` for 6 hours. Treat 403/429 as a first-class state with a helpful message.
- **No runtime LLM.** The autopsy is a pure function over repository metadata. Do not add an API key or a model call.
- **Deployment**: GitHub Pages from the `gh-pages` branch, built with `base: './'`. No server runtime.
- **Fonts are self-hosted** in `public/fonts` (Cormorant Garamond, Plus Jakarta Sans — both OFL). Do not add a Google Fonts `<link>`.

## Hard constraints

- Bundle budget: 400 kB JS (gzip 120 kB). Current: ~254 kB / 81 kB gzip.
- First paint must not wait for the GitHub request.
- All user-facing copy in English.
- No analytics, no cookies, no third-party scripts.
