import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
const calls = []
page.on('request', r => { if (r.url().includes('/auth/login')) calls.push(r.method()) })
await page.goto('http://localhost:5173/sign-in')
await page.waitForTimeout(1500)

await page.getByRole('button', { name: /sign in to system/i }).click()
await page.waitForTimeout(800)
console.log('empty submit -> errors:', JSON.stringify(await page.locator('.textfield__error').allTextContents()))
console.log('              -> API calls made:', calls.length)
console.log('              -> alert shown:', await page.locator('.alert').count())

await page.getByLabel('Email Address').fill('chrisis@asone.test')
await page.waitForTimeout(400)
console.log('after typing email -> errors:', JSON.stringify(await page.locator('.textfield__error').allTextContents()))

await page.getByRole('button', { name: /sign in to system/i }).click()
await page.waitForTimeout(700)
console.log('password still empty -> errors:', JSON.stringify(await page.locator('.textfield__error').allTextContents()))
console.log('                     -> API calls:', calls.length)
await page.screenshot({ path: '.login.png' })
await browser.close()
