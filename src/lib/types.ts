export type Repo = {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  openIssues: number
  sizeKb: number
  createdAt: string
  pushedAt: string
  archived: boolean
  isFork: boolean
  url: string
  homepage: string | null
  topics: string[]
  license: string | null
}

export type GraveState = 'alive' | 'fading' | 'dormant' | 'dead' | 'forgotten' | 'entombed'

export type Autopsy = {
  state: GraveState
  stateLabel: string
  daysSince: number
  ageDays: number
  cause: string
  epitaph: string
  revival: number
  plan: string[]
  vitals: { label: string; value: string }[]
}
