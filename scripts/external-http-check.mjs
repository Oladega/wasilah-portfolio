import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {contentSource} from './content-source.mjs';

const local = process.argv.includes('--local');
const port = process.env.LOCAL_AUDIT_PORT || '3097';
const base = local ? `http://127.0.0.1:${port}` : (process.env.BASE_URL || 'https://wasilah-portfolio.vercel.app');
const canonical = (process.env.SITE_URL || 'https://wasilah-portfolio.vercel.app').replace(/\/$/, '');
const {siteConfig, projects, profile, contacts} = await contentSource();
const routes = ['/', '/about', '/work', '/resume', '/contact', ...projects.map(p => `/work/${p.slug}`)];
const agents = {
  browser: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
};
const results = {checkedAt: new Date().toISOString(), base, scope: local ? 'local static production export' : 'live production HTTP', requests: [], noJavaScript: []};
let server, browser;
const normalize = text => text.replace(/\s+/g, ' ').trim();
async function request(path, userAgent) {
  let url = base + path;
  const redirects = [];
  for (let i = 0; i < 8; i++) {
    const response = await fetch(url, {redirect: 'manual', headers: {'User-Agent': userAgent}, signal: AbortSignal.timeout(30000)});
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const destination = new URL(response.headers.get('location'), url);
      assert.equal(destination.origin, new URL(base).origin, 'Unexpected cross-origin redirect');
      redirects.push({url, status: response.status, location: destination.href});
      await response.body?.cancel();
      url = destination.href;
      continue;
    }
    return {url, status: response.status, headers: Object.fromEntries(response.headers), redirects, body: await response.text()};
  }
  throw new Error(`Redirect loop: ${path}`);
}

try {
  if (local) {
    server = spawn(process.execPath, ['scripts/serve.mjs'], {env: {...process.env, PORT: port}, stdio: ['ignore', 'pipe', 'pipe']});
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Preview server did not start')), 10000);
      server.once('error', error => {clearTimeout(timer); reject(error);});
      server.once('exit', code => {clearTimeout(timer); reject(new Error(`Preview server exited: ${code}`));});
      server.stderr.on('data', data => process.stderr.write(data));
      server.stdout.on('data', data => {
        if (data.toString().includes('Portfolio available')) {clearTimeout(timer); resolve();}
      });
    });
  }
  browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const parserContext = await browser.newContext({javaScriptEnabled: false, offline: true});
  const parser = await parserContext.newPage();
  const baseline = new Map();
  for (const [agent, userAgent] of Object.entries(agents)) {
    const titles = new Set();
    for (const path of [...routes, '/sitemap.xml', '/robots.txt', '/missing-page', '/work/missing-project']) {
      const response = await request(path, userAgent);
      const {body, ...record} = response;
      const entry = {path, agent, ...record, bytes: Buffer.byteLength(body), result: 'fail'};
      results.requests.push(entry);
      const missing = path.includes('missing-');
      assert.equal(response.status, missing ? 404 : 200, `${agent} ${path}`);
      assert.ok(!/noindex|none/i.test(response.headers['x-robots-tag'] || ''), `${path}: X-Robots-Tag`);
      if (missing) {entry.result = 'pass'; continue;}
      if (path === '/robots.txt') {
        assert.match(response.headers['content-type'], /text\/plain/i);
        assert.match(body, /Allow: \/(?:\r?\n|$)/);
        assert.ok(!body.includes('Disallow: /'));
        assert.ok(body.includes(canonical + '/sitemap.xml'));
      } else if (path === '/sitemap.xml') {
        assert.match(response.headers['content-type'], /(?:application|text)\/xml/i);
        const urls = await parser.evaluate(xml => {
          const document = new DOMParser().parseFromString(xml, 'application/xml');
          if (document.querySelector('parsererror')) throw new Error('Invalid sitemap XML');
          return [...document.querySelectorAll('loc')].map(e => e.textContent);
        }, body);
        assert.equal(urls.length, routes.length);
        assert.deepEqual(new Set(urls), new Set(routes.map(route => canonical + (route === '/' ? '/' : route))));
        entry.urls = urls;
      } else {
        assert.match(response.headers['content-type'], /text\/html/i);
        // Parse only the HTTP response. No hydration, browser navigation, or scripts run.
        const parsed = await parser.evaluate(html => {
          const document = new DOMParser().parseFromString(html, 'text/html');
          const graphs = [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent));
          document.querySelectorAll('script,style,template,noscript').forEach(e => e.remove());
          return {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            robots: document.querySelector('meta[name="robots"]')?.content,
            og: document.querySelector('meta[property="og:title"]')?.content,
            text: document.querySelector('main')?.textContent || '',
            links: [...document.querySelectorAll('a[href]')].map(e => e.getAttribute('href')),
            graphs,
          };
        }, body);
        const text = normalize(parsed.text);
        assert.ok(text.length > 100, `${path}: missing main content`);
        assert.ok(parsed.title && !titles.has(parsed.title), `${path}: duplicate/missing title`);
        titles.add(parsed.title);
        assert.ok(parsed.description && parsed.og);
        assert.equal(parsed.canonical, canonical + (path === '/' ? '/' : path));
        assert.equal(parsed.robots, 'index, follow');
        assert.ok(parsed.graphs.length);
        if (path !== '/') assert.ok(text.includes(profile.name) || path.startsWith('/work/'));
        if (path === '/about') {
          entry.awards = siteConfig.about.awards.flatMap(group => group.items.map(a => a.title));
          for (const award of entry.awards) assert.ok(text.includes(award), `Missing real award: ${award}`);
          for (const heading of ['Education', 'Work experience', 'Leadership experience', 'What I do']) assert.ok(text.includes(heading), `Missing About section: ${heading}`);
        }
        if (path === '/work') for (const project of projects) {
          assert.ok(text.includes(project.title));
          assert.ok(text.includes(normalize(project.description)));
          assert.ok(parsed.links.includes(`/work/${project.slug}`));
        }
        const project = projects.find(p => path === `/work/${p.slug}`);
        if (project) {
          assert.ok(text.includes(project.title));
          assert.ok(text.includes('MY CONTRIBUTION'));
          assert.ok(text.length > 800);
        }
        if (path === '/resume') {
          assert.ok(text.includes(profile.education[0].institution));
          assert.ok(parsed.links.includes(siteConfig.resume.path));
        }
        if (path === '/contact') for (const contact of contacts) assert.ok(parsed.links.includes(contact.href));
        if (agent === 'browser') baseline.set(path, text);
        else assert.equal(text, baseline.get(path), `${path}: different crawler content`);
        entry.metadata = {title: parsed.title, description: parsed.description, canonical: parsed.canonical, robots: parsed.robots};
        entry.serverRenderedCharacters = text.length;
      }
      entry.result = 'pass';
    }
  }
  const pdf = await request(siteConfig.resume.path, agents.browser);
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers['content-type'], /application\/pdf/i);
  assert.ok(pdf.body.startsWith('%PDF-'));
  results.resumeDownload = {status: pdf.status, contentType: pdf.headers['content-type']};
  await parserContext.close();
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 430, height: 932}});
  const page = await context.newPage();
  for (const path of routes) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200);
    assert.ok(normalize(await page.locator('main').innerText()).length > 100);
    results.noJavaScript.push({path, status: response.status(), readable: true});
  }
  await page.goto(base + '/about');
  await page.getByRole('navigation', {name: 'Portfolio pages'}).getByRole('link', {name: 'Work', exact: true}).click();
  await page.waitForURL(base + '/work');
  await page.goBack();
  assert.equal(new URL(page.url()).pathname, '/about');
  await page.goForward();
  assert.equal(new URL(page.url()).pathname, '/work');
  await page.reload();
  assert.ok((await page.locator('main').innerText()).includes(projects[0].title));
  results.noJavaScriptNavigation = 'pass';
  results.result = 'pass';
  console.log(`Passed ${results.requests.length} HTTP checks, ${routes.length} no-JavaScript routes, résumé PDF and navigation: ${base}`);
} catch (error) {
  results.result = 'fail';
  results.error = error.stack;
  process.exitCode = 1;
  console.error(error);
} finally {
  await browser?.close();
  server?.kill();
  if (server && server.exitCode === null) await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(2000)]);
  await writeFile(`docs/external-http-${local ? 'local' : 'production'}.json`, JSON.stringify(results, null, 2) + '\n');
}
