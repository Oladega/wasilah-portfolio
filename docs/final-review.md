> Historical report for the preceding implementation. Current behavior, flicker fixes and latest measurements are documented in window-flicker-review.md. The running-app dock and close-only mobile rules supersede the previous conditional minimized dock.

# Final window experience review

Reviewed the local production static export on 19 October 2026. No deployment or push was performed. The published site was not a substitute for testing the unshipped implementation.

## Changes made during this review

- Suppressed redundant active-window focus dispatches. A React DevTools-hook probe of 20 pointer interactions fell from 21 root commits (including a clock tick) to zero commits in the final run.
- Made actual modal background regions inert, with focus containment; retained native desktop/dock keyboard navigation for nonmodal states. Restored launcher focus when WebKit leaves the body focused after a pointer click.
- Made About's independently scrolling content keyboard-focusable with a visible focus outline. Removed a prohibited accessible name from a generic photo wrapper and gave the résumé page counter appropriate status semantics.
- Darkened only the selected mobile Work filter from #0a84ff to #006dd9 to resolve its white-text contrast failure.
- Fixed WebKit dock popup actions losing their target between pointerdown and click: actions retain focus while suppressing the browser's conflicting default pointer-focus change.
- Added PDF observer fallbacks and regression/profiling tooling. Updated older tests to wait for asynchronous window lifecycle completion rather than assuming synchronous mounting/unmounting.

Main production modules modified: WindowManager, useDialogFocus, WindowFrame, Home/DesktopShell/DesktopIcons, ProjectPage, AboutWindow and its CSS, MinimizedDock, ResumePdfViewer and PdfPage. Existing **Motion** remains the sole animation dependency. PDF.js remains the document renderer. Axe was added as a development-only audit dependency.

## Interaction, responsiveness and accessibility

Chrome 155.0.8059.82, Firefox 157 and Playwright WebKit 27.2 each passed all four applications at 1440, 1280, 1024, 768, 430 and 375 pixels: 72 application/viewport cases total. Checks include close/reopen, maximize/restore, maximized minimize/restore, ordered multiple minimized entries, closing the last dock entry, popup placement during resize, Contact's disabled maximize control, PDF zoom during size changes, keyboard focus restoration and modal/nonmodal behavior.

The animation suite separately checks actual icon/window/dock geometry and retained transition targets, rapid interruption, closing during opening, restore during minimize, browser resize, project route exits, shell cleanup and reduced motion. Cross-engine real-motion tests include repeated dock clicks and runtime preference changes. Missing Element.animate, ResizeObserver and IntersectionObserver were exercised through feature removal. All tested engines reported support for transforms/animation APIs, inert, backdrop filters and dynamic viewport units.

Axe WCAG 2 A/AA and 2.1 AA scans of all four applications at 1440 and 375 pixels returned **zero violations in each tested engine**. Names, disabled states, native slider keys, Escape, focus restoration, modal containment and nonmodal freedom were also tested directly. Transparent surfaces and PDF canvas/text produce automated contrast checks requiring manual judgment; this is not an accessibility certification or a full screen-reader audit. Existing small traffic-light dimensions were preserved.

No runtime errors or hydration warnings were captured by the cross-engine suite. The original résumé checksum is unchanged: `0553a0b61815d4bfb6cc0f00105826a9d2bd8593ff53751eac7c0791f59ceb41`. Portfolio PDF checksum and 26 gallery images also pass source/content checks. Fonts, wallpaper, desktop icon assets and PDF content were preserved. Representative desktop/mobile screenshots and paused animation frames were inspected; these are review captures, not pixel comparisons against an obsolete Framer baseline.

## Browser and device limits

WebKit engine coverage is **not native Safari certification**. Native Safari 26.6.2 WebDriver could not create a session: timeout connecting to its remote inspection application. Edge is not installed. Physical phones/tablets, assistive technologies and older browsers remain manual follow-up coverage. CPU throttling is synthetic and does not reproduce every low-power device.

The existing single-visible-application policy is preserved; multiple minimized applications are supported. This is not a simultaneous multi-visible-window desktop. Blur is decorative and the dock has a sufficiently opaque base background if backdrop filtering is unavailable.

## Verification and reproduction

Passed TypeScript, ESLint and production build, reducer/window manager, controls, dock, animation, résumé zoom, overlay, navigation, smoke, content, About content, PDF media and welcome checks. Cross-engine results are in `final-review-{chrome,firefox,webkit}.json`. README describes local execution, architecture, registry changes, capabilities, dock, motion and zoom configuration.

Use Node 22.13+, `npm ci`, `npm run build`, then `PORT=3003 npm start`. In another terminal run the README verification commands with `BASE_URL=http://localhost:3003`. Install Playwright Firefox/WebKit before the cross-engine review. Chrome path is configurable with `CHROME_PATH`.

The production dependency audit reports zero advisories. Development tooling has outstanding advisories; no unrelated forced dependency upgrades were applied.

## Measured performance

Chrome DevTools Protocol Performance/Tracing, Apple M3 Pro (11 cores, 18 GiB), headless production export, two warmed cycles across four apps: **44 transitions per profile**. No competing browser test workloads ran during this final capture.

| Profile | Median / p95 rAF interval | rAF cadence proxy | Gaps >25ms | Long tasks overlapping animations | Total layout time |
| --- | --- | --- | --- | --- | --- |
| 1440×900 native | 16.7 / 16.7ms | 60.0/s | 0 / 884 samples | 0 | 36.40ms, 216 layouts |
| 430×932 native | 16.7 / 16.7ms | 59.9/s | 2 / 882 | 0 | 42.66ms, 233 layouts |
| 430×932 CPU 4× | 16.7 / 16.8ms | 58.4/s | 20 / 860 | 0 | 89.26ms, 234 layouts |

These are actual callback-cadence and main-thread measurements, **not guaranteed displayed FPS** or direct compositor dropped-frame counts. Maximum renderer tasks across the entire recorded workload were 27.1 / 28.8 / 52.1ms respectively; the throttled 52.1ms task did not overlap a window transition. Geometry is measured at boundaries, not in an animation-frame loop; layout totals span the entire workload.

Forced-GC before/after each workload showed zero retained DOM-node or listener increase. A separate seven-session résumé open/render/close probe held **154 DOM nodes and 344 listeners** throughout. Heap rose from 6.21MB to 6.84MB as caches warmed; this is not a proof that every possible memory leak is absent. An early baseline probe retained Playwright ElementHandles itself; those memory deltas are explicitly invalidated in its JSON. The corrected locator-based probe avoids that test artifact.

Final focus probe: seven commits before and after 20 interactions, **zero additional commits**. No speculative memoization or additional animation library was introduced.

Full metrics: `window-performance-results.json`, `window-memory-results.json`; baseline: `window-performance-baseline.json`. DevTools-loadable timeline traces are generated at `docs/screenshots/final-review/*.trace.json` (ignored, reproducible with the profiling script). Open them in Chrome DevTools Performance using Load profile.
