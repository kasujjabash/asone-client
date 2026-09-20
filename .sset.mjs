import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const toks = JSON.parse(readFileSync('./.tokens.json', 'utf8'))
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('JS ERROR:', e.message))
await page.goto('http://localhost:5173/')
await page.evaluate((t) => { localStorage.setItem('asone.access', t.access); localStorage.setItem('asone.refresh', t.refresh) }, toks.SCHOOL_STAFF)
await page.goto('http://localhost:5173/settings')
await page.waitForTimeout(3000)
console.log('alerts:', (await page.locator('.alert').allTextContents()).map(t=>t.slice(0,70)))
console.log('tabs:', JSON.stringify(await page.locator('.tabbar__tab').allTextContents()))
// Where do the label and its input sit?
const boxes = await page.locator('.settings-section .textfield, .settings-section .select').evaluateAll(els => els.map(e => {
  const l = e.querySelector('label'); const i = e.querySelector('input,select')
  const lb = l?.getBoundingClientRect(); const ib = i?.getBoundingClientRect()
  return { label: l?.textContent?.trim().slice(0,22), labelTop: lb && Math.round(lb.top), inputTop: ib && Math.round(ib.top) }
}))
console.log(JSON.stringify(boxes, null, 0))
await page.screenshot({ path: '.sset.png', fullPage: true })
await browser.close()
