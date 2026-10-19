# Résumé document zoom

## Audit and rendering choice

The previous Résumé window used two static PNG previews (`resume-1.png` and `resume-2.png`) with a fixed 560px page width. The original PDF was only the download target. The PNGs do not provide crisp arbitrary high zoom, so the viewing area now uses the maintained `pdfjs-dist` library directly. Existing PNGs remain the sidebar thumbnails; no PDF regeneration, conversion or content edits were performed.

Original PDF: `public/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf`
SHA-256: `0553a0b61815d4bfb6cc0f00105826a9d2bd8593ff53751eac7c0791f59ceb41`
Download filename remains `Wasilat-Atilade-Resume.pdf`.

## Interaction and layout

`ResumePdfViewer` owns local 50–200% zoom state, 5% steps and a default of 115%. The desktop reference page width at 100% is 720 CSS pixels; the reference width shrinks responsively so the default 115% fits narrow viewing areas. Percentages are relative to this responsive document reference, not browser zoom. At larger selected zoom levels, both axes scroll inside the viewer. The header, frame, desktop and wallpaper never scale.

The existing header/download control and thumbnail rail remain. A matching neutral glass footer contains page count, minus, native range slider, plus and percentage. It stays outside the scrolling document area. Mobile retains its own download link. Native slider arrow keys work; disabled endpoint buttons expose native disabled semantics. The shared focus trap now includes form controls so the slider remains reachable at both endpoints. No browser zoom keys or wheel gestures are intercepted.

Before zoom or responsive width changes, the viewer records the normalized page coordinate at its visible center. A layout effect restores that point after document geometry updates, subject to scroll limits. Minimizing keeps the viewer and zoom state mounted; normal/maximized resizing retains the selected percentage. Closing destroys the document session; reopening starts at 115%.

## Rendering and resources

PDF.js loads dynamically only when the viewer mounts. The matching worker, font/CMap/WASM/profile resources and license are copied from the installed package to generated `public/pdfjs/` assets before dev/build. This supports Next static export without a CDN or worker-version mismatch. The static preview server serves JavaScript modules and WASM with their appropriate MIME types.

Canvas pages render only near the scroll viewport. Zoom immediately scales the existing document preview uniformly, then debounces a high-quality PDF redraw by 140ms. Superseded render tasks and text layers are cancelled. Backing buffers are capped at 2× device pixel ratio and approximately 8 megapixels per page. Buffer/preview geometry swaps occur together to avoid flicker. Offscreen page surfaces release canvases. Closing/unmounting destroys the PDF loading task and worker. A selectable text layer accompanies the canvas, with extracted text available to assistive technology.

Loading, page errors and document-load/retry states remain inside the document region. Downloading the original file remains available even if rendering fails.

## Verification

`npm run test:resume-zoom` checks all requested 50/75/100/115/150/200% sizes across 1440/1024/768/430/320px layouts, internal overflow, two-page scrolling, reading-position preservation, bounded high-DPI buffers, unchanged frame/header/wallpaper geometry, arrow keys, endpoint accessibility, plus/minus, download filename, failure/retry, minimize/restore retention, maximize/restore and reset on full close. The original PDF hash is asserted. Window, dock, controls and navigation regression suites also pass.
