import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL || 'http://localhost:3001';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const source = await readFile('/Users/user/Downloads/Atilade Wasilah portfolio.pdf');
const served = await page.request.get(`${base}/documents/portfolio.pdf`);
assert.equal(createHash('sha256').update(await served.body()).digest('hex'), createHash('sha256').update(source).digest('hex'), 'Download must match supplied PDF exactly');
await mkdir('docs/screenshots/pdf-media', { recursive: true });
for (const width of [1440, 430, 375]) {
 await page.setViewportSize({ width, height: 932 });
 for (const [slug, count] of Object.entries({halden:8,pulse:6,orbit:5,nacre:1,'kiln-co':6})) {
  assert.equal((await page.goto(`${base}/work/${slug}`)).status(),200);
  const gallery = page.locator('#gallery'); await gallery.locator('figure').first().waitFor({state:'attached'});
  assert.equal(await gallery.locator('figure').count(),count,`${slug} image count`);
  await gallery.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading='eager'; return image.decode(); })));
  assert.equal(await gallery.locator('img').evaluateAll(images => images.filter(image => image.naturalWidth===0 || !image.alt).length),0);
  assert.equal(await gallery.locator('img').evaluateAll(images => images.filter(image => Math.abs(image.clientWidth/image.clientHeight - image.naturalWidth/image.naturalHeight) > .02).length),0,'Gallery must preserve image proportions');
  assert.equal(await page.locator('#overview').evaluate(el => el.parentElement.scrollWidth > el.parentElement.clientWidth+1),false);
  assert.equal(await page.getByRole('link',{name:'Download portfolio PDF',exact:true}).count(),0);
  await gallery.evaluate(el => el.scrollIntoView());
  await page.screenshot({path:`docs/screenshots/pdf-media/${slug}-${width}.png`});
 }
 await page.goto(`${base}/#work`);
 const work=page.getByRole('dialog',{name:'Work',exact:true}); await work.waitFor();
 assert.equal(await work.locator('a[href^="/work/"]').count(),5);
 await work.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading='eager'; return image.decode(); })));
 await page.screenshot({path:`docs/screenshots/pdf-media/work-${width}.png`});
 assert.equal(await work.locator('img[src*="capabilities"],img[src*="impact"]').count(),0);
 const downloadEvent=page.waitForEvent('download');
 await work.getByRole('link',{name:'Download portfolio PDF ↓',exact:true}).click();
 assert.equal((await downloadEvent).suggestedFilename(),'Atilade-Wasilah-Portfolio.pdf');
}
assert.deepEqual(errors,[]);
await browser.close();
console.log('Passed: 26 images mapped to five projects, uncropped galleries at three viewport widths, text-only About overview, Work folder download and exact source PDF checksum.');
