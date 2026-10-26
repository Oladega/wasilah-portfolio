# Cloudflare Workers migration preparation

Prepared locally on 26 October 2026 on `feature/cloudflare-workers`, based on published commit `adc409a`. The user subsequently authorized pushing this isolated branch to GitHub. `vercel.json` disables Vercel automatic deployment for this branch only; main is unchanged. No Cloudflare authentication, upload, deployment, domain attachment or DNS change was performed. The Vercel production site is unaffected.

## Audit and adapter choice

- Next.js 16.4.2, React 19.3.1, App Router, TypeScript. `next.config.ts` retains `output: "export"` and `images.unoptimized: true`.
- Server Components execute during the build. The ten public page routes already export complete readable HTML, metadata and structured data. Five project paths use `generateStaticParams` and reject unknown slugs. There are no API routes, middleware, server actions, request-dependent pages, databases or authentication bindings.
- A new `vercel.json` disables automatic Vercel deployment only for `feature/cloudflare-workers`. The existing `npm run build`, `npm run dev`, Next config and Vercel Analytics dependency remain. The only application change conditionally omits Vercel Analytics on Cloudflare, where the Vercel collection endpoint does not exist. It remains enabled in ordinary Next/Vercel builds. An alternative analytics service has not been added.
- Environment inputs: `SITE_URL` (or legacy `NEXT_PUBLIC_SITE_URL`), `SITE_NOINDEX`, `VERCEL_ENV`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`. Cloudflare staging pins its origin to `https://wasilah.online` and sets noindex during the build. Current Google verification stays in the application. No secret is required to run or build this website; deployment credentials are separate.
- Images are already generated as responsive WebP files at build time. Sharp, the social-image generator and PDF worker preparation run under Node, not in the Worker. Locally hosted fonts and the original PDF are retained. PDF.js and Motion run in the browser.

Cloudflare currently recommends **vinext** for Next.js. `vinext check` reported 96% compatibility: 11 supported checks, one partial image-configuration check, zero issues. The image limitation does not block this site: it deliberately serves preoptimized static assets without request-time image resizing. Actual production builds and interaction tests passed, so there was no reason to introduce OpenNext as a second adapter. OpenNext remains an alternative if a future vinext compatibility regression appears.

Installed vinext 1.3.1, `@vinext/cloudflare` 1.2.1, Vite 8, React RSC integration, CSS Modules integration, Cloudflare Vite plugin 1.65 and Wrangler 4.152. This uses vinext's supported Wrangler configuration path rather than the newer CF CLI configuration path, retaining an explicit `wrangler.jsonc` and a locally tested Wrangler deployment artifact. Keep the lockfile. Node 22.13+ is required; validation used Node 22.17.

Sources: [Cloudflare Next.js guidance](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [vinext Workers setup and static exports](https://vinext.dev/docs/deploying/cloudflare), [OpenNext alternative](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/).

## Configuration and delivery

`wrangler.jsonc` names only `wasilah-portfolio-staging`, enables its `workers.dev` URL, and has **no production routes or custom domains**. The Cloudflare Vite plugin generates `dist/server/wrangler.json`; use that built config for preview/deployment, not the unbundled source config.

The Vite build prerenders all available pages. Workers Static Assets serves matching HTML, scripts, styles, images, fonts and PDFs directly. There is no catch-all SPA fallback that would hide missing routes. The vinext Worker handles metadata routes, missing paths and any adapter cache requests. No KV, R2, paid Images binding or cache service is provisioned or required. No `run_worker_first: true` rule forces every asset through JavaScript.

The generated `_headers` applies a one-year immutable browser cache to content-hashed JS/CSS, one day to mutable image/font/audio/PDF.js paths, and one hour to PDF documents. HTML retains revalidation. Shorter caching for unversioned paths prevents permanent stale portraits, PDFs or PDF workers. Staging also receives `X-Robots-Tag: noindex`; page metadata is `noindex, follow`, canonical/Open Graph/JSON-LD origins remain the production domain, and the staging sitemap is intentionally empty. Search engines may crawl the staging pages to see noindex.

The Cloudflare build runs the same PDF resources, image optimization and social-card preparation as the Vercel build. It then restores Next route types using `next typegen`: vinext and Next otherwise write incompatible generated `.next/types/routes.d.ts` files. `npm run typecheck` also regenerates these types before checking. Avoid building either toolchain while a preview of that same output is running; restart Wrangler after rebuilding `dist/`.

Static delivery avoids Worker execution for ordinary page and media requests. [Cloudflare documents static asset requests as free and unlimited](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/); Worker invocations and account limits still apply to runtime routes. This is not a measured production load/capacity guarantee. Keep the existing responsive images, font preload and lazy window/PDF chunks; no unrelated performance or interface changes were made.

## Local commands (no deployment)

```sh
npm ci
npm run typecheck
npm run lint
npm run build                 # Original Next/Vercel static export in out/
npm run build:cloudflare      # Staging-only Workers artifact in dist/
npm run preview:cloudflare    # Local workerd preview at http://localhost:3010
```

In another terminal:

```sh
npm run test:cloudflare
BASE_URL=http://localhost:3010 npm run test:navigation
BASE_URL=http://localhost:3010 npm run test:project-order
BASE_URL=http://localhost:3010 npm run test:window-controls
BASE_URL=http://localhost:3010 node scripts/about-carousel-check.mjs
BASE_URL=http://localhost:3010 npm run test:resume-zoom
BASE_URL=http://localhost:3010 npm run test:window-flicker
npx wrangler deploy --config dist/server/wrangler.json --dry-run --outdir .wrangler/dry-run
```

`build:vinext` is an alias for the same safe staging build; `start:vinext` also runs Wrangler locally. No deploy lifecycle hook or automatic deploy script is installed. `.dev.vars*`, local credentials/state and generated output are ignored by Git. Pass optional verification-token values as build environment variables if needed; do not commit tokens or a Cloudflare API token.

## Validation results

- TypeScript and ESLint passed. Original Next production build and vinext Workers production build passed.
- Wrangler dry run passed with 511 static assets and a Worker bundle of about 537 KiB gzip (1,790 KiB uncompressed). No assets exceed Cloudflare's 25 MiB individual asset limit.
- All ten public pages returned HTTP 200 and readable content with JavaScript disabled. Unique titles, descriptions, canonical URLs, Open Graph data, Google verification in the preserved layout, and JSON-LD are retained. Sitemap/robots respond correctly; unknown public/project paths return 404.
- Tested cache headers, matching downloaded PDF bytes, font and PDF.js resources. The local asset runtime ignored a Range header and returned a valid complete PDF (200), rather than 206; the PDF viewer, scrolling and downloads passed. Recheck range behavior on remote staging if partial downloads matter.
- Chrome regression suites passed desktop/mobile navigation at 1440/1024/430/375px; four windows across 1440/1280/1024/768/430/375px; dragging, maximizing, contact maximize exception, close/reopen, keyboard, rapid exits and mobile behavior; PDF zoom at 50/75/100/115/150/200%; slideshow autoplay/loop/swipe/pause/reduced motion; project-order stability and fresh reopen order. Animation ownership checks passed at 1440/768/375px without detected duplicate/exit layers.
- Homepage screenshots at 1440px and 375px matched the original Next static build exactly after normalizing clock values (mean absolute channel difference 0). Local comparison images are under ignored `docs/screenshots/cloudflare/`.
- No Cloudflare account, remote Workers URL, TLS certificate, edge performance, production Core Web Vitals, mobile hardware or cross-browser certification was tested. Tests ran locally in installed Chrome using workerd, not native Safari/Firefox or a public Workers deployment.
- Vinext remains beta and emits upstream nonfatal bundler/sourcemap warnings. npm audit currently reports 38 dependency advisories (27 moderate, 11 high, none critical), including the existing Lighthouse/browser test chain and transitive tooling dependencies. No forced package downgrades or unrelated major upgrades were applied. Review these advisories before production approval; passing the functional checks is not a security audit.

## Deploy temporary staging — only after approval

For a Cloudflare Workers Builds retry, select this repository's `feature/cloudflare-workers` branch, repository root as the root directory, Node 22.13+ (22.17 tested), build command `npm run build:cloudflare`, and deploy command `npx wrangler deploy --config dist/server/wrangler.json`. The Cloudflare staging project/Worker name must match `wasilah-portfolio-staging`. Retry using the latest branch commit rather than rebuilding an old main-branch commit. Do not connect a production hostname.

These commands are instructions, and were **not executed**:

```sh
npx wrangler login
npx wrangler whoami
npm run build:cloudflare
npx wrangler deploy --config dist/server/wrangler.json
```

Browser login requests Cloudflare account access. If you have multiple accounts, choose the intended account and set `CLOUDFLARE_ACCOUNT_ID` in your shell. For CI, use a scoped `CLOUDFLARE_API_TOKEN` in that CI's secret store instead of interactive login. Do not send credentials in chat. No authentication is needed for the local checks above.

Wrangler will print the actual staging address, normally `https://wasilah-portfolio-staging.<your-workers-subdomain>.workers.dev`. Do not guess the account subdomain. Do not attach a custom domain or alter DNS at this stage. Do not connect this feature branch to production Git deployment.

Verify staging with `BASE_URL=<printed-workers-url> npm run test:cloudflare` and the interaction commands above. Manually inspect desktop and phone layouts, project links, slideshow, email/LinkedIn/X links, résumé download/zoom, window dragging/close/maximize, noindex headers and devtools errors. Check Cloudflare's request/error/CPU metrics under real staging traffic. An empty staging sitemap is expected; a live production sitemap must contain all ten URLs.

## Connect wasilah.online later — separate approved cutover

1. First approve staging. Keep the existing Vercel project and its domain configuration active. Record/export the existing DNS records and Vercel targets for **both apex and www**, including current redirects and TTLs; preserve mail records and unrelated subdomains.
2. Prepare a separate production Worker name/config and production build. Change the staging-only settings in `scripts/build-cloudflare.mjs` to `SITE_NOINDEX: 'false'`, remove the generated `X-Robots-Tag: noindex` header, retain `SITE_URL: 'https://wasilah.online'`, and use the new production Worker config. Leave Vercel Analytics disabled for Cloudflare unless a supported collection service is configured. Rebuild; verify page robots are `index, follow` and the sitemap lists all ten canonical production routes before deployment. Do not reuse the staging noindex artifact on the live domain.
3. Deploy that production artifact to its temporary Workers URL and validate it before touching the domain.
4. Workers Custom Domains require an active Cloudflare DNS zone. If DNS is elsewhere, plan a separately approved nameserver move after copying **all** records and confirming the existing Vercel origin continues serving. Do not combine an unreviewed DNS-provider migration with the application cutover.
5. In Cloudflare Workers & Pages, select the production Worker → Settings → Domains & Routes → Add → Custom Domain, and attach the approved hostname(s). Cloudflare provisions its DNS record and certificate. An existing CNAME on the same hostname can conflict and must be deliberately replaced during the approved cutover. Decide whether apex or www redirects to the canonical apex; preserve HTTPS and all paths/query strings. See [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
6. Verify apex/www TLS, redirects, all ten routes, sitemap, robots, metadata, images, PDFs and no remaining noindex headers from multiple networks. Verify Google Search Console and submit `https://wasilah.online/sitemap.xml`. Monitor Cloudflare errors/CPU and real traffic before considering removal of any Vercel resources.

## Roll back

Before DNS cutover, rollback is simply continuing to use Vercel; staging is isolated. After cutover, detach the production Workers Custom Domain/route and restore the saved Vercel DNS targets for apex/www. Keep the Vercel deployment and its existing domain settings intact throughout so the origin is ready. DNS caches may delay recovery according to TTL. Do not use guessed Vercel IP addresses or delete the Cloudflare zone/mail records. Confirm the Vercel site, redirects and crawlability after restoration. To return local development to Vercel tooling, use the unchanged `npm run dev` and `npm run build` commands.

## Files changed

- `package.json`, `package-lock.json`: side-by-side toolchain dependencies and local build/preview/test commands; ESM required by Vite; reliable generated-type checking.
- `.gitignore`: build/runtime output and local Cloudflare secret files.
- `vite.config.ts`: vinext, static prerender/cache adapter, Wrangler plugin, stable CSS Module names and consistent metadata build values.
- `wrangler.jsonc`: isolated staging Worker and static asset binding, no production domains.
- `vercel.json`: disable automatic Vercel deployments for this migration branch only.
- `scripts/build-cloudflare.mjs`: existing media preparation, staging build, noindex/cache headers and Next type regeneration.
- `scripts/cloudflare-check.mjs`: route, raw HTML/SEO, staging safety, cache and PDF checks.
- `src/app/layout.tsx`: retain Vercel Analytics in ordinary builds and omit its unavailable endpoint on Cloudflare.
- `README.md`, `docs/cloudflare-migration.md`: workflow, audit, checks, limitations, deployment/cutover/rollback instructions.
