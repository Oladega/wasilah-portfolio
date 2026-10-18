# Atilade Wasilat portfolio recreation

A modular Next.js App Router / React / strict TypeScript recreation of [the published Framer portfolio](https://informal-room-612303.framer.app/). Original imagery, local fonts, desktop windows, responsive layouts, project pages and résumé are included. This project is independent of the other `assetbase` project in the parent directory.

## Project content update

The five case studies use Atilade Wasilat’s supplied portfolios: Sunbo Collective, Final Year Week ’26, NSASA Presidency, Sign-Out After Party and Explore 7.0. The latest visual PDF supplies 26 project images, displayed in galleries at their original proportions. Cards use the extracted photos and artwork. The About Me window includes capabilities and impact as readable, selectable text. All portfolio download links serve the latest supplied PDF unchanged. See `docs/pdf-media-update.md` and `docs/pdf-image-manifest.json` for source mapping.

## Run

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production preview:

```sh
npm run build
npm start
```

`build` creates a portable static site in `out/`. `start` serves that output with the included Node server; it does not require an additional serving dependency. Set `PORT=3001` to use another port. Stop the development server before starting production on the same port.

## Files to edit

| Change                                                         | File                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| Name, greeting, introduction, availability, timezone           | `src/data/site.ts`                                          |
| Wallpaper, portrait, candid image, original icon artwork       | `src/data/site.ts`, files in `public/images/`               |
| About paragraphs, services and tools                           | `src/data/site.ts`                                          |
| Navigation labels and artwork                                  | `navigation` in `src/data/site.ts`                          |
| Social/contact destinations                                    | `contacts` in `src/components/contact/ContactWindow.tsx`                         |
| Project names, descriptions, categories, images, metrics       | `src/data/projects.ts`                                      |
| Colors, fonts, blur, shared sizes and timing                   | `src/styles/tokens.css`                                     |
| Local font definitions                                         | `src/styles/typography.css`                                 |
| Homepage spacing, responsive rules, hover and entrance effects | `src/components/home/Home.module.css`                       |
| Shared work/résumé windows and cards                           | `src/components/shared/Windows.module.css`                  |
| About layout                                                   | `src/components/about/AboutWindow.module.css`               |
| Project layout and responsive rules                            | `src/components/work/ProjectPage.module.css`                |
| Welcome animation                                              | `src/components/shared/WelcomeAnimation.module.css`         |
| Music source                                                   | `siteConfig.audio`, fade and playback in `src/lib/audio.ts` |

Add a project by adding one `Project` object to `src/data/projects.ts`. The work grid, filtering, dynamic route, next link and related work derive from that array. Copy its assets into `public/images/`, use paths beginning `/images/`, and rebuild. No new page component is needed.

To replace the résumé, update `siteConfig.resume.path`, `filename`, and both preview image paths. The previews are raster pages of the original PDF, rendered locally with Poppler. Generate replacements with:

```sh
pdftoppm -scale-to 1680 -png public/documents/your-resume.pdf public/documents/resume
```

If the replacement has a different page count, update the pages array and page-counter logic in `ResumeWindow.tsx`. The downloadable file remains the original PDF.

## Architecture

`src/app` contains the homepage and five statically generated `/work/[slug]` routes. `src/components/layout` contains the server-rendered desktop shell, menu and badge. Small client components manage clocks, music, a single active draggable window, filtering, focus and section scrolling. `home`, `about`, `contact`, `work` and `shared` hold components and their CSS Modules. Data and types are separate. Tailwind handles simple shared layout utilities; complex responsive compositions use CSS Modules and centralized CSS tokens.

The design changes at 1200px and 810px, matching Framer’s published variants. Work windows switch to the compact layout below 810px; About switches below 1200px. The wallpaper retains centered cover cropping. The clock uses the visitor’s browser timezone (Lagos in the audit browser) and updates automatically without changing its server-rendered placeholder during hydration. The solo piano soundtrack starts muted, fades over 800ms, and persists across client-side project navigation.

## Navigation and desktop behavior

Home and project pages share the same desktop, four home actions and contact dock. The bottom dock has been removed; the Contact Me folder opens a dedicated contact dialog with LinkedIn, email, WhatsApp and Twitter links. A project opens in a larger glass window; its Back button opens `/#work`, restoring the Work folder. Outside clicks close the current overlay and are consumed. The welcome animation runs once per browser session, with no replay when returning from a project.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm run test:smoke
npm run test:content
npm run test:overlays
npm run test:navigation
npm run test:pdf-media
npm run test:about-content
npm run test:design-update
npm run test:welcome
```

The Playwright scripts use installed Google Chrome on macOS by default. Set `CHROME_PATH` to a Chromium executable on another system, and `BASE_URL` to test a different preview server. No browser download is necessary. Start the site before running browser tests. Smoke tests cover all six widths, overflow, window navigation/closing, filters, project routes and section scrolling, résumé download, music and reduced motion.

Reference audit: `docs/reference-audit.md`. Original asset provenance: `docs/asset-manifest.json`. Visual evidence: `docs/screenshots/reference`, `implementation`, and `comparisons` (reference on the left, implementation on the right). Each comparison also has a pixel-difference image. Raw, unmasked metrics are in `docs/visual-comparison.json`; live clocks, injected Framer editing UI, hover state and PDF rasterization contribute to differences, so these numbers are not a claim of pixel-perfect equality. `docs/implementation-report.md` records the final validation and limits.

Additional scrolled section and window-detail evidence can be regenerated with `scripts/section-screenshots.mjs` and `scripts/window-detail-screenshots.mjs`.

To refresh the reference screenshots, run `npm run audit:reference`. The additional `refresh-home-reference.mjs` and `refresh-resume-reference.mjs` scripts wait for the published loader/PDF renderer to settle before capturing the stable state.

## Deployment

Import this folder into a Git repository and connect it to Vercel. Select the Next.js framework preset, use `npm install` and `npm run build`, and let Vercel detect the static export in `out/`. No environment variables or backend services are required. The exported folder can also be deployed to any static host that supports clean `.html` URLs. The site has not been published to an external hosting account by this task.

## Reference quirks and known differences

- Contact Me opens the résumé viewer in the original, and retains that behavior here. Social contact links on project pages preserve the original destinations, including their mismatched icon artwork.
- The reference’s project pages still show Mira Alvarez branding, design-project imagery and template copy. These are intentionally preserved.
- The final project has a malformed “Next” URL in the reference. Its unusable next card is omitted here. No invented sixth project is added.
- Project “Download PDF” controls have no discoverable working file in the reference. They remain visually present without a fabricated download. The actual résumé download works.
- Framer’s injected edit pencil is excluded. The visible Made in Framer badge is recreated as a link.
- Welcome/window animation timing is reconstructed from observation; it is not frame-identical to Framer’s runtime. Native scrollbars, browser font rasterization and PDF rendering may differ slightly.

Assets retain their original ownership and are included to reproduce the user-supplied reference; their source URLs are recorded rather than implying new licensing.

About now uses one expanded window with one uncropped photo inside. Current wallpaper, contrast, Contact and audio source details are documented in `docs/current-design-update.md`.
