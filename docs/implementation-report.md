# Implementation report

Completed locally on 18 October 2026 in `wasilah-portfolio/`. The existing sibling project was left untouched.

## Delivered

- Six user-facing pages: homepage and `/work/halden`, `/work/pulse`, `/work/nacre`, `/work/kiln-co`, `/work/orbit`, plus a standard 404 page.
- Homepage About, Work, Résumé and Contact windows; desktop window stacking/dragging; mobile layouts; project filtering; project section scrolling, related work and next links; social links; two-page résumé preview/download; looping music with volume fade; visitor-local clock and timezone label.
- Reusable desktop shell, icons, hero, status, window frame, About/Work/Resume windows, project cards/pages, results note, responsive image helper, clock, sound controls and focus hook. Content, navigation, projects, image variants and contact details are centralized in `src/data/`; tokens/fonts in `src/styles/`.
- Original portraits, wallpaper, icons, project imagery, font files, résumé and audio stored locally, including Framer-served responsive image variants. The provenance manifest records 81 original asset URLs. No replacement stock or generated imagery is used.
- Production static export in `out/`, maintainable source, lockfile, README, audit and visual evidence.

## Verification

`npm run lint`, strict TypeScript checking and `npm run build` pass. The production static server was tested directly, including clean project URLs and client-side navigation.

Playwright interaction checks pass at 1440, 1280, 1024, 768, 430 and 375px: no horizontal overflow, working windows/close controls, filters, project navigation and scrolling, résumé download, music, reduced motion, and no JavaScript runtime errors. Additional tests verify stacked windows, Escape closing only the front window, keyboard focus wrapping, résumé page navigation and dragging. Clock behavior was verified in Africa/Lagos, UTC and America/New_York.

Visual testing includes 37 matched screenshot pairs with side-by-side and pixel-difference images, plus additional challenge/identity sections, mobile scroll states, hover, welcome animation and résumé-page evidence. Primary layouts switch at 1200px and 810px. Raw results are in `visual-comparison.json`; screenshots are under `screenshots/`.

The final unmasked homepage mean RGB channel difference ranges from 2.40 to 3.88 on a 0–255 scale. This is measurement evidence, **not a claim of pixel-perfect equivalence**. Live clocks, Framer’s injected editing UI and transient hover state are unmasked; some scrolled and PDF comparisons have larger residual differences.

Production dependency audit reports zero known vulnerabilities. The development ESLint dependency chain currently has five audit findings rooted in a braces advisory with no patched braces release available; no forced framework/toolchain downgrade was applied.

## Specific limitations and reference quirks

- Contact Me opens the résumé in the published reference; that behavior is preserved. Project pages retain Mira Alvarez branding and the reference’s existing template copy and imagery.
- The final reference next-project URL is malformed. Its unusable card is omitted rather than creating a fictitious project.
- Project Download PDF buttons expose no working source file and remain without an invented download. The real résumé download works.
- Framer’s edit pencil is excluded; the Made in Framer badge remains.
- Glass reflections/blur, small image/font rendering details, PDF rasterization and entrance animation timing have residual differences. The PDF preview uses local raster pages; the downloadable PDF is unchanged. Animations are reconstructed from observation and are not frame-identical to Framer.

## Maintenance

See `../README.md` for installation, local running, production preview, Vercel deployment and the editing map. Update `src/data/site.ts` for personal copy, navigation, imagery, résumé or contact details; update `src/data/projects.ts` to add or edit projects. Rebuild after changing content. No external hosting account was modified or publication performed.
