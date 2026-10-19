# SEO implementation verification

These changes are local and have not been pushed or deployed. Search indexing, ranking, Search Console ownership and platform sharing caches have not been confirmed.

Final local verification: 20 October 2026. TypeScript, ESLint, production export, raw-HTML/no-JavaScript SEO suite, mobile browser checks, navigation and résumé zoom all pass. Earlier full Chrome/Firefox/WebKit window regressions remain recorded below.

## Crawlability

All ten canonical routes return HTTP 200 and meaningful initial HTML. JavaScript-disabled browser tests read the content, navigate from desktop icons to public pages, navigate between public pages, and follow a project's Works link to the readable collection. Unknown pages/projects return 404.

`/about` exposes all existing award titles and years in ordinary rendered HTML, including Penultimate of the Year, Exco of the Year, Most Social Female Student, Finalist of the Year, Most Influential in Politics, Most Supportive NSASAite, Most Popular Female Student and Special Recognition Award. No issuer or award description was fabricated.

Every valid route has a unique title, description, canonical, meaningful heading, absolute sharing image and parseable JSON-LD with consistent identity references. Project routes and sitemap entries come from the same project collection. Sitemap validation checks the exact canonical URL set and absence of invented last-modified dates. Robots allows public crawling and advertises the canonical sitemap. Configuration tests cover preview noindex and custom-origin normalization.

Full route results are in `seo-test-results.json`. `seo-browser-results.json` records mobile overflow, script transfer, layout-shift and runtime/hydration checks, plus public back/forward navigation, project refresh and explicit desktop-window deep links.

## Architecture and performance

Plain reading routes use Server Components and omit the window registry/PDF engine. The small conditional desktop boundary preserves the provider across desktop/project navigation. Visible public links disable unnecessary desktop/project prefetching. Responsive image variants and branded social cards regenerate from the shared content on build; originals and the résumé PDF are unchanged. Fingerprinted Next assets cache immutably in the local preview, and text responses use gzip. Vercel's production delivery must be checked separately.

The original résumé SHA-256 is still `0553a0b61815d4bfb6cc0f00105826a9d2bd8593ff53751eac7c0791f59ceb41`.

## Lab audit interpretation

Lighthouse was run against the production static export using headless Chrome and its simulated mobile settings. These are individual local lab runs, not field measurements or an INP/Core Web Vitals certification. Initial measurements included an uncompressed preview and unwanted link prefetches; comparing them with the final compressed preview does not establish a like-for-like Vercel speedup.

All six audited routes reached **100 SEO and 100 accessibility**. The four static reading pages scored **93–96 performance**, with CLS between 0 and 0.00023; the representative case study scored 77 performance with CLS 0.0788. Existing interactive desktop loading/visual effects were preserved, and desktop/case-study routes remain heavier than reading pages. The intentional first-entry loader affects homepage LCP. No claim of perfect Core Web Vitals is made.


| Route | Performance | SEO | Accessibility | LCP (s) | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 86 | 100 | 100 | 3.75 | 0.00005 |
| `/about` | 96 | 100 | 100 | 2.84 | 0.00000 |
| `/work` | 93 | 100 | 100 | 3.20 | 0.00023 |
| `/resume` | 96 | 100 | 100 | 2.77 | 0.00000 |
| `/contact` | 96 | 100 | 100 | 2.76 | 0.00000 |
| `/work/pulse` | 77 | 100 | 100 | 5.11 | 0.07881 |

The reading pages transferred 141,766 encoded JavaScript bytes versus 213,152 on desktop/project routes in the local browser run (about 33% less). Sampled desktop interaction events were 16–72 ms; these event samples are not field INP. The first Work thumbnail now loads eagerly with high priority; remaining collection images stay lazy.

The case study initially exposed two accessibility problems: an article carrying an unsupported dialog role and a visible Works label absent from its accessible name. The dialog is now a generic container with a semantic article inside, and its back link has a matching accessible name plus a readable non-JavaScript destination. Native page navigation, descriptive gallery alt text and readable résumé text remain available without a client renderer.

Full scores/timing are in `lighthouse-results.json`; the initial pass is retained in `lighthouse-initial-results.json`. Reproducible full Lighthouse artifacts are generated under ignored `docs/lighthouse/`. Run the audit without competing browser workloads. Social cards were visually inspected; actual LinkedIn/X previews require an approved deployment and platform refresh.

## Functional regression coverage

The consolidated suite covers four applications across six viewport widths in Chrome, Firefox and WebKit, including multiple desktop windows, focus ordering, close isolation, disabled yellow control, Contact restriction, maximize/normal cycles, saved drag geometry, mobile exclusions, outside-close animation, rapid actions and viewport changes. Frame-level geometry tests retain opening/closing and maximize/unmaximize coverage, reduced motion, missing APIs and cleanup. PDF zoom, smoke navigation and welcome-once tests remain part of verification.

WebKit required waiting for the actual React unmount after animation completion; shell removal and DOM removal are deliberately separate lifecycle moments. Tests now assert that final DOM state instead of racing the commit. This does not change the animation behavior.

Native Safari, physical iOS/Android devices and screen readers were not available. WebKit coverage is not native Safari certification. JSON-LD was validated through parsing, expected Schema.org types and reference checks; no claim of external Rich Results Test approval or guaranteed rich-result eligibility is made.

## Owner handoff

1. Review and authorize deployment separately.
2. The owner-supplied Google HTML-tag token is installed in shared metadata (with an optional environment override). Add/select the matching URL-prefix property in Search Console.
3. Verify ownership, submit `/sitemap.xml`, inspect key URLs and request indexing where appropriate.
4. Import the verified property into Bing or use its real verification token, then submit the sitemap there.
5. Monitor indexing errors and search performance; keep LinkedIn's website field consistent with the canonical domain.

Detailed instructions and official Google/Bing references are in [SEO architecture](seo-architecture.md).
