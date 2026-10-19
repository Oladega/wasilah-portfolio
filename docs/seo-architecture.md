# Crawlable portfolio architecture

## Audit findings

Before this change the App Router/static-export app exposed only `/` and five project URLs. Homepage HTML contained the introduction but About, résumé and Contact lived in initially closed client windows. Project HTML likewise returned the desktop before its effect opened Work: a raw request to `/work/pulse` did not contain the case-study committee text outside scripts. There were no `/about`, `/work`, `/resume`, `/contact`, robots or sitemap routes. Existing metadata had a single configurable canonical origin but no structured data, preview noindex or verification configuration. Desktop launchers were buttons, so their public destinations were not discoverable as links.

An ordinary HTTPS request to the deployed homepage returned 200, as did requests using Googlebot and Bingbot user-agent strings, with no X-Robots-Tag block. That is a basic HTTP check, not proof that a real engine indexed the page. One external browsing service could not retrieve the URL despite those successful HTTP requests. These local changes have not been deployed or pushed.

## Public routes

- `/`: existing interactive macOS desktop, with real section links and a semantic professional identity.
- `/about`: static readable biography, education, employment, leadership, capabilities, impact, tools and every existing award.
- `/work`: static project collection, summaries, roles, categories and dates when supplied.
- `/resume`: readable verified résumé history, skills and the unchanged downloadable PDF.
- `/contact`: the existing public LinkedIn, email and X links.
- `/work/halden`, `/work/pulse`, `/work/orbit`, `/work/nacre`, `/work/kiln-co`: existing stable case-study URLs and original interactive presentation, now present in server-rendered HTML.

Public section pages use the same fonts, wallpaper, glass colors and window shape, with native navigation and ordinary document scrolling. They do not mount the animation/PDF manager. Project pages seed their existing Work instance as open during static rendering, so text is readable without hydration rather than appearing only after an effect. The homepage still opens animated windows on ordinary icon clicks. Native section anchors provide JavaScript-disabled and modifier-click navigation; public pages offer an Open on desktop deep link. Project URLs and native public navigation support browser back/forward. Desktop-only window state intentionally remains local rather than changing the current route on every focus/drag action.

A lightweight pathname boundary lazily loads the manager only on desktop/project routes and keeps the same provider mounted across those navigations. Plain reading routes retain server-rendered content without loading the window registry or PDF tree. No dock or minimization action was reintroduced. The existing disabled yellow presentation dot remains.

## Content sources

`site.ts` supplies biography, capabilities, tools, impact, grouped awards and assets. `projects.ts` supplies cards, metadata, generated project routes, structured case studies, social cards and sitemap entries. `profile.ts` centralizes professional identity and contact links shared with the interactive Contact window; it also records verified education/employment/leadership extracted from the supplied original résumé. Both About and Résumé public routes render the same ProfileHistory component/data.

The original PDF remains unchanged. Résumé transcriptions are maintained in profile.ts when the source résumé changes; the source PDF itself remains the interactive document and download. Dates marked Present reflect the supplied document, not an independent employment-status check. Award issuer/description details were not supplied and are omitted rather than invented. Existing award titles/year groups are rendered directly from site.ts, without a separately maintained SEO copy.

## Metadata and structured data

`lib/seo.ts` centralizes the origin: SITE_URL, then existing NEXT_PUBLIC_SITE_URL, then https://wasilah-portfolio.vercel.app. Every valid page has its own title, description, absolute canonical, OG/Twitter large-card image and consistent professional identity. VERCEL_ENV=preview or SITE_NOINDEX=true produces noindex metadata; preview pages remain crawlable so engines can read noindex, while the preview sitemap is empty. Production permits ordinary crawlers. A custom domain requires changing the canonical environment setting and rebuilding.

JSON-LD uses a shared Person/WebSite identity, ProfilePage on About, CollectionPage on Work, ContactPage and CreativeWork on case studies, with BreadcrumbList on non-root pages. Project year is temporal coverage, not an invented publication/update date. LinkedIn/X references use existing supplied profile URLs. Scripts safely escape `<`; automated tests parse JSON and check expected types, identity and reference consistency. This is not a claim of Google rich-result eligibility for every type or external Rich Results Test approval.

`/sitemap.xml` derives all ten canonical routes from projects, without fabricated modification dates or change frequencies. `/robots.txt` permits public production content/assets and references the sitemap. Static-export metadata routes use force-static. The preview server serves XML with an XML MIME type.

`generate-og-images.mjs` uses Next's existing ImageResponse and local fonts/assets to build ten branded 1200×630 PNG previews. New project data automatically generates its image, route and sitemap entry at build. Generated images are ignored and recreated by predev/prebuild; original photos are untouched. Platform-specific caches and actual LinkedIn sharing previews must be checked after an approved deployment.

## Search Console / Bing handoff

For the current Vercel subdomain, add a **URL-prefix property** for https://wasilah-portfolio.vercel.app/ in Google Search Console. Select the HTML-tag verification method. The owner-supplied token is already installed; no environment variable is required for this token. Rebuild/deploy when authorized, then click Verify. Use GOOGLE_SITE_VERIFICATION only if replacing the token. For a future custom domain you control, a Domain property with DNS verification is another option. The real Google token supplied by the owner is now the checked-in default; GOOGLE_SITE_VERIFICATION remains an optional override. Bing is still unconfigured. No token was fabricated. [Google ownership instructions](https://support.google.com/webmasters/answer/9008080).

After verification, submit `sitemap.xml` in Sitemaps. Use URL Inspection on `/about`, `/work`, `/resume` and project URLs; run its live test and request indexing where appropriate. Review Page indexing errors and Search results queries/impressions over time. [Google URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en), [Search Console tasks](https://support.google.com/webmasters/answer/10351509).

In Bing Webmaster Tools, import the verified Google property or add/verify the site using its real token (BING_SITE_VERIFICATION produces msvalidate.01 metadata). Submit the full sitemap URL and monitor crawl/indexing reports. [Bing verification](https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b), [Bing sitemaps](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed).

Robots permission and a sitemap support discovery but do not guarantee indexing, rankings or access through every AI service. No search-engine account actions, indexing requests or production deployment were performed.
