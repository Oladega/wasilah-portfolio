# Atilade Wasilat portfolio

Next.js App Router, React and TypeScript portfolio with a macOS-inspired desktop. Content is in `src/data/site.ts` and `src/data/projects.ts`; original media and downloadable PDFs are in `public/`.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For the production static export:

```sh
npm run build
PORT=3003 npm start
```

The preview serves `out/` with correct PDF worker module MIME types. Build/dev scripts copy matching PDF.js resources into generated, ignored `public/pdfjs/`. No deployment is performed by these commands.

## Window architecture

`src/components/windows/WindowManager.tsx` provides centralized actions, desktop-icon registration, live window geometry and versioned animation plans. `state.ts` separates visibility (`closed`, `opening`, `open`, `closing`) from normal/maximized size and maximizing/unmaximizing transitions. It retains normal drag position across size changes. There is no minimization or dock state, component, geometry registry or action.

Desktop supports multiple open applications, with bounded z-order derived from ordered application IDs. Pointer or keyboard focus raises an existing window without remounting it. Closing removes only its own application; the next visible window becomes active. Below 810px, only one application remains open, with modal focus containment and a functional close control. Mobile does not support window dragging or maximization.

`Home.tsx` renders one backdrop behind all windows. An exposed-background click invokes the same active-window close action as the red control. Other windows, PDF controls, form elements and portaled content are outside that backdrop target and do not trigger background closing. Each window's close callback targets its own ID.

### Registry and controls

`registry.tsx` maps typed IDs to existing content, icons, labels, sizing and capability metadata. To add an application:

1. Extend `WindowId` and `navigation` in `src/data/site.ts`.
2. Implement content using `WindowFrame` and its `onClose` callback.
3. Add its component/control label and sizing to the registry.
4. Configure `canMaximize`; false preserves a disabled green control, as Contact Me does.
5. Extend reducer and browser regression cases.

`WindowControls.tsx` shares 14px circles with the existing 8px gap: red Close, a disabled yellow dot, and green Maximize/Restore. Symbols appear on group hover/focus and touch. The yellow dot is a disabled button with no action or hover symbol. Mobile hides yellow and green. Normal desktop windows drag only from noninteractive titlebar regions; maximized, transitioning and mobile windows cannot drag.

### Animations

The existing **Motion** dependency powers `WindowTransitionLayer.ts`, `useWindowTransition.ts` and `windowTransitionUtils.ts`. Durations remain 400ms open, 340ms close and 270ms size changes. Opening and closing measure the actual desktop icon image; absent/offscreen icons use a short fade fallback.

A temporary inert visual copy owns the transition. It preserves PDF canvas pixels and scroll offsets without remounting real content. Glass stays on the outer animation layer to preserve backdrop sampling. Entrance hands off to the real node before removing the copy; exits keep the real node hidden until React unmounts. Interrupted copies remain frozen until their replacement is ready. Tokens reject stale completions. Copies live in their own application's stacking context so another foreground window can correctly cover them.

Only transform/opacity animate; geometry is measured at lifecycle boundaries. Resize or live reduced-motion changes complete the current operation safely. Reduced motion and missing animation APIs bypass spatial motion and snapshot preparation. Keep cancellation on `cancel()`, not deferred style-committing `stop()`.

### Résumé

`ResumePdfViewer` uses PDF.js directly with document-only zoom: default 115%, 50–200%, 5% steps, responsive reference width and a fixed toolbar. Size changes retain zoom; full close/reopen resets it. No browser zoom gestures are intercepted.

Nearby pages render with a 140ms debounce and bounded high-DPI canvases. Superseded render tasks are cancelled; close destroys the PDF session. Observer fallbacks keep the viewer usable without ResizeObserver/IntersectionObserver. The original PDF and download content are unchanged. See [viewer details](docs/resume-viewer.md).

## Verification

Start the production preview first, then run:

```sh
npm run typecheck
npm run lint
BASE_URL=http://localhost:3003 npm run test:windows
BASE_URL=http://localhost:3003 npm run test:window-animations
BASE_URL=http://localhost:3003 npm run test:resume-zoom
BASE_URL=http://localhost:3003 npm run test:smoke
REVIEW_BROWSERS=chrome,firefox,webkit BASE_URL=http://localhost:3003 npm run test:final-review
REVIEW_BROWSERS=chrome,firefox,webkit BASE_URL=http://localhost:3003 npm run test:window-flicker
BASE_URL=http://localhost:3003 npm run test:window-handoff-pixels
```

Chrome scripts use installed macOS Chrome; set `CHROME_PATH` elsewhere. Run `npx playwright install firefox webkit` for those engines. The consolidated regression covers six viewport sizes, multiwindow focus/close isolation, outside-click exits, controls, drag exclusions, rapid interruption, mobile, Contact and PDF zoom. The frame suite pauses real animations at boundaries; screenshots are generated under ignored `docs/screenshots/`.

`npm run profile:windows` creates Chrome DevTools-compatible traces and measured JSON; `npm run profile:memory` checks repeated résumé sessions. Run profiling without competing browser workloads. rAF cadence is a proxy, not guaranteed displayed FPS. See [current cleanup report](docs/window-cleanup.md). Earlier phase reports are historical and describe superseded features.

## Public content and SEO

The desktop remains at `/`. Readable, statically rendered `/about`, `/work`, `/resume` and `/contact` pages expose essential information without JavaScript. All five existing `/work/[slug]` routes now include their case studies in the initial HTML. Desktop icons are progressive-enhancement links: normal clicks open windows, while direct/modifier/no-JavaScript navigation reaches public content. A lazy root boundary preserves the window provider across desktop/project navigation and avoids loading it on reading pages.

Content sources are `site.ts` (bio, awards, capabilities), `projects.ts` and verified résumé/contact data in `profile.ts`. Changes to projects automatically update static project routes, sitemap URLs, metadata and branded social images. Update profile.ts alongside changes to the original résumé PDF; the PDF is never regenerated by the app.

Set `SITE_URL` for a future custom canonical origin. `VERCEL_ENV=preview` or `SITE_NOINDEX=true` emits noindex; public robots permission remains open so engines can read that directive. Production `/sitemap.xml` lists all canonical content URLs without invented modification dates. The owner-supplied Google verification token is installed by default. `GOOGLE_SITE_VERIFICATION` overrides it; `BING_SITE_VERIFICATION` optionally configures Bing. See `.env.example`.

Predev/prebuild generate responsive WebP sizes from original images and branded OG PNGs using Sharp and Next ImageResponse. Original assets remain unchanged. Generated optimized assets/social cards are ignored and recreated on build. The local production server compresses text and caches fingerprinted Next assets; Vercel manages its own edge delivery.

```sh
BASE_URL=http://localhost:3003 npm run test:seo
BASE_URL=http://localhost:3003 node scripts/seo-browser-check.mjs
BASE_URL=http://localhost:3003 npm run audit:lighthouse
```

See [SEO architecture, audit and Search Console/Bing instructions](docs/seo-architecture.md) and [measured test/performance results](docs/seo-results.md). Search engine verification, deployment, sitemap submission and indexing requests are owner follow-up steps; none are performed automatically.

### Independent HTTP accessibility audit

`npm run test:external` rebuilds the production export, starts an isolated preview, and checks all public routes using browser/Googlebot/Bingbot user agents plus JavaScript-disabled Chrome. It validates script-free page-specific content, real awards from shared data, metadata, redirect chains, headers, sitemap XML, robots directives, résumé PDF and unknown-route 404s. `npm run test:external:production` runs the same checks against the live URL without deploying; override `BASE_URL` for another target. Set `LOCAL_AUDIT_PORT` if port 3097 is occupied.

See [live production investigation and route table](docs/external-accessibility.md). Raw evidence is saved separately in `docs/external-http-local.json` and `docs/external-http-production.json`; a passing local run alone does not establish live accessibility. Access through every third-party retrieval service and actual search indexing are separate claims.

### Session project ordering

The first four entries in `projects.ts` use Fisher–Yates; the fifth stays last. After the Work window commits its fully closed state (after exit animation), a different next order is prepared silently. The manager observes that state transition rather than content unmounts, so project navigation, filtering, focus and rerenders do not reshuffle visible content. Consecutive identical arrangements are excluded without an unbounded retry loop. A versioned `sessionStorage` entry is shared by the Work window and public Work page, including reloads and navigation. A head bootstrap sets CSS order before paint; React hydrates deterministic server HTML and then adopts that same order, preserving readable static content and visual positions. Filtering retains the session's relative order. If session storage is unavailable, the first load uses the original order; subsequent prepared orders remain in memory until a full reload. A fresh session initializes an order; each completed Work close prepares a different next arrangement. The public Work route uses the current prepared order and stays stable while being read.

Run `BASE_URL=http://localhost:3003 npm run test:project-order` against a production preview for reopen cycles, post-animation preparation, pre-hydration geometry, navigation, mobile and storage-fallback coverage.
