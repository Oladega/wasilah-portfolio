# Two-control window cleanup

## Scope and baseline

The supplied request removes minimization and the dock while retaining the existing Motion geometry engine, visual design, PDF renderer and desktop window controls. The pre-change production build passed. Existing unrelated working-tree changes were preserved. No deployment or push was performed.

The audit found minimized visibility states, previous-size/launch-source fields, minimized ordering, dock/desktop source registrations, two manager actions, two animation kinds, a dock component with popups/styles, outside-click minimization and obsolete tests. These were coupled to shared open/close/size-transition code, so those shared pieces were retained and simplified rather than replaced.

## Removed

- `MinimizedDock.tsx`, its item/popup handlers and `MinimizedDock.module.css`.
- Yellow control and its styles, without leaving a gap between red and green.
- Minimize and restore-from-minimized actions, lifecycle branches, saved minimized size/source fields and ordering.
- Dock icon registration/measurements and minimize/restore flight configuration.
- Unused original social-dock data and its three image assets.
- Dedicated dock test and obsolete manager/control suites, replaced by one consolidated regression for the current architecture. Shared animation, handoff, PDF and navigation tests remain updated and runnable.

No production dependency was added. Motion, PDF.js, React and Next remain required and unchanged.

## Current behavior

Visibility is `closed`, `opening`, `open` or `closing`. Normal/maximized mode and maximizing/unmaximizing are separate. Normal drag geometry persists across size changes. `maximizeWindow` and `unmaximizeWindow` are explicit, distinct from the removed minimized restoration concept.

Desktop applications remain mounted independently, with stable ID keys and bounded ordered z-indices. Pointer/keyboard focus raises an existing window. Each close callback targets its own ID. The checkout had actually closed the previous foreground app; the desktop policy was corrected to the request's explicit requirement that multiple windows remain open. Mobile opening/resize keeps one application and disables maximize and dragging.

One background button sits behind every application. Its click calls the same active-ID close action as the red control and Escape; closing waits for the existing exit animation. Other window content, controls, scrollbars, PDF controls and unrelated portal DOM are not inside that target. A click on another window focuses it without closing either. Closing an active window activates another remaining window; when none remains, focus returns to a desktop launcher.

Controls retain 14px circles, 8px spacing, colors, hover symbols and focus styling. Red and green are adjacent. Contact's green remains natively disabled and has no active symbol; mobile exposes only Close. Normal desktop dragging starts only from noninteractive titlebar space and remains disabled during transitions or maximization.

## Preserved animation and document behavior

Opening/closing still measure the actual desktop icon image; offscreen/absent icons retain their fade fallback. The existing inert-copy handoff preserves PDF canvas pixels and scroll offsets without remounting the document. Entrance reveals the real node before removing the copy; exits keep it hidden until unmount. Cancellation retains the old visual until a replacement is ready, with stale completion tokens rejected. Size changes retain the same engine/durations. Reduced motion and API fallbacks remain.

Transition copies now belong to their own application's stacking context rather than an unrelated body-wide layer, allowing foreground applications to cover background animation content correctly. There are no per-frame React updates or geometry polling loops.

Résume zoom remains document-only, 50–200%, default 115%, with reset on full close and retention across normal/maximized changes. Original PDF hash remains unchanged.

## Regression evidence

- Consolidated browser regression: all four apps at 1440/1280/1024/768/430/375px in Chrome, Firefox and WebKit: **72 app/viewport cases**.
- Desktop multiwindow lifetime, background-window close isolation, pointer/keyboard foreground switching and active-only outside closure.
- Two-circle geometry/spacing, disabled Contact maximize, repeated maximize/normal cycles, saved dragged position, maximized drag exclusion and mobile drag exclusion.
- Real animated outside closes, rapid open/close interruption, viewport resize during animation and desktop-to-mobile compaction.
- PDF keyboard zoom and Contact destinations; dedicated résumé suite covers all six zoom levels, two-page scrolling, focal point, error/retry, resource bounds and original checksum.
- Cross-engine paused frames at 0/1/50/99% for opening, closing and supported size transitions: 36 app/viewport cases with zero visual ownership or exit leaks.
- Representative About handoff pixel comparison: mean absolute channel difference **0.051/255**, with **0%** of pixels changing by more than 16 levels between 99.999% and the final real window.
- Existing animation, smoke, navigation and outside-click suites pass. TypeScript, ESLint and production build pass.

Source scans find no remaining minimization/dock lifecycle, component, action or geometry references. Tests retain negative assertions that removed controls/components do not exist. Historical reports/results describe earlier implementations and are not active code.

## Local verification and limits

Use Node 22.13+, `npm ci`, `npm run build`, then `PORT=3003 npm start`. Run the README test commands with `BASE_URL=http://localhost:3003`; set `REVIEW_BROWSERS=chrome,firefox,webkit` for the consolidated and frame suites. Chrome's path can be overridden with `CHROME_PATH`.

Native Safari/Mobile Safari and physical Android Chrome were not available; Playwright WebKit coverage is not native Safari certification. Browser tests recorded no runtime errors. Existing visual assets/content were preserved apart from unused dock-only assets. No new functional issue remains from the tested cleanup; physical-device and assistive-technology coverage is still limited.

## Performance after cleanup

An isolated production Chrome DevTools Protocol trace on Apple M3 Pro recorded 28 desktop transitions and 16 mobile transitions. Desktop/mobile callback cadence was 60.0/s (16.7ms median and p95), with zero sampled callback gaps over 25ms and no long tasks overlapping transitions. At 4× synthetic CPU throttling, mobile cadence was 58.4/s with nine gaps over 25ms and no overlapping long tasks. Callback cadence is not guaranteed displayed FPS. The 50.2ms maximum throttled renderer task occurred outside window transitions.

Removing the dock eliminates its DOM, popup/focus listeners, icon registrations and two transition paths. Desktop's normal regression workload now requires 28 rather than 44 transitions; total script time was 345.05ms and layout count 138, but different workload size means these totals are not a like-for-like speedup claim. Repeated résumé sessions retained 154 nodes and 345 listeners with no upward count trend; heap warmed from 6.22MB to 6.84MB. Final profile and memory JSON files contain full measurements.
