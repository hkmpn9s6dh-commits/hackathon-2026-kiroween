import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const url = process.env.SMOKE_URL || 'https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/'
const outDir = 'proof'
mkdirSync(outDir, { recursive: true })

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const consoleErrors = []
const hosts = new Set()
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text())
})
page.on('request', (r) => {
  try {
    hosts.add(new URL(r.url()).host)
  } catch {
    /* data: urls */
  }
})

const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
check('AC-12 page responds 200', res?.status() === 200, `status ${res?.status()}`)
check('AC-3 title contains Necropolis', (await page.title()).includes('Necropolis'))
check('AC-3 handle input present', (await page.locator('#handle').count()) === 1)
check('AC-3 demo button present', (await page.getByRole('button', { name: /demo graveyard/i }).count()) === 1)

await page.getByRole('button', { name: /demo graveyard/i }).click()
await page.waitForTimeout(2200)
check('AC-4 demo renders a canvas', (await page.locator('canvas').count()) === 1)
const graves = await page.locator('ul[aria-label="Graves"] button').count()
check('AC-4 graves rendered', graves >= 12, `${graves} graves`)

await page.evaluate(() => {
  const b = document.querySelectorAll('ul[aria-label="Graves"] button')[5]
  if (b instanceof HTMLElement) b.click()
})
await page.waitForTimeout(1200)
const panelText = (await page.locator('.panel').innerText().catch(() => '')) || ''
check('AC-5 autopsy opens', panelText.length > 80, `${panelText.length} chars`)
check('AC-5 has revival odds', /Revival odds/i.test(panelText))
check('AC-5 has three plan steps', (await page.locator('.plan li').count()) === 3)

await page.keyboard.press('Escape')
await page.waitForTimeout(500)
check('AC-6 Escape closes the panel', (await page.locator('.panel').count()) === 0)

const allowed = new Set(['hkmpn9s6dh-commits.github.io', ''])
const unexpected = [...hosts].filter((h) => !allowed.has(h))
check('AC-10 only the site host is contacted in demo mode', unexpected.length === 0, unexpected.join(', '))
check('AC-12 no console errors', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 200))

writeFileSync(`${outDir}/smoke.json`, JSON.stringify({ url, at: new Date().toISOString(), results }, null, 2))
await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(failed.length === 0 ? 'SMOKE PASSED' : `${failed.length} SMOKE CHECK(S) FAILED`)
process.exit(failed.length === 0 ? 0 : 1)
