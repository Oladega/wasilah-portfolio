# Window flicker investigation

## Confirmed before changes

The checked-out implementation retains real content through lifecycle exits (`Home`, stable application-ID keys), hides minimized hosts with display:none only after reducer settlement, and unregisters closed content afterwards. `useWindowTransition` uses layout effects; the manager waits one animation frame for dock refs. No AnimatePresence participates; Motion drag owns only the real window's drag transform, while the transition engine animates a separate shell and real opacity. Window root CSS has no competing opacity/transform transition; the project `enter` keyframes are unused. Content hover transitions are unrelated.

`WindowTransitionLayer` used a **blank** glass rectangle, with a different border/background treatment from the complete real window, and crossfaded that shell and full-size content simultaneously. This exposes two composited surfaces rather than a single visual owner. Real content can appear at destination size while the shell is still arriving.

More critically, completion called cancel() on all animations, removed the shell and reset real opacity to its default before dispatching the reducer's settle action. The MutationObserver probe (`scripts/window-handoff-probe.mjs`, baseline `window-handoff-before.json`) observed the real node still connected with computed opacity **1 after both minimize and close shells were removed**. That is a deterministic exit visibility leak before React commits the hidden/closed host. Earlier broad lifecycle tests did not assert this boundary.

No evidence implicated unstable React keys, image/font loading, duplicate AnimatePresence, or CSS transitions on the window root. Blur and shadows are therefore preserved. Source/target geometry remains live, measured at lifecycle boundaries rather than per frame.

## Correction

A short-lived inert visual copy now owns the flight. It preserves window layout, cached images, live PDF canvas pixels, current form values and scroll offsets; the real React content/session remains mounted. The original glass background, blur and shadow are on the outer transition owner. Keeping blur inside an opacity-animation ancestor changed its backdrop sample and caused an additional appearance mismatch; it was moved, not removed.

Real opacity is set before the next paint. Opening/restoration hands ownership back synchronously before removing the copy. Closing/minimization never resets real opacity to 1: it remains 0 until React hides/unmounts the host. Cancellation freezes and retains the previous visual until the replacement is prepared, avoiding a blank frame between retargets. Versioned tokens still reject stale callbacks. Only the transition copy animates transform/opacity; there is no simultaneous real-window opacity animation. Root drag transforms remain separately owned by Motion.

Reduced motion and missing animation APIs bypass snapshot creation and manager geometry reads. Closing targets the same icon image used by opening, rather than its larger image-plus-label button. Keys, window dimensions, typography, content and original PDF are unchanged.

## Explicitly approved behavior updates

The user confirmed that this prompt's desktop/mobile rules should be applied to the checkout. The desktop dock now lists every running application, in stable registry order. Open/minimized/restoring/closing entries keep the same DOM key, and the last entry is removed only after closing completes. Restoring focuses the actual window even though its dock button now remains mounted. Outside clicks minimize on desktop. Below 810px, close is the only window-management control, the dock is hidden, and minimize/maximize actions are guarded centrally. Outside clicks close on mobile. Existing one-active-window behavior remains.

Production components changed: WindowTransitionLayer, WindowManager, new windowVisualSnapshot and desktopMode utilities, MinimizedDock, Home, and mobile control/dock CSS. Motion remains the existing animation library; no new production dependency was added.

## Regression coverage

`window-handoff-probe.mjs` records the real node at shell removal: the before result exposes opacity 1 on close/minimize; after is 0 on both exits and 1 on entrances. `window-flicker-check.mjs` pauses actual compositor animations at 0/1/50/99%, checks single visual ownership, accessibility-hidden copies, exit boundaries and cleanup for all four apps at desktop/tablet/mobile sizes in Chrome, Firefox and WebKit. Desktop covers every transition; mobile covers open/close and confirms absent desktop controls/dock.

`window-handoff-pixels.mjs` compares a warmed About crop at 99.999% against its final real window: mean absolute channel difference **0.263/255**, with **0.289%** of pixels differing by more than 16 levels. Small residual differences include glyph rasterization. This is a representative handoff comparison, not a proof that every browser/content frame is pixel-identical.

Existing geometry/rapid-interruption, dock, window-state, controls, PDF zoom, overlay and smoke regressions were updated for the approved behavior. The broad cross-engine review exercises 72 app/viewport cases; no runtime/hydration errors were captured. Its page-wide accessibility audit also exposes a pre-existing selected desktop-label contrast issue (white on #6084c8, 3.72:1), now visible to the audit because desktop is nonmodal. This unrelated desktop-label styling was deliberately preserved and remains a limitation.

Run the README test commands against a local production preview. Screenshot and DevTools trace outputs are ignored and reproducible. No deployment or push was performed.

## Final performance measurements

Chrome DevTools Protocol timeline/Performance capture on Apple M3 Pro (18 GiB), production static export, headless Chrome 155.0.8059.82, with no competing browser test workloads:

| Workload | Transitions | Median / p95 rAF interval | Callback cadence proxy | Gaps >25ms | Long tasks overlapping flights |
| --- | --- | --- | --- | --- | --- |
| 1440px desktop | 44 | 16.7 / 16.7ms | 60.0/s | 0 / 884 samples | 0 |
| 430px mobile | 16 | 16.7 / 16.8ms | 60.0/s | 0 / 336 | 0 |
| 430px, CPU 4× | 16 | 16.7 / 16.8ms | 58.4/s | 8 / 329 | 0 |

Callback cadence is **not guaranteed displayed FPS**, and gaps are not a direct compositor dropped-frame count. Mobile now performs only open/close, so its workload is not directly comparable to the previous 44-transition mobile profile. Desktop's comparable 44-transition run reduced layout count from 216 to 199 and script time from 501.7ms to 480.4ms; total layout time increased from 36.4ms to 57.13ms because the visual copy must be prepared. This is a single-run comparison, not a statistically proven speedup. Work remains at lifecycle boundaries, not in a per-frame React/measurement loop. Maximum recorded renderer task was 27.3ms desktop / 24.3ms mobile / 40.9ms throttled.

Forced-GC workload deltas: zero additional nodes or listeners. Seven repeated résumé sessions retained 154 nodes and 345 listeners throughout; heap warmed from 6.25MB to 6.88MB, so no claim of perfectly flat heap is made. Temporary DOM copies are removed and real PDF sessions are destroyed on close.

Full final values: `window-performance-results.json`, `window-memory-results.json`; previous profile retained in `window-performance-before-flicker.json`. DevTools-loadable traces are generated under `docs/screenshots/final-review/`. Intermediate PNGs are under `docs/screenshots/window-handoffs/`.

## Browser/device limitations

Chrome, Firefox 157 and Playwright WebKit 27.2 were exercised, including responsive/mobile viewport and touch checks. WebKit coverage is not native Safari or Mobile Safari certification. Native Safari WebDriver was unavailable (session/RWI connection timeout); physical iOS Safari and Android Chrome were not available. Reduced motion, runtime preference changes, resize, missing animation APIs, PDF zoom and rapid interruption have automated coverage. TypeScript, ESLint and the production build pass. No live deployment was performed.

The final frame suite also asserts that the running dock entry remains mounted during every desktop flight, including closing. All nine engine/viewport combinations (36 app cases) passed with zero ownership or exit leaks. The handoff probe was repeated against the development server with Strict Mode left enabled and returned the same correct entrance/exit opacity results (`window-handoff-development.json`).
