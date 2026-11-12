import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('proof/rank/refs', { recursive: true })

const refs = [
  ['linear', 'https://linear.app/'],
  ['raycast', 'https://www.raycast.com/'],
  ['adarkroom', 'https://adarkroom.doublespeakgames.com/'],
  ['paperclips', 'https://www.decisionproblem.com/paperclips/'],
  ['itchio', 'https://itch.io/games/tag-halloween'],
]

const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, url] of refs) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `proof/rank/refs/${name}.png` })
    console.log('captured', name)
  } catch (e) {
    console.log('failed', name, e.message.slice(0, 80))
  }
  await page.close()
}
await browser.close()
