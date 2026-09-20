import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const toks = JSON.parse(readFileSync('./.tokens.json', 'utf8'))
const ROUTES = ['/dashboard','/reports','/reports/inventory','/reports/price-list','/reports/procurement-costs',
  '/orders','/orders/new','/receiving','/shipments','/shipments/history','/production-orders','/production-orders/new',
  '/adjustments','/adjustments/new','/transfers','/transfers/new','/backorders','/inventory','/stock-history',
  '/kits','/kits/new','/schools','/warehouses','/warehouses/2','/tailoring-centers','/users','/settings',
  '/settings?tab=reason-codes','/adjustments/transfers']
const browser = await chromium.launch()
const found = []
for (const role of Object.keys(toks)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  let current = ''
  page.on('response', r => {
    const u = r.url()
    if (r.status() >= 400 && u.includes('/api/')) found.push(`${role} ${current} -> ${r.status()} ${u.split('/api')[1].split('?')[0]}`)
  })
  page.on('pageerror', e => found.push(`${role} ${current} -> JS: ${e.message.slice(0,90)}`))
  await page.goto('http://localhost:5173/')
  await page.evaluate((t) => { localStorage.setItem('asone.access', t.access); localStorage.setItem('asone.refresh', t.refresh) }, toks[role])
  for (const route of ROUTES) {
    current = route
    await page.goto('http://localhost:5173' + route).catch(()=>{})
    await page.waitForTimeout(900)
  }
  await ctx.close()
}
await browser.close()
console.log(found.length ? found.join('\n') : 'NO FAILURES ACROSS ALL ROLES AND ROUTES')
