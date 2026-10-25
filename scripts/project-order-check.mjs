import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {contentSource} from './content-source.mjs';
const {projects} = await contentSource();
const slugs = projects.map(project => project.slug);
const key = `portfolio-project-order:v1:${slugs.join(',')}`;
// Enumerate all Fisher–Yates choices and fallback choices: all 23 allowed
// arrangements must have exactly equal weight, not merely look random in a sample.
const exports = {};
new Function('exports', ts.transpileModule(await readFile('src/lib/shuffle-projects.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText)(exports);
const counts = new Map();
for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) for (let d = 0; d < 23; d++) {
  const draws = [(a + .5) / 4, (b + .5) / 3, (c + .5) / 2, (d + .5) / 23];
  const result = exports.nextProjectOrder(slugs, () => draws.shift());
  assert.notDeepEqual(result, slugs);
  assert.equal(result[4], slugs[4]);
  const signature = result.join();
  counts.set(signature, (counts.get(signature) || 0) + 1);
}
assert.equal(counts.size, 23);
assert.ok([...counts.values()].every(value => value === 24), 'Biased shuffle');
for (const random of [() => 0, () => .999]) assert.notDeepEqual(exports.nextProjectOrder(slugs, random), slugs);

const base = process.env.BASE_URL || 'http://localhost:3003';
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const settledOrder = async page => {
  await page.waitForFunction(() => {
    const ids = [...document.querySelectorAll('[data-project-list] > [data-project-slug]')].map(e => e.dataset.projectSlug);
    return ids.length === 5 && ids.join() === window.__portfolioProjectOrder?.join();
  });
  return page.locator('[data-project-list] > [data-project-slug]').evaluateAll(es => es.map(e => e.dataset.projectSlug));
};
try {
  const context = await browser.newContext({reducedMotion: 'reduce', viewport: {width: 1440, height: 932}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {if (/hydration|did not match/i.test(m.text())) errors.push(m.text());});
  await page.goto(base + '/work');
  const original = await settledOrder(page);
  let expected = original;
  assert.deepEqual(new Set(original), new Set(slugs));
  assert.equal(original[4], slugs[4]);
  assert.deepEqual(JSON.parse(await page.evaluate(key => sessionStorage.getItem(key), key)), original);
  await page.reload();
  assert.deepEqual(await settledOrder(page), original);
  await page.goto(base + '/?window=work');
  assert.deepEqual(await settledOrder(page), original);
  await page.getByRole('button', {name: 'Close My Work', exact: true}).filter({visible: true}).first().click();
  await page.waitForFunction(() => !document.querySelector('[data-window-id=work]'));
  expected = await page.evaluate(() => window.__portfolioProjectOrder);
  assert.notDeepEqual(expected, original);
  assert.equal(expected[4], slugs[4]);
  await page.getByRole('navigation', {name: 'Portfolio', exact: true}).getByRole('link', {name: 'My Work', exact: true}).click();
  assert.deepEqual(await settledOrder(page), expected);
  await page.locator('[data-project-list] > [data-project-slug]').first().click();
  await page.waitForURL(base + '/work/' + expected[0]);
  await page.getByRole('link', {name: 'Works — Back to all work'}).click();
  assert.deepEqual(await settledOrder(page), expected);
  await page.setViewportSize({width: 375, height: 932});
  await page.goto(base + '/work');
  assert.deepEqual(await settledOrder(page), expected);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  assert.deepEqual(errors, []);
  await context.close();

  // Real transitions: do not change either React's order or the CSS order until
  // the exit shell and real window are gone. Repeat on desktop and mobile.
  for (const width of [1440, 375]) {
    const session = await browser.newContext({viewport: {width, height: 932}, reducedMotion: 'no-preference'});
    const page = await session.newPage();
    await page.goto(base + '/?window=work');
    const settled = () => page.waitForFunction(() => !document.querySelector('[data-window-animation-shell]') && ![...document.querySelectorAll('[data-window-id]')].some(node => node.dataset.windowTransition));
    await settledOrder(page); await settled();
    for (let cycle = 0; cycle < 3; cycle++) {
      const shown = await settledOrder(page);
      // Filtering and focusing must not change the underlying order.
      await page.getByRole('button', {name: width >= 810 ? 'Events & Conferences' : 'Events', exact: true}).filter({visible: true}).first().click();
      assert.deepEqual(await page.evaluate(() => window.__portfolioProjectOrder), shown);
      await page.getByRole('button', {name: width >= 810 ? 'All work' : 'All', exact: true}).filter({visible: true}).first().click();
      assert.deepEqual(await settledOrder(page), shown);
      await page.getByRole('button', {name: 'Close My Work', exact: true}).filter({visible: true}).first().click();
      assert.deepEqual(await page.evaluate(() => window.__portfolioProjectOrder), shown, 'Shuffled during closing animation');
      await page.waitForFunction(() => !document.querySelector('[data-window-id=work]') && !document.querySelector('[data-window-animation-shell]'));
      const next = await page.evaluate(() => window.__portfolioProjectOrder);
      assert.notDeepEqual(next, shown);
      assert.equal(next[4], slugs[4]);
      await page.getByRole('navigation', {name: 'Portfolio', exact: true}).getByRole('link', {name: 'My Work', exact: true}).click();
      await settled();
      assert.deepEqual(await settledOrder(page), next);
    }
    await session.close();
  }

  // Deterministic random inputs prove a fresh session generates rather than inheriting
  // a prior visitor's order. A real random shuffle may legitimately repeat by chance.
  const freshOrders = [];
  for (const value of [0, .99]) {
    const session = await browser.newContext({reducedMotion: 'reduce'});
    await session.addInitScript(value => {Math.random = () => value;}, value);
    const page = await session.newPage();
    await page.goto(base + '/work');
    const order = await settledOrder(page);
    assert.equal(order[4], slugs[4]);
    freshOrders.push(order);
    await session.close();
  }
  assert.notDeepEqual(freshOrders[0], freshOrders[1]);

  // Hold hydration scripts: the first visible CSS order must already match the
  // session, and releasing hydration must preserve every card's rectangle.
  const prepaint = await browser.newContext({reducedMotion: 'reduce', viewport: {width: 1440, height: 932}});
  const fixed = [slugs[3], slugs[2], slugs[1], slugs[0], slugs[4]];
  await prepaint.addInitScript(({key, fixed}) => sessionStorage.setItem(key, JSON.stringify(fixed)), {key, fixed});
  const pageBefore = await prepaint.newPage();
  let release;
  const gate = new Promise(resolve => {release = resolve;});
  await pageBefore.route('**/_next/**', async route => {
    if (route.request().resourceType() === 'script') await gate;
    await route.continue();
  });
  await pageBefore.goto(base + '/work', {waitUntil: 'commit'});
  await pageBefore.waitForFunction(() => {
    const list = document.querySelector('[data-project-list]');
    return list && getComputedStyle(list).display === 'flex';
  });
  await pageBefore.evaluate(() => document.fonts.ready);
  const geometry = () => pageBefore.locator('[data-project-list] > [data-project-slug]').evaluateAll(es => es.map(e => ({slug: e.dataset.projectSlug, y: e.getBoundingClientRect().y, h: e.getBoundingClientRect().height})).sort((a, b) => a.y - b.y));
  const before = await geometry();
  assert.deepEqual(before.map(e => e.slug), fixed);
  release();
  assert.deepEqual(await settledOrder(pageBefore), fixed);
  const after = await geometry();
  for (let i = 0; i < before.length; i++) {
    assert.ok(Math.abs(before[i].y - after[i].y) < 1, 'Hydration changed card position');
    assert.ok(Math.abs(before[i].h - after[i].h) < 1, 'Hydration changed card height');
  }
  await prepaint.close();

  const blocked = await browser.newContext({reducedMotion: 'reduce'});
  await blocked.addInitScript(() => Object.defineProperty(window, 'sessionStorage', {get() {throw new Error('Storage blocked');}}));
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base + '/work');
  assert.deepEqual(await settledOrder(blockedPage), slugs);
  await blocked.close();
  console.log('Passed first-four shuffle, fixed fifth, stable visible/navigation order, three distinct reopen cycles on desktop/mobile, post-animation preparation, pre-paint/hydration geometry, fresh sessions and storage fallback.');
} finally {await browser.close();}
