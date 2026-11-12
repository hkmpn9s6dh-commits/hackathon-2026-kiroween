import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { autopsy, classify } from '../src/lib/vitality.ts'

const DAY = 86_400_000
const now = Date.UTC(2026, 10, 12)

function repo(overrides = {}) {
  const pushed = new Date(now - 10 * DAY).toISOString()
  return {
    id: 1,
    name: 'lantern',
    full_name: 'mortician/lantern',
    description: 'A tiny static-site generator.',
    language: 'TypeScript',
    stars: 42,
    forks: 3,
    openIssues: 1,
    sizeKb: 900,
    createdAt: new Date(now - 400 * DAY).toISOString(),
    pushedAt: pushed,
    archived: false,
    isFork: false,
    url: 'https://github.com/mortician/lantern',
    homepage: null,
    topics: [],
    license: 'MIT',
    ...overrides,
  }
}

const daysAgo = (d) => new Date(now - d * DAY).toISOString()

// state boundaries
assert.equal(classify(repo({ pushedAt: daysAgo(10) })), 'alive')
assert.equal(classify(repo({ pushedAt: daysAgo(46) })), 'fading')
assert.equal(classify(repo({ pushedAt: daysAgo(181) })), 'dormant')
assert.equal(classify(repo({ pushedAt: daysAgo(541) })), 'dead')
assert.equal(classify(repo({ pushedAt: daysAgo(1461) })), 'forgotten')
assert.equal(classify(repo({ archived: true, pushedAt: daysAgo(1) })), 'entombed')

// autopsy shape
for (const days of [0, 100, 400, 900, 3000]) {
  const a = autopsy(repo({ pushedAt: daysAgo(days) }), now)
  assert.equal(a.plan.length, 3, 'plan must have exactly three steps')
  assert.ok(a.revival >= 3 && a.revival <= 96, 'revival must be clamped 3..96')
  assert.equal(a.vitals.length, 8, 'eight vital signs')
  assert.ok(a.cause.length > 10 && a.epitaph.length > 4)
}

// archived projects score lower than the same project alive
const alive = autopsy(repo({ pushedAt: daysAgo(5) }), now)
const entombed = autopsy(repo({ pushedAt: daysAgo(5), archived: true }), now)
assert.ok(alive.revival > entombed.revival, 'archiving must lower revival odds')

// demo data is coherent
const demo = readFileSync(new URL('../src/lib/demo.ts', import.meta.url), 'utf8')
const demoCount = (demo.match(/^  r\(/gm) ?? []).length
assert.ok(demoCount >= 12, `demo graveyard should have at least 12 graves (has ${demoCount})`)

console.log(`vitality: all checks passed (${demoCount} demo graves)`)
