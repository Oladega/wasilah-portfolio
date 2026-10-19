# External HTTP accessibility investigation

Verified on 20 October 2026 (Africa/Lagos). Production target: https://wasilah-portfolio.vercel.app. Results below are live HTTP results, not inferred from local tests.

## Findings and root cause

No missing route, client-only content, redirect loop, bot restriction, noindex or incorrect response MIME type was reproduced. All ten canonical pages and both discovery endpoints returned 200 for ordinary browser, Googlebot and Bingbot user agents. Unknown pages/projects returned 404. All three user agents received identical script-free main content. Requests required no authentication, cookies or JavaScript. A Googlebot user-agent probe is not proof that Google itself fetched or indexed the page.

The external browsing tool independently returned “not accessible via this tool” for About, sitemap and robots while direct HTTPS requests and JavaScript-disabled Chrome retrieved those same URLs. This establishes a tool-specific retrieval failure in this investigation; its internal cause and the cause/timing of the earlier reported failures remain unknown. No crawler workaround or unnecessary application routing rewrite was introduced.

## Production route results

| Route | HTTP status | Server-rendered content | Metadata | Result |
| --- | ---: | --- | --- | --- |
| `/` | 200 | Readable, 257 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/about` | 200 | Readable, 3607 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work` | 200 | Readable, 2443 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/resume` | 200 | Readable, 2874 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/contact` | 200 | Readable, 342 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work/halden` | 200 | Readable, 1125 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work/pulse` | 200 | Readable, 2336 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work/orbit` | 200 | Readable, 2407 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work/nacre` | 200 | Readable, 2137 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/work/kiln-co` | 200 | Readable, 2143 characters | Unique title, description, canonical, index/follow, OG | Pass |
| `/sitemap.xml` | 200 | N/A | N/A | Pass |
| `/robots.txt` | 200 | N/A | N/A | Pass |
| `/missing-page` | 404 | N/A | N/A | Pass |
| `/work/missing-project` | 404 | N/A | N/A | Pass |

No redirects occurred on the canonical requests. HTML responses use text/html; sitemap uses application/xml; robots uses text/plain. Production headers identify Vercel and show both cache HIT and MISS responses; no HTTP X-Robots-Tag noindex directive was found. The sitemap contains exactly ten canonical absolute URLs. Robots permits public crawling and links the sitemap. The original résumé responds 200 as application/pdf with a PDF signature.

## Awards in the live About response

- Penultimate of the Year
- Exco of the Year
- Most Social Female Student
- Most Influential in Politics
- Finalist of the Year
- Most Influential in Politics
- Most Supportive NSASAite
- Most Popular Female Student
- Special Recognition Award

Award checks inspect main text parsed directly from the response after removing scripts, styles, templates and noscript. This prevents JSON-LD or serialized React data from falsely satisfying the content test. The expected award list is read from siteConfig.about.awards, rather than copied into the test. No award details were fabricated.

## Architecture and deployment inspection

The App Router statically generates each page with output: export; the HTML exists in out after next build. Public pages are Server Components; project pages expose the existing Work window during static rendering. There is no checked-in middleware, proxy or vercel.json rewrite configuration, and no catch-all homepage rewrite was found. Existing window behavior and styling were unchanged.

GitHub reports Vercel success (“Deployment has completed”) for main commit 5b9783f15bda92ece7dd50621c22e70d9614b9ee. The linked production deployment is https://vercel.com/kehindes-projects-a34b9dcd/wasilah-portfolio/FEw9ea9z8wptQ9Kp9hAvnFffZPqD. Live titles, public content, sitemap and robots confirm the SEO update is serving. No local Vercel project link or authenticated Vercel CLI was available; dashboard-only build/runtime logs, project overrides and environment variables were not inspected. Their absence from local inspection is not evidence of a deployment failure.

## Changes

- scripts/external-http-check.mjs: manual redirect tracing; headers and MIME checks; raw response parsing; page-specific content, canonical, metadata and crawler parity checks; sitemap XML and PDF validation; actual no-JavaScript browser navigation; local preview startup and cleanup; evidence saved even on failure.
- scripts/content-source.mjs: shared test loader for the application's typed data sources.
- scripts/seo-check.mjs: award expectations now derive from the real content source.
- package.json: repeatable local-build and live-production commands.
- README and this report: commands, evidence and limits. No production UI or routing files changed.

## Reproduce

```sh
npm run typecheck
npm run lint
npm run test:external
npm run test:external:production
BASE_URL=http://localhost:3003 npm run test:seo
BASE_URL=http://localhost:3003 npm run test:navigation
BASE_URL=http://localhost:3003 node scripts/seo-browser-check.mjs
```

The local external test builds the static export and starts its own production preview on port 3097 (LOCAL_AUDIT_PORT overrides it); it stops the preview after completion. Existing SEO/UI commands require a separate preview on their BASE_URL. Set CHROME_PATH when Chrome is installed elsewhere. Live HTTP checks use explicit browser/search user agents only to compare ordinary public responses; they do not bypass security.

## Validation results

TypeScript, ESLint and the fresh production build passed. The self-starting local audit passed 42 HTTP checks and ten JavaScript-disabled pages; the independent live production audit passed the same 42 checks and ten pages. The existing SEO suite, four-viewport desktop/window navigation regression, and 375px mobile runtime/hydration checks passed. Browser back/forward, direct project refresh and explicit desktop deep links passed. No runtime or hydration errors were observed. This investigation did not claim a new animation-performance or native-mobile benchmark.

## Limits and deployment actions

Production accessibility is independently verified through direct HTTPS and no-JavaScript Chrome for the tested routes and request configurations. The separate browsing service still could not retrieve the URLs; universal access through every external service cannot be claimed. Search indexing and ownership verification are separate dashboard actions and have not been confirmed. No deployment was performed for this investigation. No deployment change is required to repair the already passing live routes. These new tests/documentation remain local until a separately authorized push.
