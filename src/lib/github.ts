import type { Repo } from './types'
import { DEMO_REPOS, DEMO_USER } from './demo'

const API = 'https://api.github.com'
const CACHE_PREFIX = 'necropolis:v1:'

type RawRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  size: number
  created_at: string
  pushed_at: string
  archived: boolean
  fork: boolean
  html_url: string
  homepage: string | null
  topics?: string[]
  license: { spdx_id?: string | null } | null
}

function toRepo(r: RawRepo): Repo {
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    sizeKb: r.size,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
    archived: r.archived,
    isFork: r.fork,
    url: r.html_url,
    homepage: r.homepage || null,
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? null,
  }
}

export type LoadResult = {
  user: string
  repos: Repo[]
  source: 'live' | 'cache' | 'demo'
  note?: string
}

const DEMO: LoadResult = {
  user: DEMO_USER,
  repos: DEMO_REPOS,
  source: 'demo',
  note: 'Demo graveyard — a hand-buried sample. Enter your own GitHub handle to walk your own.',
}

export function demoGraveyard(): LoadResult {
  return DEMO
}

export async function loadGraveyard(handle: string): Promise<LoadResult> {
  const user = handle.trim().replace(/^@/, '')
  if (!user) throw new Error('Enter a GitHub handle first.')

  const cacheKey = `${CACHE_PREFIX}${user.toLowerCase()}`
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached) as { at: number; repos: Repo[] }
      if (Date.now() - parsed.at < 6 * 60 * 60 * 1000) {
        return { user, repos: parsed.repos, source: 'cache' }
      }
    }
  } catch {
    /* storage may be unavailable; live fetch still works */
  }

  const res = await fetch(`${API}/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&direction=desc`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (res.status === 404) throw new Error(`No GitHub user named “${user}”. Check the spelling.`)
  if (res.status === 403 || res.status === 429) {
    throw new Error('GitHub is rate-limiting this browser. Try again in a minute, or walk the demo graveyard.')
  }
  if (!res.ok) throw new Error(`GitHub answered ${res.status}. Try again in a moment.`)

  const raw = (await res.json()) as RawRepo[]
  const repos = raw.map(toRepo).filter((r) => !r.isFork)

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), repos }))
  } catch {
    /* ignore quota errors */
  }

  return { user, repos, source: 'live' }
}
