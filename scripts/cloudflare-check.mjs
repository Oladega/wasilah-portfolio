import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {contentSource} from './content-source.mjs';

const base = process.env.BASE_URL || 'http://localhost:3010';
const {projects} = await contentSource();
const routes = ['/', '/about', '/work', '/resume', '/contact', ...projects.map(p => `/work/${p.slug}`)];
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  const titles = new Set();
  for (const path of routes) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    assert.match(response.headers()['x-robots-tag'], /noindex/);
    assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex, follow');
    assert.equal(new URL(await page.locator('link[rel=canonical]').getAttribute('href')).href, `https://wasilah.online${path}`);
    const title = await page.title();
    assert.ok(!titles.has(title), `Duplicate title: ${path}`);
    titles.add(title);
    assert.equal(await page.locator('h1').count(), 1, path);
    assert.ok((await page.locator('main').innerText()).length > 100, path);
    assert.ok(await page.locator('meta[name=description]').getAttribute('content'));
    assert.equal(await page.locator('meta[name=google-site-verification]').count(), 1);
    assert.match(await page.locator('meta[property="og:image"]').getAttribute('content'), /^https:\/\/wasilah.online\/og\//);
    const data = await page.locator('script[type="application/ld+json"]').textContent();
    assert.equal(JSON.parse(data)['@context'], 'https://schema.org');
    assert.ok(!JSON.stringify(JSON.parse(data)).includes('wasilah-portfolio.vercel.app'));
  }
  for (const path of ['/missing-page', '/work/missing-project']) {
    assert.equal((await context.request.get(base + path)).status(), 404, path);
  }
  const sitemap = await context.request.get(base + '/sitemap.xml');
  assert.equal(sitemap.status(), 200);
  assert.match(sitemap.headers()['content-type'], /xml/);
  assert.ok(!(await sitemap.text()).includes('<loc>'), 'Staging sitemap must be empty');
  const robots = await context.request.get(base + '/robots.txt');
  assert.equal(robots.status(), 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/wasilah.online\/sitemap.xml/);
  await page.goto(base);
  const js = await page.locator('script[src]').first().getAttribute('src');
  const script = await context.request.get(base + js);
  assert.equal(script.status(), 200);
  assert.match(script.headers()['cache-control'], /immutable/);
  const pdfPath = '/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf';
  const pdf = await context.request.get(base + pdfPath);
  assert.equal(pdf.status(), 200);
  assert.match(pdf.headers()['content-type'], /pdf/);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash(await pdf.body()), hash(await readFile('public' + pdfPath)));
  const range = await context.request.get(base + pdfPath, {headers: {Range: 'bytes=0-99'}});
  // HTTP allows a server to ignore Range and return the complete representation.
  assert.ok([200, 206].includes(range.status()));
  if (range.status() === 206) assert.equal((await range.body()).length, 100);
  else assert.equal(hash(await range.body()), hash(await pdf.body()));
  for (const path of ['/fonts/dm-serif-display-regular.ttf', '/pdfjs/pdf.worker.min.mjs']) {
    const asset = await context.request.get(base + path);
    assert.equal(asset.status(), 200, path);
    assert.match(asset.headers()['cache-control'], /max-age=86400/);
  }
  assert.equal(await page.locator('script[src*="_vercel/insights"]').count(), 0);
  console.log(`Passed ${routes.length} routes without JavaScript, metadata, JSON-LD, staging noindex, sitemap/robots, 404s, immutable JS, font/PDF.js caching and unchanged PDF. Range request returned ${range.status()}.`);
} finally {
  await browser.close();
}
