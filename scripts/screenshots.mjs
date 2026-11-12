import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.env.SHOT_URL || 'http://localhost:4173/'
const out = process.env.SHOT_DIR || 'proof/ui'
const review = `${out}/review`
mkdirSync(review, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge' })

async function shot(page, name) {
  await page.screenshot({ path: `${out}/${name}.png` })
  await page.screenshot({ path: `${review}/${name}.jpg`, type: 'jpeg', quality: 72, scale: 'css' })
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
await shot(page, '01-gate')

await page.getByRole('button', { name: /demo graveyard/i }).click()
await page.waitForTimeout(2800)
await shot(page, '02-graveyard')

// Click a grave through the accessible list so the shot is deterministic.
await page.evaluate(() => {
  const buttons = document.querySelectorAll('ul[aria-label="Graves"] button')
  const target = buttons[8] ?? buttons[0]
  if (target instanceof HTMLElement) target.click()
})
await page.waitForTimeout(1800)
await shot(page, '03-autopsy')

await page.getByRole('button', { name: /write the obituary/i }).click()
await page.waitForTimeout(1500)
await shot(page, '04-obituary')

// Mobile layout
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await mobile.goto(url, { waitUntil: 'networkidle' })
await mobile.getByRole('button', { name: /demo graveyard/i }).click()
await mobile.waitForTimeout(2400)
await mobile.evaluate(() => {
  const buttons = document.querySelectorAll('ul[aria-label="Graves"] button')
  const target = buttons[2] ?? buttons[0]
  if (target instanceof HTMLElement) target.click()
})
await mobile.waitForTimeout(1200)
await mobile.screenshot({ path: `${out}/05-mobile.png` })
await mobile.screenshot({ path: `${review}/05-mobile.jpg`, type: 'jpeg', quality: 72, scale: 'css' })

// Reduced motion: the scene must render without camera animation
const calm = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
await calm.goto(url, { waitUntil: 'networkidle' })
await calm.getByRole('button', { name: /demo graveyard/i }).click()
await calm.waitForTimeout(1200)
await calm.screenshot({ path: `${review}/06-reduced-motion.jpg`, type: 'jpeg', quality: 72, scale: 'css' })

await browser.close()
console.log('shots written to', out)
