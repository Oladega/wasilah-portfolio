# Visual portfolio import — 18 October 2026

Source: `/Users/user/Downloads/Atilade Wasilah portfolio.pdf` (9 pages). The complete, unchanged PDF replaces `public/documents/portfolio.pdf`, used by every case-study download and the Work folder download.

| PDF page | Destination | Extracted content |
| --- | --- | --- |
| 1 | Existing identity/contact details | Cover contains no embedded raster image |
| 2 | About window | Portrait; two decorative panel background images excluded from the displayed content |
| 3 | Work folder overview | Capabilities graphic |
| 4 | Sunbo Collective (`/work/halden`) | Seven campaign photographs and one logo; restored supported campaign/social media role and scope |
| 5 | Final Year Week (`/work/pulse`) | Six celebration photographs |
| 6 | NSASA Presidency (`/work/orbit`) | Five photographs covering speaking, sports, community and celebrations |
| 7 | Sign-Out After Party (`/work/nacre`) | Original promotional flyer; C’est Fini name, advertised date and venue |
| 8 | Explore 7.0 (`/work/kiln-co`) | Six conference photographs; year-long coordination wording from this latest PDF |
| 9 | Work folder overview | Evidence of impact graphic |

The PDF contains 31 embedded images. Twenty-six project assets, one portrait and two overview graphics are displayed (29 content assets). Two decorative dark panel/background assets from the About page are not placed in project galleries. Original raster assets were extracted with pypdf and converted from JPEG 2000 to WebP at their full original dimensions for browser support. No AI-generated imagery was used. Exact page/image mapping and dimensions are recorded in `docs/pdf-image-manifest.json`.

Every gallery preserves the full image proportions, has descriptive alternative text and captions, and links to a full-size image in a new tab. Project thumbnails and hero images now use the imported assets; gallery images remain uncropped even where a thumbnail uses cover cropping. The sign-out flyer and Sunbo logo hero use contain sizing.

Existing detailed case-study copy remains grounded in the earlier text portfolio, supplemented by the latest visual portfolio. Sunbo has no fabricated performance numbers, challenge narrative or results section. Explore coordination duration follows the latest visual PDF (one year), replacing the older ten-month wording. The supplied flyer explicitly advertises 22 August 2026; the webpage includes that date without treating ticket prices or enquiries printed on the artwork as current purchase/contact actions.

Earlier recreation/reference documentation and screenshots are historical. Current checks include `test:pdf-media`, which verifies all 26 mapped assets, proportions, responsive layouts, all six portfolio download links and SHA-256 equality with the supplied source PDF.

## About text update

Capabilities and impact were subsequently moved from the Work folder into About Me as native selectable text. All 19 capability bullets are grouped under Marketing, Events, Community and Operations. All five impact figures retain their descriptions and context. The About sidebar links directly to What I do and My impact. The Work folder retains its project cards and PDF download but no longer displays either overview graphic. Source graphics remain as extracted assets for provenance.
