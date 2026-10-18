# Reference audit

Reference: https://informal-room-612303.framer.app/ — inspected 18 October 2026.

## Structure

The homepage is a full-screen simulated desktop. About opens a notes window plus two portrait windows on desktop, and one scrollable glass panel below 1200px. Work opens a Finder-style panel with five project cards and filters. Résumé opens a two-page PDF viewer. **Contact Me also opens the résumé viewer in the published reference.** Preserve this behavior.

Project routes: `/work/halden`, `/work/pulse`, `/work/nacre`, `/work/kiln-co`, `/work/orbit`. Each uses an internally scrolling window with section navigation, a results sticky note, similar-work links, next-project card and social dock. Sidebar icons return to `/`. The last next-project link is an unresolved CMS placeholder, not a sixth project.

Content is partially customized: homepage branding is Atilade Wasilat; project branding and metadata still say Mira Alvarez. Project names are personalized but descriptions and imagery remain design portfolio examples. Preserve these visible mismatches.

## Measurements

- > =1200px: 36px menu bar; icons at (18,58), width 104px, artwork 68px, vertical gap 42px. Intro y=166, horizontal padding 200px, gap 32px. Instrument Serif 60px/.98, letter spacing -.015em. Status top 50/right 16, width 248px.
- 810–1199px: intro vertically centered, padding 150px, heading 52px/.98. Status horizontal width 339px, left 455px/top 50px.
- <810px: flex column, padding 72px 16px 32px, gap 50px, minimum 100vh. Status max-width 350px, height 106px. Intro gap 22px, heading 35px/1.05, letter spacing -.01em. Icons form a 340px row; Contact precedes Résumé. At 375px the extra text line pushes icons down 36.75px.
- Wallpaper: original 2560×1440 moonlit salt-flat PNG, center/cover.
- Status glass rgba(142,156,184,.55), backdrop blur 16px, pale border, radius 22px. Windows use blue-grey glass and internal scrolling.
- Fonts: locally downloaded Instrument Serif normal/italic, Geist, Geist Mono, Caveat.
- Large bottom name exists in initial server markup but disappears after hydration in active published variants. Stable screenshots show the greeting as the main heading; do not introduce a bottom name.

## Behavior

Icons scale on hover; selected labels turn light blue. Windows use short opacity/scale entrances and traffic-light controls. About navigation scrolls the notes pane. Desktop windows can be dragged. Work filters select All, Social Media, Events, Leadership. Cards reveal Open and a blue outline on hover. Section navigation scrolls the project pane. Résumé scrolls and downloads the original file. Music starts off and toggles original looping audio with a volume fade. Clock follows the browser timezone (Africa/Lagos in the audit browser), 24-hour HH:mm; desktop top bar also shows weekday/day/month.

## Architecture inventory

DesktopShell, Header, LocalClock, SoundToggle, DesktopIcons, Hero, AvailabilityStatus, WindowFrame, AboutWindow, WorkWindow, ProjectCard, ResumeWindow, ProjectPage, ProjectSidebar, ResultsNote, SocialDock, FramerBadge. Content and project data separate from JSX.

## Evidence and limits

Reference inspected in Codex browser; Playwright/Chrome captures at 1440,1280,1024,768,430,375px saved in `screenshots/reference`. Computed styles stored in `home-measurements.json` and `reference-measurements.json`. Original assets and URLs recorded in `asset-manifest.json`.

Project Download PDF controls expose no working file URL. Final next-project link is malformed. Do not fabricate missing downloads or projects. Framer's injected editor pencil is excluded; Made in Framer badge retained visually. Music and windows will be checked on local implementation. Animation timing is reconstructed from observed transitions, not asserted frame-exact.
