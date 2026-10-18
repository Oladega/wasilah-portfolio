import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const base = process.env.BASE_URL || 'http://localhost:3001';
for (const width of [1440, 430]) {
  await page.setViewportSize({ width, height: 932 });
  await page.goto(base);
  const nav = page.getByRole('navigation', { name: 'Portfolio', exact: true });
  const actions = nav.getByRole('button');
  for (let index = 0; index < 4; index++) {
    await actions.nth(index).click();
    assert.equal(await page.getByRole('dialog').count(), 1);
    const backdrop = page.getByRole('button', { name: 'Dismiss overlay' });
    assert.equal(await backdrop.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0.1)');
    // A coordinate click on another desktop action must only dismiss the current modal.
    // Desktop actions now sit beneath the window; click the exposed backdrop.
    await page.mouse.click(4, 60);
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await backdrop.count(), 0);
    await actions.nth((index + 1) % 4).click();
    assert.equal(await page.getByRole('dialog').count(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.ok(await actions.nth((index + 1) % 4).evaluate(el => el === document.activeElement));
  }
  await page.getByRole('button', { name: 'See my work' }).click();
  assert.equal(await page.getByRole('dialog', { name: 'Work', exact: true }).count(), 1);
  await page.getByRole('dialog').getByRole('button', { name: width === 1440 ? 'Events & Conferences' : 'Events', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 1, 'Inside clicks must keep the modal open');
  await page.keyboard.press('Escape');
}
await browser.close();
console.log('Passed: all overlay actions, outside clicks consumed, no stacking, 10% backdrop, inside clicks, Escape and focus restoration on desktop and mobile.');
