import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('docs/screenshots/content-update', { recursive: true });
const facts = { pulse: ['22-member', '6–10 July 2026', 'Owambe'], orbit: ['approximately 250', '11-member', 'six major'], nacre: ['Faculty Social Secretary', 'Another after-party', 'student mobilisation'], 'kiln-co': ['₦2.5 million', '500 attendees', 'a year'] };
for (const width of [1440, 1024, 430, 375]) {
  await page.setViewportSize({ width, height: 932 });
  for (const [slug, terms] of Object.entries(facts)) {
    assert.equal((await page.goto(`${base}/work/${slug}`)).status(), 200);
    const article = page.locator('article');
    const text = await article.innerText();
    terms.forEach(term => assert.ok(text.includes(term), `${slug}: missing ${term}`));
    assert.doesNotMatch(text, /oat milk|App Store|sell-through|Skincare|pre-orders|Mira Alvarez/);
    await article.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = "eager"; return image.decode(); })));
    assert.equal(await article.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.locator('#overview').evaluate(el => el.parentElement.scrollWidth > el.parentElement.clientWidth + 1), false, `${slug}: content overflow at ${width}`);
    assert.equal(await page.getByRole('link', { name: 'Download portfolio PDF', exact: true }).count(), 0);
    if (width === 1440 || width === 375) {
      await page.screenshot({ path: `docs/screenshots/content-update/${slug}-${width}.png` });
      await page.locator('#contribution').evaluate(el => el.scrollIntoView());
      await page.screenshot({ path: `docs/screenshots/content-update/${slug}-${width}-detail.png` });
    }
  }
}
assert.deepEqual(errors, []);
await browser.close();
console.log('Passed: four case studies across four viewport sizes, source facts, imagery, overflow, no TL;DR download buttons and runtime errors.');
