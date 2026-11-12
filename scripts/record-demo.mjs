import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.env.DEMO_URL || 'http://localhost:4173/'
const dir = 'video/raw'
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir, size: { width: 1920, height: 1080 } },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

const wait = (ms) => page.waitForTimeout(ms)
const glide = async (x, y, steps = 24) => {
  const from = { x: 960, y: 540 }
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((x - from.x) * i) / steps, from.y + ((y - from.y) * i) / steps)
    await wait(16)
  }
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)
await page.screenshot({ path: 'video/raw/frame-gate.png' })
await wait(5000)

// Enter the demo graveyard
await page.getByRole('button', { name: /demo graveyard/i }).click()
await wait(6000)
await glide(1250, 780)
await wait(1200)
await page.screenshot({ path: 'video/raw/frame-yard.png' })
await wait(1800)

// Open a grave
await page.evaluate(() => {
  const b = document.querySelectorAll('ul[aria-label="Graves"] button')[8]
  if (b instanceof HTMLElement) b.click()
})
await wait(4500)
await page.screenshot({ path: 'video/raw/frame-autopsy.png' })
await glide(1450, 520)
await wait(2500)
await glide(1450, 700)
await wait(3000)

// The obituary
await page.getByRole('button', { name: /write the obituary/i }).click()
await wait(3500)
await page.screenshot({ path: 'video/raw/frame-obituary.png' })
await wait(5000)

// Close and return
await page.getByRole('button', { name: /back to the graveyard/i }).click()
await wait(1800)
await page.keyboard.press('Escape')
await wait(1800)
await page.getByRole('button', { name: /change graveyard/i }).click()
await wait(2400)

// End card
await page.goto(`${url}endcard.html`, { waitUntil: 'load' })
await wait(7000)

const video = page.video()
await context.close()
await browser.close()
const path = video ? await video.path() : ''
console.log('recording:', path)
