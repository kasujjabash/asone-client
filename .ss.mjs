import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const toks = JSON.parse(readFileSync('./.tokens.json', 'utf8'))
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1050 } })
const page = await ctx.newPage()
await page.goto('http://localhost:5173/')
await page.evaluate((t) => { localStorage.setItem('asone.access', t.access); localStorage.setItem('asone.refresh', t.refresh) }, toks.SCHOOL_STAFF)

await page.goto('http://localhost:5173/dashboard'); await page.waitForTimeout(2800)
const groups = await page.locator('.sidebar__group').evaluateAll(els => els.map(g => ({
  label: g.querySelector('.sidebar__group-label span')?.textContent?.trim(),
  items: [...g.querySelectorAll('.sidebar__group-items a')].map(a => a.textContent.trim()) })))
const solo = await page.locator('.sidebar__link--solo').allTextContents()
console.log('NAV groups:', JSON.stringify(groups), '| flat:', JSON.stringify(solo.map(s=>s.trim())))

// Deliveries to Confirm panel
const rowLinks = await page.locator('.attention__item a, .attention a').count()
const clickableRows = await page.locator('.attention__item--clickable').count()
const tile = await page.locator('a.kpi--link').count()
console.log(`Deliveries panel: rowLinks=${rowLinks} clickableRows=${clickableRows} clickableTiles=${tile}`)

await page.goto('http://localhost:5173/inventory'); await page.waitForTimeout(3000)
const buttons = await page.locator('button').allTextContents()
console.log('INVENTORY buttons:', JSON.stringify(buttons.filter(b => b.trim() && b.length < 30)))
console.log('tabs:', JSON.stringify(await page.locator('.tabbar__tab').allTextContents()))
await page.screenshot({ path: '.ss.png', fullPage: true })
await browser.close()
