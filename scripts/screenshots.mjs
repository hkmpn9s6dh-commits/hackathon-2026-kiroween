import { chromium } from 'playwright'

const url = process.env.SHOT_URL || 'http://localhost:4173/'
const out = process.env.SHOT_DIR || 'proof/ui'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/01-gate.png` })

await page.getByRole('button', { name: /demo graveyard/i }).click()
await page.waitForTimeout(2600)
await page.screenshot({ path: `${out}/02-graveyard.png` })

// Click a grave through the accessible list so the shot is deterministic.
await page.evaluate(() => {
  const buttons = document.querySelectorAll('ul[aria-label="Graves"] button')
  const target = buttons[8] ?? buttons[0]
  if (target instanceof HTMLElement) target.click()
})
await page.waitForTimeout(1800)
await page.screenshot({ path: `${out}/03-autopsy.png` })

await page.getByRole('button', { name: /write the obituary/i }).click()
await page.waitForTimeout(1400)
await page.screenshot({ path: `${out}/04-obituary.png` })

await browser.close()
console.log('shots written to', out)
