# Desktop, About, Contact and audio update — 18 October 2026

- Generated a cinematic F1-inspired blue-hour racetrack wallpaper with a red open-wheel car. Local responsive WebP assets are used on Home and all project screens, keeping the background consistent.
- About now uses one expanded glass window, matching the larger project view. Both photos are inside its scrollable content. The photo row occupies 76% of the content width, with each image approximately 35% and full-image contain sizing; there are no floating photo windows. All existing About copy, capabilities, impact and tools remain.
- Darker glass, brighter secondary text and larger body copy improve readability across About and project pages. Work card titles and categories are also larger.
- Removed the bottom social dock.
- Contact Me now opens a dedicated glass-window layout with LinkedIn, email, WhatsApp and Twitter links. Résumé remains its own folder. Contact links use the existing supplied profile, email and phone details; no message is sent automatically.
- Replaced the original soundtrack with solo piano: Erik Satie, Gymnopédie No. 1, performed by Robin Alciatore, courtesy of Musopen. The public-domain recording is downloaded from Wikimedia Commons and served locally as `public/audio/piano-gymnopedie.mp3`. It starts only after the music toggle is clicked and retains the volume fade.

Audio source and recording credit: https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg
The Wikimedia file page identifies Robin Alciatore as performer and credits Musopen, with a public-domain dedication by the author. A concise credit is included in the music toggle tooltip.

Wallpaper generated with the image-generation tool. Original generated file remains in the Codex generated-images directory; production copies are stored within this project.

Earlier screenshot and dock documentation reflects previous revisions. Current navigation has no bottom dock, and Contact is a distinct dialog.

## Floral and heading update

The F1 background was replaced at the user's request with a generated soft floral wallpaper: blush peonies, ivory roses, lilac blossoms and dusty rose silk against a muted mauve center. Responsive WebP copies are in `public/images/floral-wallpaper-*.webp`. Mobile crops favor the right floral arrangement; desktop uses a centered crop. Glass colors now use complementary plum tones.

Headings now use self-hosted DM Serif Display, regular and italic. Body text remains Geist. Numeric statistics retain their existing Instrument Serif formatting. Homepage and project heading sizes/line heights were adjusted for the wider display font. Source font files and the SIL Open Font License are in `public/fonts/dm-serif-display-*`, downloaded from the Google Fonts repository: https://github.com/google/fonts/tree/main/ofl/dmserifdisplay

## Centered home layout and final photo/thumbnail choices

Desktop actions now form a centered horizontal row beneath the hero and its button. The hero starts 38px higher, and its text column is 20% narrower than the previous desktop/tablet width. Mobile retains its responsive stacked layout and horizontal actions.

The clock and impact metrics now also use DM Serif Display through the shared numeric font alias. Body/interface text remains the readable companion sans serif. About keeps only its first costume-event photo, centered at 35% of the content width. Sunbo's thumbnail now uses its logo (`sunbo/01.webp`), and NSASA's thumbnail uses its first gallery photo (`nsasa/01.webp`). Both project galleries are unchanged.

## Project mobile controls and capability list update

What I do is back to plain bullet lists with bold category headings, in two columns on desktop and one on mobile. The tools retain their pill styling. The About photo is 80vw on mobile, aligned with the left text edge. Project traffic-light circles are hidden on mobile, while the back link displays Works on both desktop and mobile. The TL;DR portfolio download link has been removed from every project; the full portfolio download remains available in the Work folder.

## Opaque first-visit loading screen

The first-visit intro uses a solid plum background and remains fully opaque for 2.2 seconds, followed by a 520ms dissolve (2.72 seconds total). The name appears with a subtle entrance animation and a continuous ring spinner. A pre-paint session check prevents the home screen flashing before the intro and skips repeat intros on navigation/reload. The heading font is preloaded. The overlay intercepts pointer input until dismissal, respects reduced motion and remains skipped for direct project entry. Animation completion drives removal, with a timer fallback for interrupted animations. Verified with `npm run test:welcome`.
