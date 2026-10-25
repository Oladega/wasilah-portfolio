import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
  const page = await browser.newPage({viewport: {width: 430, height: 932}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/about');
  const carousel = page.getByRole('region', {name: 'About Me photos'});
  const count = carousel.locator('span');
  await carousel.waitFor();
  await carousel.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await count.filter({hasText: '2 / 2'}).waitFor({timeout: 4000});
  await count.filter({hasText: '1 / 2'}).waitFor({timeout: 3000});
  await page.waitForTimeout(500);
  // Swipe right from the first photo: loop smoothly to the last photo.
  const box = await carousel.boundingBox();
  await page.mouse.move(box.x + 70, box.y + 150);
  await page.mouse.down();
  await page.mouse.move(box.x + 220, box.y + 150, {steps: 8});
  await page.mouse.up();
  await count.filter({hasText: '2 / 2'}).waitFor();
  await page.waitForTimeout(650);
  assert.equal(await count.innerText(), '2 / 2');
  await count.filter({hasText: '1 / 2'}).waitFor({timeout: 3000});
  // Visibility pauses must leave the index unchanged even with a live timer.
  await page.evaluate(() => {Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(650);
  const hiddenIndex = await count.innerText();
  await page.waitForTimeout(2300);
  assert.equal(await count.innerText(), hiddenIndex);
  await page.evaluate(() => {delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange'));});
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(650);
  const offscreenIndex = await count.innerText();
  await page.waitForTimeout(2300);
  assert.equal(await count.innerText(), offscreenIndex);
  // Live preference changes stop autoplay, while keyboard controls remain functional.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await carousel.scrollIntoViewIfNeeded();
  const reducedIndex = await count.innerText();
  await page.waitForTimeout(2300);
  assert.equal(await count.innerText(), reducedIndex);
  await carousel.getByRole('button', {name: 'Next photo'}).focus();
  await page.keyboard.press('Enter');
  assert.notEqual(await count.innerText(), reducedIndex);
  for (const width of [375, 430, 768, 1440]) {
    await page.setViewportSize({width, height: 932});
    await page.goto(base + '/?window=about');
    await page.getByRole('dialog', {name: 'About Wasilah'}).waitFor();
    const layout = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('img[alt="Wasilah at a costume event"],img[alt^="Studio portrait"]')].filter(img => img.getBoundingClientRect().width > 0);
      const images = visible.map(img => {const rect = img.getBoundingClientRect();return {w: rect.width, h: rect.height, ratio: rect.width / rect.height};});
      return {images, overflow: document.documentElement.scrollWidth > innerWidth + 1};
    });
    assert.equal(layout.overflow, false);
    if (width >= 810) assert.ok(Math.abs(layout.images[0].h - layout.images[1].h) < 1, 'Desktop image heights');
    else for (const image of layout.images) assert.ok(Math.min(Math.abs(image.ratio - .75), Math.abs(image.ratio - .8)) < .01, 'Natural proportions');
  }
  assert.deepEqual(errors, []);
  console.log('Passed autoplay/loop, swipe and timer reset, visibility pauses, live reduced motion, keyboard navigation, equal desktop heights and four responsive layouts.');
} finally { await browser.close(); }
