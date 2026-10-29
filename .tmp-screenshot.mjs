import { chromium } from 'playwright-chromium'
import { mkdirSync } from 'fs'

mkdirSync('.tmp-shots', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173')
await page.waitForTimeout(1000)

async function shot(name) {
  await page.screenshot({ path: `.tmp-shots/${name}.png` })
  console.log('shot:', name)
}

// Home screen
await shot('01-home')

// Settings panel
const settingsBtn = page.getByRole('button', { name: /settings/i })
if (await settingsBtn.count()) {
  await settingsBtn.first().click()
  await page.waitForTimeout(400)
  await shot('02-settings')
  // close it
  const closeBtn = page.getByRole('button', { name: /close|back|×/i })
  if (await closeBtn.count()) await closeBtn.first().click()
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}

// Stats panel
const statsBtn = page.getByRole('button', { name: /stats/i })
if (await statsBtn.count()) {
  await statsBtn.first().click()
  await page.waitForTimeout(400)
  await shot('03-stats')
  const closeBtn = page.getByRole('button', { name: /close|back|×/i })
  if (await closeBtn.count()) await closeBtn.first().click()
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}

// Tutorial home
const tutorialBtn = page.getByRole('button', { name: /tutorial/i })
if (await tutorialBtn.count()) {
  await tutorialBtn.first().click()
  await page.waitForTimeout(500)
  await shot('04-tutorial-home')

  // open lesson 1
  const lessonLinks = page.locator('button, a').filter({ hasText: /overview|lesson 1|1\./i })
  if (await lessonLinks.count()) {
    await lessonLinks.first().click()
    await page.waitForTimeout(500)
    await shot('05-tutorial-lesson1')
  }

  // try to go to lesson 3 (hand evaluation) via next button multiple times
  for (let i = 0; i < 2; i++) {
    const nextBtn = page.getByRole('button', { name: /next/i })
    if (await nextBtn.count()) {
      await nextBtn.first().click()
      await page.waitForTimeout(400)
    }
  }
  await shot('06-tutorial-lesson3')

  // back to home
  const homeBtn = page.getByRole('button', { name: /home|back to home|exit/i })
  if (await homeBtn.count()) {
    await homeBtn.first().click()
    await page.waitForTimeout(400)
  } else {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(600)
  }
}

// New game -> table
const newGameBtn = page.getByRole('button', { name: /new game/i })
if (await newGameBtn.count()) {
  await newGameBtn.first().click()
  await page.waitForTimeout(1500)
  await shot('07-table-dealt')

  // try clicking a bid (Pass) repeatedly to progress the auction, capturing mid-auction
  await page.waitForTimeout(800)
  await shot('08-table-bidding')

  // click Pass a few times if visible to let AI/human pass through
  for (let i = 0; i < 6; i++) {
    const passBtn = page.getByRole('button', { name: /^pass$/i })
    if ((await passBtn.count()) && (await passBtn.first().isEnabled())) {
      await passBtn.first().click()
      await page.waitForTimeout(900)
    } else {
      await page.waitForTimeout(700)
    }
  }
  await shot('09-table-after-auction')

  await page.waitForTimeout(2000)
  await shot('10-table-play-phase')

  // try clicking any enabled card in south hand to play into a trick
  await page.waitForTimeout(1500)
  await shot('11-table-mid-trick')
}

await browser.close()
console.log('done')
