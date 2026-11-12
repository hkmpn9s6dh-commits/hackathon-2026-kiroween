import type { Autopsy, GraveState, Repo } from './types'

const DAY = 86_400_000

export function daysBetween(from: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(from).getTime()) / DAY))
}

export function classify(repo: Repo): GraveState {
  if (repo.archived) return 'entombed'
  const d = daysBetween(repo.pushedAt)
  if (d <= 45) return 'alive'
  if (d <= 180) return 'fading'
  if (d <= 540) return 'dormant'
  if (d <= 1460) return 'dead'
  return 'forgotten'
}

export const STATE_LABEL: Record<GraveState, string> = {
  alive: 'Still breathing',
  fading: 'Fading',
  dormant: 'Dormant',
  dead: 'Buried',
  forgotten: 'Forgotten',
  entombed: 'Entombed',
}

function causeOfDeath(repo: Repo, state: GraveState): string {
  if (state === 'entombed') return 'Its author sealed the crypt: the repository is archived.'
  if (repo.isFork) return 'A copy of someone else’s dream, never given a life of its own.'
  if (!repo.description && repo.stars < 5) return 'Never found its first believer, and never said what it was for.'
  if (state === 'alive') return 'No cause of death yet. It still twitches.'
  if (repo.stars >= 200) return 'Outlived its own momentum: people kept arriving after the author left.'
  if (repo.openIssues > 8) return 'Buried under its own issue tracker.'
  if (repo.sizeKb < 200) return 'Died young, before the first commit could grow into a skeleton.'
  if (!repo.license) return 'Kept its secrets. Nobody could fork it, so nobody carried it.'
  return 'The author’s attention moved on. The code stayed, and quietly stopped.'
}

function epitaphFor(repo: Repo, state: GraveState): string {
  const name = repo.name.replace(/[-_]/g, ' ')
  switch (state) {
    case 'alive':
      return 'Still warm. Do not bury.'
    case 'fading':
      return 'Last seen wandering the commit log.'
    case 'dormant':
      return 'Sleeping, not dead. Probably.'
    case 'dead':
      return repo.stars > 100 ? 'Loved by many. Maintained by none.' : 'It ran once. That counts.'
    case 'forgotten':
      return `Here lies ${name}. It had ideas.`
    case 'entombed':
      return 'Sealed by its maker. Rest, if you can.'
  }
}

function revivalScore(repo: Repo, state: GraveState): number {
  const recency = Math.max(0, 30 - Math.min(30, daysBetween(repo.pushedAt) / 60))
  const love = Math.min(20, Math.log10(repo.stars + 1) * 10)
  const clarity = (repo.description ? 9 : 0) + (repo.license ? 5 : 0)
  const size = repo.sizeKb < 3000 ? 8 : repo.sizeKb < 12000 ? 4 : 0
  const stateBonus = state === 'alive' ? 24 : state === 'fading' ? 16 : state === 'dormant' ? 8 : state === 'dead' ? 3 : 0
  const archivedPenalty = repo.archived ? 30 : 0
  return Math.max(3, Math.min(96, Math.round(recency + love + clarity + size + stateBonus - archivedPenalty)))
}

function planFor(repo: Repo, state: GraveState): string[] {
  if (state === 'alive') {
    return [
      'Write down what “done” looks like before the next sprint steals it.',
      'Ship one visible thing this week — a screenshot beats a roadmap.',
      'Tag a release. Living projects need a pulse you can point at.',
    ]
  }
  if (state === 'entombed') {
    return [
      'Leave the tombstone: a README that says what it was and why it stopped.',
      'Harvest the one module worth keeping into a smaller repo.',
      'Link the grave from your profile — an honest archive is a portfolio.',
    ]
  }
  if (repo.stars >= 100) {
    return [
      'Open one issue titled “Is this dead?” — let the users decide with you.',
      'Fix the single most-reported bug. Momentum returns through the door it left.',
      'If you will not continue, hand the keys to a maintainer and say so.',
    ]
  }
  return [
    'Give it a two-hour revival budget. If the first hour is misery, close it.',
    'Delete every unfinished feature from the README and keep the one that worked.',
    'If you will not continue, archive it with a one-paragraph obituary.',
  ]
}

export function autopsy(repo: Repo, now = Date.now()): Autopsy {
  const state = classify(repo)
  const daysSince = daysBetween(repo.pushedAt, now)
  const ageDays = daysBetween(repo.createdAt, now)
  return {
    state,
    stateLabel: STATE_LABEL[state],
    daysSince,
    ageDays,
    cause: causeOfDeath(repo, state),
    epitaph: epitaphFor(repo, state),
    revival: revivalScore(repo, state),
    plan: planFor(repo, state),
    vitals: [
      { label: 'Last sign of life', value: daysSince === 0 ? 'today' : `${daysSince.toLocaleString()} days ago` },
      { label: 'Age', value: ageDays < 365 ? `${ageDays} days` : `${(ageDays / 365).toFixed(1)} years` },
      { label: 'Stars', value: repo.stars.toLocaleString() },
      { label: 'Forks', value: repo.forks.toLocaleString() },
      { label: 'Open issues', value: repo.openIssues.toLocaleString() },
      { label: 'Language', value: repo.language ?? 'unknown' },
      { label: 'Size', value: repo.sizeKb < 1024 ? `${repo.sizeKb} KB` : `${(repo.sizeKb / 1024).toFixed(1)} MB` },
      { label: 'Licence', value: repo.license ?? 'none' },
    ],
  }
}

export function yearsLine(repo: Repo): string {
  const born = new Date(repo.createdAt)
  const died = new Date(repo.pushedAt)
  const fmt = (d: Date) => `${d.getFullYear()}`
  return born.getFullYear() === died.getFullYear() ? fmt(born) : `${fmt(born)} — ${fmt(died)}`
}
