import type { Repo } from './types'

export const DEMO_USER = 'mortician'

const r = (
  id: number,
  name: string,
  description: string | null,
  language: string | null,
  stars: number,
  forks: number,
  openIssues: number,
  sizeKb: number,
  createdAt: string,
  pushedAt: string,
  archived = false,
  license: string | null = 'MIT',
  topics: string[] = [],
): Repo => ({
  id,
  name,
  full_name: `${DEMO_USER}/${name}`,
  description,
  language,
  stars,
  forks,
  openIssues,
  sizeKb,
  createdAt,
  pushedAt,
  archived,
  isFork: false,
  url: `https://github.com/${DEMO_USER}/${name}`,
  homepage: null,
  topics,
  license,
})

export const DEMO_REPOS: Repo[] = [
  r(1, 'lantern', 'A tiny static-site generator that only emits what you look at.', 'TypeScript', 412, 38, 6, 2140, '2024-02-11', '2026-11-09', false, 'MIT', ['ssg', 'static']),
  r(2, 'moth', 'Clipboard history that forgets on purpose.', 'Rust', 1180, 74, 12, 890, '2023-06-02', '2026-10-28', false, 'Apache-2.0', ['cli']),
  r(3, 'paper-static', 'Zine layout in the browser. Print-ready, no InDesign.', 'TypeScript', 96, 7, 3, 1340, '2025-01-19', '2026-08-14', false, 'MIT'),
  r(4, 'shader-garden', 'Grow plants by writing GLSL. It was going to be a game.', 'GLSL', 240, 19, 9, 5400, '2022-03-08', '2026-07-30', false, 'MIT', ['webgl']),
  r(5, 'tiny-forth', 'A Forth for the browser, 4 KB gzipped. WIP forever.', 'C', 88, 11, 2, 220, '2021-11-04', '2026-05-02', false, 'ISC'),
  r(6, 'invoice-goblin', 'Invoices that chase people for you. Half-built, fully cursed.', 'Go', 54, 4, 7, 760, '2023-09-27', '2026-02-18', false, 'MIT'),
  r(7, 'synth-bones', 'Skeleton of a web audio synth. Only the bones, no sound.', 'TypeScript', 31, 2, 0, 140, '2024-10-30', '2025-12-01', false, null),
  r(8, 'ghost-cli', 'A CLI that remembers what you forgot to commit.', 'Rust', 702, 41, 15, 1120, '2022-07-12', '2025-09-09', false, 'MIT', ['git']),
  r(9, 'notes-forever', 'Markdown notes with a search that actually works. Then I stopped.', 'Svelte', 189, 16, 4, 980, '2021-05-21', '2025-06-14', false, 'MIT'),
  r(10, 'atlas-of-nowhere', 'Maps of places that do not exist.', 'JavaScript', 44, 3, 1, 320, '2020-12-03', '2025-03-05', false, 'MIT'),
  r(11, 'sourdough-tracker', 'Track your starter. Graphs. Push notifications. Love.', 'Python', 12, 1, 0, 90, '2022-01-15', '2024-11-22', true, null),
  r(12, 'a11y-ghosts', 'Find the accessibility bugs your CI forgets.', 'TypeScript', 63, 8, 5, 610, '2021-08-08', '2024-04-17', false, 'MIT'),
  r(13, 'pocket-oracle', 'A tarot deck for product decisions. Yes, really.', 'JavaScript', 7, 0, 0, 60, '2023-03-14', '2023-10-01', false, null),
  r(14, 'dead-letter', 'An email client for people who hate email. 11 commits, then silence.', 'Swift', 156, 9, 6, 2100, '2020-02-20', '2022-06-30', true, 'MIT'),
]
