import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const url = process.env.KEY_URL || 'http://localhost:4173/'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /demo graveyard/i }).click()
await page.waitForTimeout(2000)

// Focus the first grave through the keyboard-only index.
await page.locator('.grave-index button').first().focus()
await page.waitForTimeout(400)
const box = await page.locator('.grave-index').boundingBox()
check('index becomes visible on focus', !!box && box.width > 200, box ? `${Math.round(box.width)}×${Math.round(box.height)}` : 'hidden')
await page.screenshot({ path: 'proof/ui/07-keyboard-index.png' })

const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
check('focus lands on a grave button', focusedTag === 'BUTTON', focusedTag || '')

await page.keyboard.press('Enter')
await page.waitForTimeout(1200)
const panel = await page.locator('.panel').count()
check('Enter opens the autopsy', panel === 1)

await page.keyboard.press('Escape')
await page.waitForTimeout(500)
check('Escape closes the autopsy', (await page.locator('.panel').count()) === 0)

writeFileSync('proof/keyboard.json', JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
await browser.close()
const failed = results.filter((r) => !r.pass).length
console.log(failed ? `${failed} FAILED` : 'KEYBOARD PASSED')
process.exit(failed ? 1 : 0)
