# TypeFlow — visual system and Figma design brief

**Status: PROPOSED / READY FOR FIGMA EXPLORATION, NOT TEAM-APPROVED OR IMPLEMENTED.**

Version 0.2 · 14 October 2026 · Design owner/reviewer: TBD · Figma file: not created.

Purpose: give a Figma agent concrete visual tokens, components, screen layouts and interaction rules for an adaptive typing learning website. The project owner's reference direction is edclub for fonts, colours, style and theme, and Duolingo for learning-path and game-design ideas. Light/dark appearance, English/Arabic interface switching and desktop/mobile page designs are now required by the owner; exact visual values remain proposed. See [decision 0002](docs/decisions.md#0002). Unresolved learning policies remain separate.

## 1. Read this before designing

The [SRS](docs/srs.md) owns behaviour. Use [architecture](docs/architecture.md) for feature boundaries, [API contract](docs/api-contract.md) for draft data shapes, [content guide](docs/content-guide.md) for exercise constraints, and [auth](docs/security.md#authentication-and-authorisation)/[security](docs/security.md) for access and privacy. These describe the target product. **Ignore the current application code and do not derive screens from it.**

- TypeFlow teaches English touch typing on a physical desktop QWERTY keyboard. Typing targets viewports at least 1024 CSS pixels wide; other pages adapt to narrow screens.
- The interface supports English and Arabic. Translate website controls and system explanations, never assigned passages, keyboard letters, authored content or the curriculum. An Arabic interface does not enable Arabic typing lessons.
- Every screen uses the Light/Dark token modes below. Desktop and mobile page variants share the same features and preferences; phone typing entry points show desktop guidance.
- Student and Admin are the only account roles. Visitors can access landing, account and public certificate-verification pages.
- The core journey is assigned text → typing → server-scored official result → updated evidence → explained next activity.
- Structured lessons, adaptive practice, spaced review, placement and tests share one typing experience with mode-specific controls.
- Raw accuracy drives progression. Distinguish it from final accuracy and distinguish provisional metrics from official results.
- Numerical scoring, mastery, adaptation and review rules stay in SRS sections 8–9. Do not invent thresholds or repeat them as a second configuration source.
- Curriculum groups, target defaults/range, reward formulas/goal units, and certified-test policy remain TBD. Bind values to approved configuration later; label examples in Figma **Sample data / policy pending**.
- Preserve required forum, certificates, preferences and administration. No teacher/class, Google sign-in, leaderboard, multiplayer, payment, lives/hearts or virtual-currency features belong in this brief.

## 2. Reference extraction and interpretation

### 2.1 Evidence and limits

References checked on 14 October 2026. edclub's public HTML and linked CSS were retrieved directly; values below are stylesheet declarations, not guessed colours from an image. Browser rendering/computed styles and authenticated product screens were not inspected. CSS URLs may change with the site's next build.

| Reference | Evidence | Use in TypeFlow |
| --- | --- | --- |
| [edclub homepage](https://www.edclub.com/) | Public educational content and linked styles | Warm, approachable educational presentation |
| [edclub global CSS](https://www.edclub.com/_astro/global.B3Yj88F3.css) | Root variables, font-face definitions, body/heading rules | Extracted palette and typography |
| [edclub homepage CSS](https://www.edclub.com/_astro/homepage.Ced_z5Jv.css) | Hero, CTA, section and feature-panel rules | Spacing, hierarchy, rounded actions and navy sections |
| [edclub layout CSS](https://www.edclub.com/_astro/base-layout.BwObUmBt.css) | Navigation/layout styles and theme variables | Navigation scale |
| [Duolingo learn page](https://www.duolingo.com/learn) | Public HTML mainly exposes an application shell; web extraction did not reveal a usable lesson-path view | Requested interaction reference; not a complete current logged-in-page audit |
| [Duolingo path explanation](https://blog.duolingo.com/new-duolingo-home-screen-design/) | Official explanation and illustrations of a guided path mixing lessons and review | Short visible steps, clear next activity, integrated review |
| [Duolingo core-tab design article](https://blog.duolingo.com/core-tabs-redesign/) | Official discussion of typography, spacing and consistent screen families | Consistent headers and intentional whitespace |

**Extracted** means directly present in edclub CSS. **Proposed** means a TypeFlow choice. Duolingo-inspired interactions are proposals, not claims about every current Duolingo feature. The articles document a direction, not a guaranteed current desktop layout.

### 2.2 Extracted edclub typography

| CSS evidence | Actual declaration | Interpretation |
| --- | --- | --- |
| Body | `Lato, sans-serif`; base `1rem` | Readable body font |
| `h1`–`h5` | `Open Sans, sans-serif` | Educational headings |
| Font faces | Open Sans 400/600/700/800; Lato 400 | Explicitly loaded weights |
| Hero heading | Open Sans 800, 40px / 56px, centred | Spacious display hierarchy |
| Hero description | Lato, 20px / 32px, max-width 456px | Short supporting copy |
| Hero button | Lato, 16px / 25px | Legible CTA |
| Other declared fonts | Montserrat 400/700; `edclubWebsite` | Available declarations, not the main homepage text pairing; `edclubWebsite` is an icon font |

Some section sizes change through media queries. These are source declarations, not computed values at an audited viewport. TypeFlow's scale below is a deliberate adaptation.

### 2.3 Extracted edclub colour tokens

Source tokens do not automatically become TypeFlow semantic assignments. Related variable names are preserved.

| edclub variable | Extracted value |
| --- | --- |
| `--background-color-light` | `#F5F3F0` |
| `--background-color-dark` | `#242E3E` |
| `--background-color-darker-blue` | `#171C26` |
| `--theme-white-color` | `#FFFFFF` |
| `--theme-smoke-10` | `#F7F7F9` |
| `--theme-smoke-20` | `#E5E7EB` |
| `--theme-smoke-30` | `#B3B9C1` |
| `--text-color-primary` | `#122947` |
| `--text-color-secondary` | `#556576` |
| `--text-color-tertiary` / `--text-secondary` | `#42576E` |
| `--text-primary` / `--btn-bg-color` | `#2B3749` |
| `--btn-hover-bg-color` | `#354B63` |
| `--btn-active-bg-color` | `#435F7D` |
| `--link-color-blue` | `#4083F4` |
| `--theme-purple-color` | `#8449EB` |
| `--theme-green-color` | `#25CBA9` |
| `--theme-blue-color` | `#0666DF` |
| `--theme-magenta` | `#D036B0` |
| `--theme-emerald` | `#28AF42` |
| `--theme-citrus-color` | `#E0E04C` |
| `--theme-cream` | `#FFF1DE` |
| `--theme-steelblue-color` | `#4682B4` |
| `--text-gold-color` | `#FFF46C` |
| `--accent-color-gold` | `#CD964D` |
| `--highlight-bg-gradient` | `linear-gradient(180deg, #F2EFEB 0%, #FAF9F7 50%, #FAF9F7 100%)` |

### 2.4 Style → TypeFlow direction

edclub's homepage CSS defines a warm hero, generous spacing, bold sans-serif headings, pill-shaped navy actions, blue links and contrasting navy feature sections. Reference values include 72px navigation height, 56px hero gap and 30px CTA radius. Feature panels include asymmetric rounded corners. See the [homepage stylesheet](https://www.edclub.com/_astro/homepage.Ced_z5Jv.css).

**Proposed theme: calm, encouraging keyboard learning.** Warm off-white page backgrounds, white study surfaces and navy typography form the base. Purple identifies the current learning activity, teal supports positive progress, gold marks rewards, and blue identifies links/focus. Colourful illustration belongs on landing, path and achievements; the typing stage stays quiet.

Keep the working TypeFlow name. Propose an original keycap/flow-arrow symbol with an Open Sans wordmark; final branding remains open. Illustrations use simple rounded keyboard keys, hands, letters and milestones. Use rounded vector icons at 20/24px with 2px strokes. Finished screens use original TypeFlow assets rather than competitor logos, mascots or copied screenshots.

Light and Dark are required appearance modes. Keep the warm edclub-inspired Light palette; Dark uses layered deep navy surfaces, soft light text, lilac learning accents, mint progress and light blue focus. These dark values are original TypeFlow proposals, not an extracted edclub dark theme. Avoid pure-black canvases, automatic colour inversion and large bright surfaces around the passage. Navy marketing sections use inverse tokens in both modes.

## 3. Proposed TypeFlow colour system

Create Figma colour variables with these exact names. Semantic variables may alias primitives. All values are **proposed**, including reused edclub values. Additional tints and dark status colours support readable UI.

| Semantic variable | Light | Dark | Role |
| --- | --- | --- | --- |
| `color/bg/page` | `#F5F3F0` | `#171C26` | Canvas |
| `color/bg/surface` | `#FFFFFF` | `#242E3E` | Cards, inputs, passage, dialogs |
| `color/bg/subtle` | `#F7F7F9` | `#2D3A4E` | Muted sections/table headings |
| `color/bg/inverse` | `#242E3E` | `#101723` | Selected marketing sections |
| `color/text/primary` | `#122947` | `#F2F4F8` | Main text/upcoming characters |
| `color/text/secondary` | `#556576` | `#B8C4D6` | Supporting copy/metadata |
| `color/text/inverse` | `#FFFFFF` | `#F2F4F8` | Text on inverse sections |
| `color/border/subtle` | `#E5E7EB` | `#3B4B63` | Decorative edges only |
| `color/border/control` | `#7C8796` | `#7F90A8` | Identifying control outlines |
| `color/action/primary` | `#2B3749` | `#C4A7FF` | Main CTA fill |
| `color/action/hover` | `#354B63` | `#D6C2FF` | Hovered CTA fill |
| `color/action/pressed` | `#435F7D` | `#B495EB` | Pressed CTA fill |
| `color/action/foreground` | `#FFFFFF` | `#171C26` | Text/icons on all primary CTA states |
| `color/action/link` | `#0666DF` | `#8DC2FF` | Underlined prose links |
| `color/focus/ring` | `#0666DF` | `#8DC2FF` | Focus/current-character caret |
| `color/learning/accent` | `#8449EB` | `#C4A7FF` | Current node/learning accent |
| `color/learning/foreground` | `#FFFFFF` | `#171C26` | Text/icons on solid accent nodes |
| `color/learning/strong` | `#6D36C4` | `#D6C2FF` | Review text on learning-soft |
| `color/learning/soft` | `#F1E9FC` | `#392B53` | Selection/review-chip background |
| `color/learning/lip` | `#6D36C4` | `#8060AB` | Decorative node lip |
| `color/success/accent` | `#25CBA9` | `#52D8B5` | Progress decoration |
| `color/success/text` | `#186B56` | `#8BE3C6` | Success/correct characters |
| `color/success/soft` | `#E8F8F1` | `#173D35` | Success/mastered backgrounds |
| `color/warning/accent` | `#CD964D` | `#EDBD76` | Attention icon |
| `color/warning/text` | `#8A4B08` | `#FFD08A` | Warning text |
| `color/warning/soft` | `#FFF1DE` | `#44341E` | Attention background |
| `color/error/text` | `#B42318` | `#FFB4AD` | Errors/incorrect characters/destructive text |
| `color/error/soft` | `#FFF0EE` | `#4A292F` | Error panels/cells |
| `color/reward/accent` | `#E0E04C` | `#E5DE72` | Reward decoration |
| `color/reward/text` | `#684500` | `#F2E595` | XP/badge labels |
| `color/reward/soft` | `#FFF7CC` | `#3D3820` | Earned-reward background |
| `color/streak/text` | `#9A4D00` | `#FFBE80` | Streak icon/label on surface |
| `color/disabled/bg` | `#E5E7EB` | `#303B4C` | Disabled fill |
| `color/disabled/text` | `#556576` | `#ADB9C9` | Disabled label/explanation |
| `color/overlay` | `#171C26` at 48% | `#0B1018` at 72% | Modal scrim |

Use each mode's semantic foreground/background pair. Primary button/node text uses its dedicated foreground token, not inverse-section text: white text on the dark theme's light-lilac CTA is unsuitable. Keep instructional text at full opacity. Do not use decorative accent colours as untested small text or sole control outlines. The source's lighter blue link is replaced with its darker blue in Light mode.

### 3.1 Appearance control and persistence

- Show a labeled **Appearance** menu in public/student/admin headers and in mobile navigation; repeat it under Profile → Appearance & language. Options: **Light**, **Dark**, **System**. The stored default is System; resolve it to Light/Dark from the device preference, with Light fallback if unavailable. Figma has only the two rendered modes; System is a selection state, not a third palette.
- Use sun/moon/device icons plus text and a selected check; never rely on an unlabeled icon or ambiguous toggle. Keyboard and screen-reader users can identify the current choice.
- Resolve initial appearance before the main screen renders to avoid a light flash on dark pages. System follows device changes only while selected; explicit Light/Dark overrides it.
- Signed-in users save the preference on their own account; saved account preferences win at sign-in. Visitors remember only allowlisted appearance/locale values locally. See SRS section 10.5 and the draft preference contract; do not add a theme environment variable.
- Saving shows pending/success/failure. Failure restores the last confirmed value and offers Retry. Theme changes recolour the existing view without remounting the recorder, navigating or resetting an assignment. Opening a preference control still follows mode focus/pause rules.
- Apply tokens to all pages, portal dialogs, menus, charts, keyboard states and illustrations. Dark cards use borders and layered fills rather than bright shadows. Keep original assets legible in both modes; do not invert images globally.

### 3.2 Contrast evidence and target

Proposed accessibility target: WCAG 2.2 AA contrast, at least 4.5:1 for normal text and 3:1 for large text and essential non-text indicators. This is a design target; rendered conformance is not yet verified.

These opaque sRGB pairs were calculated during this documentation task using relative luminance:

| Foreground / background | Ratio |
| --- | --- |
| Primary `#122947` / white `#FFFFFF` | 14.65:1 |
| Secondary `#556576` / page `#F5F3F0` | 5.40:1 |
| White / CTA `#2B3749` | 12.03:1 |
| White / learning accent `#8449EB` | 5.08:1 |
| Link/focus `#0666DF` / white | 5.28:1 |
| Link/focus `#0666DF` / page | 4.77:1 |
| Success `#186B56` / `#E8F8F1` | 5.84:1 |
| Error `#B42318` / `#FFF0EE` | 5.93:1 |
| Warning `#8A4B08` / `#FFF1DE` | 6.11:1 |
| Reward `#684500` / `#FFF7CC` | 7.96:1 |
| Dark primary `#F2F4F8` / surface `#242E3E` | 12.42:1 |
| Dark secondary `#B8C4D6` / page `#171C26` | 9.67:1 |
| Dark secondary `#B8C4D6` / subtle `#2D3A4E` | 6.52:1 |
| Dark CTA foreground `#171C26` / fill `#C4A7FF` | 8.39:1 |
| Dark CTA foreground `#171C26` / pressed `#B495EB` | 6.86:1 |
| Dark link/focus `#8DC2FF` / surface `#242E3E` | 7.36:1 |
| Dark link/focus `#8DC2FF` / subtle `#2D3A4E` | 6.18:1 |
| Dark success `#8BE3C6` / `#173D35` | 7.92:1 |
| Dark error `#FFB4AD` / `#4A292F` | 7.51:1 |
| Dark warning `#FFD08A` / `#44341E` | 8.34:1 |
| Dark reward `#F2E595` / `#3D3820` | 9.20:1 |
| Dark control border `#7F90A8` / subtle `#2D3A4E` | 3.53:1 |

Check all actual text/icon/chart/focus pairings in Figma, including selected status chips and hovered controls; these calculations do not verify rendering, transparency or unlisted combinations. On inverse marketing surfaces use a light ring with a navy separation gap. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). All listed ratios are rounded for reporting; pass/fail uses unrounded values.

Documentation verification on 14 October 2026: all 35 semantic colour variables have Light/Dark values; 62 opaque semantic foreground/background checks passed their 4.5:1 text or 3:1 non-text targets. The matrix covered body/secondary text, primary-button states, links, focus, control outlines, learning/status/reward text and inverse surfaces. Translucent overlays, rendered charts/illustrations and browser states still need visual verification.

## 4. Proposed typography

Retain edclub's Open Sans/Lato pairing. Add **IBM Plex Mono** for aligned exercise text and keyboard legends; this is a TypeFlow proposal, not an extracted edclub font. Obtain fonts from their own distributions and review licences when preparing assets; do not copy font binaries from competitor sites.

| Role | Family and weights | Fallback |
| --- | --- | --- |
| Display/headings | Open Sans 700/800 | Arial, sans-serif |
| Body/navigation/forms | Lato 400/700 | Arial, sans-serif |
| Exercise/key legends | IBM Plex Mono 400/500 | Consolas, Courier New, monospace |
| Metrics | Lato 700, tabular numerals | Arial, sans-serif |
| Arabic interface, headings/body | Noto Sans Arabic 400/700/800 | Tahoma, Arial, sans-serif |

Lato 700 and IBM Plex Mono are TypeFlow additions; only Lato 400 was explicitly loaded in the inspected global CSS. If a font is unavailable in Figma, annotate temporary use of its fallback.

| Figma text style | Size / line height | Weight | Usage |
| --- | --- | --- | --- |
| `Display/Large` | 48 / 60px | Open Sans 800 | Desktop landing hero |
| `Heading/Page` | 32 / 44px | Open Sans 700 | Page title |
| `Heading/Section` | 24 / 34px | Open Sans 700 | Major section |
| `Heading/Card` | 20 / 30px | Open Sans 700 | Card title |
| `Body/Large` | 18 / 28px | Lato 400 | Intro copy |
| `Body/Default` | 16 / 26px | Lato 400 | Main copy/forms |
| `Body/Strong` | 16 / 26px | Lato 700 | Emphasis/navigation |
| `Label/Default` | 14 / 22px | Lato 700 | Labels/chips |
| `Caption/Default` | 14 / 22px | Lato 400 | Metadata |
| `Action/Default` | 16 / 24px | Lato 700 | Sentence-case buttons |
| `Metric/Large` | 32 / 40px | Lato 700 | Result numbers |
| `Typing/Default` | 28 / 48px | IBM Plex Mono 400 | Passage |
| `Typing/Large` | 36 / 60px | IBM Plex Mono 400 | Large-text preference |
| `Keyboard/Legend` | 16 / 24px | IBM Plex Mono 500 | Key labels |

Use zero tracking by default and left-aligned copy; never justify. Body lines should usually stay within 60–75 characters. Preserve exercise spaces, disable ligatures and keep glyph advances stable. Visual wrapping must not alter the assigned passage. Represent space errors with a visible marker and accessible description. Large text also enlarges surrounding instructions without clipping. Check `i/l/1`, `O/0`, punctuation and space markers before approving the typing font.

For Arabic interface text, align to logical start (right), use [Noto Sans Arabic](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic) with the corresponding role size/weight, and increase body/label line height to at least 1.6× size. Allow wrapping and taller controls rather than truncating Arabic or shrinking fonts. Arabic runs retain normal shaping/ligatures and zero letter spacing; the monospace/no-ligature rule applies only to English exercise text. Never use all-caps transformations on Arabic.

### 4.1 Interface language: English / العربية

| Concern | Required design |
| --- | --- |
| Selector | Globe + visible **Language / اللغة** label; choices **English** and **العربية** in their own names, with current choice marked. No country flags. |
| Location | Public/student/admin header, mobile navigation and Profile → Appearance & language; available before login. |
| Default/save | English (`en`) initially; explicit choice Arabic (`ar`). Guest local choice persists; signed-in account choice persists across devices and takes precedence at login. Locale is independent of timezone and theme. |
| Translated UI | Navigation, forms, buttons, help, validation/status messages, chart labels, device guidance, system-authored learning explanations and certificate disclaimer. Stable translation keys/codes keep meanings equivalent. |
| Content boundary | Assigned passages, authored lesson/content text, word lists, focus letters/pairs, keyboard legends and user/forum posts stay in their original language. No automatic translation or new content-language selector. Certificates/PDF content is not automatically translated; surround it with equivalent localized explanation. |
| RTL shell | Arabic uses RTL reading order, right-aligned labels and navigation at inline-start (right). English is LTR. Mirror directional navigation arrows; do not mirror wordmarks, universal icons, charts' data chronology or physical keyboard geometry. |
| English island | Passage/input, caret progression and QWERTY guide remain `lang="en"`, `dir="ltr"`, left aligned in either shell. Isolate key/pair chips, emails, codes and metric units to prevent bidirectional reordering. |
| Data formatting | Localize ordinary UI dates consistently with the saved timezone; do not reassign streak days. Keep exercise/test metrics, durations and verification codes using Western digits and explicit units for consistency. Labels can be Arabic. |
| Failure/loading | Keep current language/content visible while loading a dictionary. Missing messages fall back to English; show an English fallback annotation in prototype review and require complete translations before release. |

Use HTML `lang`/`dir` semantics and logical layout properties in the eventual implementation, following [W3C direction guidance](https://www.w3.org/International/questions/qa-html-dir). Dynamic system explanations should use agreed reason codes/parameters and reviewed dictionaries, never an LLM translation of session text. Editing display locale must not alter generation language/specifications, persisted events, raw accuracy, mastery or certificates. A language update preserves the current assignment and input; focus loss follows the active mode rather than creating a special pause.

Suggested control labels for the prototype (Arabic wording still needs native-language review): **Appearance / المظهر**, **Light / فاتح**, **Dark / داكن**, **System / النظام**, **Language / اللغة**. Add helper copy: “Changes the website interface. Typing exercises stay in English.” / “يغيّر لغة واجهة الموقع فقط. تبقى تمارين الكتابة باللغة الإنجليزية.”

## 5. Layout, shape and motion tokens

### 5.1 Spacing and containers

Use a 4px base. Number variables: `space/1=4`, `space/2=8`, `space/3=12`, `space/4=16`, `space/5=20`, `space/6=24`, `space/8=32`, `space/10=40`, `space/12=48`, `space/16=64`, `space/20=80`, `space/24=96` (px). Card padding 24px, section gap 32px, form gap 20px, icon-label gap 8px.

| Token / frame | Proposed value |
| --- | --- |
| `layout/public/header` / `layout/app/header` | 72px high |
| `layout/app/sidebar` | 224px wide |
| `layout/content/max` | 1200px |
| `layout/rail/width` | 280px |
| `layout/study/max` | 960px |
| `layout/auth/max` | 440px |
| `layout/gutter/desktop` | 32px |
| `layout/gutter/compact` | 24px |
| `layout/gutter/narrow` | 16px |
| `layout/grid/gap` | 24px |
| Main Figma desktop | 1440 × 1024; 12-column content grid |
| Minimum typing frame | 1024 × 768 |
| Non-typing tablet | 768 × 1024 |
| Non-typing phone | 390 × 844; also check reflow at 320px |

Frame heights are viewport sizes, not fixed page heights. Use auto-layout and scrolling; do not crop history, forms or long forum text.

### 5.2 Shells and responsive behaviour

| Shell | Composition | Responsive behaviour |
| --- | --- | --- |
| Public | Wordmark, Log in/Get started, centred content, footer with verification link | Stack sections; keep account actions accessible |
| Student | Inline-start navigation (left in English/right in Arabic), header, primary content, optional goal/review rail | At 1280px and above use content + rail. At 1024–1279px move rail below. Below 1024px use drawer + one column for non-typing pages. |
| Study | Exit/mode/preferences top bar, progress, passage, keyboard guide | Centred 960px maximum; no dashboard rail. Below 1024px show desktop/physical-keyboard guidance and return action, not mobile typing. |
| Admin | Role-labeled navigation, header, tables/editors | Drawer navigation, wrapped filters, labeled contained table scrolling where necessary |

Student navigation: **Dashboard, Learning path, Practice, Review, Tests, Progress, Achievements, Certificates, Forum**. Profile/settings and logout are in the account menu. Review may show a real due count. Progress contains history; achievements contains XP/level, goals, streak and badges.

Admin navigation: **Overview, Users, Content, Learning settings, Moderation, Certificates, Audit**. Content includes Word lists, Blocked words, Themes and Key groups. Admin tools use their own shell; a role label does not grant access to private student records.

Narrow-screen menus have a labeled keyboard-accessible trigger. Charts resize and offer data alternatives; metric cards stack. Device guidance must not discard an already-active attempt: resizing/focus changes preserve the current mode's timing semantics.

#### Desktop layout

- Primary frame 1440 × 1024; also check 1280px and minimum typing viewport 1024 × 768. Use 12 content columns with 24px gaps and 32px gutters at wide desktop; compact desktop uses 24px gutters. Side navigation stays 224px and the optional rail 280px where space permits.
- Dashboard: recommendation/path/history in the main column, goals/review in the rail. Path and progress may use side-by-side map/detail views. Result metrics form one row of four when space permits.
- Forms remain readable rather than stretching across all columns; authentication is capped at 440px. Admin tables use full available width with filters above and visible row actions.
- Study stays centred with a 960px maximum, passage-first hierarchy and complete physical-QWERTY guide. Secondary help can scroll at short heights, but the active line and essential controls must stay reachable.
- Both themes preserve identical geometry. Arabic mirrors shell placement/reading order while retaining LTR exercise, keyboard, codes and chart chronology.

#### Mobile-phone layout

- Primary frame 390 × 844; validate at 320, 360 and 430 CSS pixels. Use four columns, 16px gutters, 16px card padding, 16px gaps and a 64px minimum header that can grow for text. Cards/forms become one column with no fixed viewport-height clipping.
- Header: compact TypeFlow wordmark, labeled menu trigger and account action. The drawer contains the full navigation, Appearance and Language choices, account/settings and logout. Mark the current page; opening/closing handles focus. RTL drawer opens from the right; LTR from the left. Avoid a crowded bottom bar with nine destinations.
- Landing stacks copy/illustration/CTA; account fields and main actions fill available width. Dashboard keeps recommendation first, then goal/review and recent sessions. A practice CTA opens device guidance; account, progress and forum remain usable.
- Path becomes a compact vertical list of group/activity cards with lock/review explanations. Keep physical key order unchanged if a map is shown; offer a readable key-state list when the full map would be too small.
- Result/history metrics stack into two columns when readable, one at 320px or with large text. Forum preserves reply/report/accepted-answer actions, wrapping user text and long titles. Certificates stack status/details/actions with a readable unproctored label.
- Progress charts fit their container with fewer axis labels and a full data-table alternative. History/admin tables may become labeled record cards; genuinely two-dimensional data can scroll inside a labeled region, not the whole page. Required moderation/user/content/settings actions stay available.
- Dialogs become near-full-width sheets or full-height panels with internal scrolling, visible close/cancel, safe-area padding and reachable actions above the software keyboard. Do not use hover-only controls.
- Typing/placement/test launch shows “Continue on a desktop with a physical English QWERTY keyboard.” with Back to dashboard. Do not create a scored touch-keyboard session or crop a desktop stage into a phone frame. Screen width alone does not waive the desktop/physical-keyboard scope.
- Reflow preserves feature priority and state rather than merely shrinking fonts. Controls retain at least 44px touch targets. Verify Arabic wrapping, 200% text size and 320px reflow, following [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

#### Responsive/theme/language coverage

| Inventory | Desktop | Mobile phone |
| --- | --- | --- |
| Public/account, dashboard/path, progress/achievements, certificates, forum, profile and all admin pages | Full feature layout in Light/Dark and English/Arabic | Adapted functional layout in Light/Dark and English/Arabic |
| Practice/review/placement/test setup | Full setup with device/mode rules | Summary and desktop guidance; no scored attempt launch |
| Active typing and mode controls | Full stage at supported desktop sizes | Device guidance; an existing attempt retains mode timing/state on resize |
| Saved results, errors and empty states | Full readable states | Reflowed readable states; no horizontal page overflow |

Use shared components and mode/locale/viewport properties for this matrix. Tablet is an intermediate reflow check, not a separate mobile-typing feature. Do not hide functionality simply because an Admin page is viewed on a phone.

### 5.3 Shape and elevation

| Variable/style | Value | Usage |
| --- | --- | --- |
| `radius/control` | 12px | Inputs/buttons |
| `radius/card` | 20px | Cards |
| `radius/dialog` | 24px | Dialogs |
| `radius/pill` | 999px | Chips/landing CTA |
| `border/default` | 1px | Decorative edges |
| `border/control` | 2px | Fields/interactive cards/keycaps |
| `Effect/Card` | 0 2px 8px, `#122947` at 6% | Selective card elevation |
| `Effect/Popover` | 0 8px 24px, `#122947` at 12% | Popovers/dialogs |
| `Effect/PrimaryLip` | 0 3px 0, `#171C26` | Optional main learning CTA depth |
| `Effect/NodeLip` | 0 4px 0, `color/learning/lip` | Current path node in either mode |

Normal dashboard/admin surfaces use flat borders. Raised lips are reserved for main learning actions/path nodes. Standard action height 48px, compact 40px where needed; icon-only hit areas at least 44 × 44px. Focus ring 3px with 2px separation; no clipping by cards or sticky headers.

The listed card/popover shadow colours describe Light mode. In Dark mode use minimal black shadow plus the semantic border/surface layers; retain the node lip's mode binding. Certificate PDFs keep their independent print-friendly styling; changing website appearance does not regenerate or invert them.

### 5.4 Motion

Number tokens: `motion/fast=120ms`, `motion/standard=180ms`, `motion/panel=240ms`, `motion/reward=600ms`. Easing: `cubic-bezier(0.2,0,0,1)`.

- Buttons change colour and depress up to 2px without shifting surrounding layout.
- Panels fade/translate at most 8px. Brief current-node emphasis is allowed; no endless pulse.
- Reward animation occurs once after an official result, inside its panel, without delaying navigation.
- Character feedback is immediate with no animated glyph movement. No particles, shake or popups in the typing stage.
- Reduced motion uses static states/instant progress updates. Reduced pressure hides live speed/timer emphasis but does not change elapsed-time rules; explain that timing continues. Sound is not required.

## 6. Learning-path and game-design translation

Duolingo's [official path explanation](https://blog.duolingo.com/new-duolingo-home-screen-design/) describes guiding learners through new material and review on one path. TypeFlow adopts visible steps and review integration while its adaptive engine and key-group prerequisites determine eligibility.

### 6.1 Path composition

Use vertical group sections: heading/key preview, connected activity nodes and a supporting next-step card. Nodes may alternate horizontally within the central column for a playful route; reading/tab order stays top-to-bottom. Use original keyboard/practice/review/milestone icons.

Sections reflect the configured prerequisite graph; do not invent final group names/order. A visually linear recommended route can coexist with several unlocked groups. Include a readable group-list alternative and QWERTY map. A node opens an eligible activity; it does not promise mastery after a fixed number of clicks.

| Path presentation | Visual treatment | Meaning/action |
| --- | --- | --- |
| Locked | Neutral node, lock, prerequisite text | View why locked; Start unavailable |
| Available | Surface-fill node, control outline, activity icon | Start eligible activity |
| Recommended next | Purple 72px node, 4px bottom lip, adjacent label | Primary Start plus engine reason |
| In progress | Blue outline, dot/progress cue, text | Evidence still developing |
| Mastered | Success-soft node, success-text check, label | Confirmed server evidence |
| Review due | Separate review chip/icon beside underlying state | Start review; does not replace mastery state |
| Insufficient evidence | “More practice needed” and sample status | Explain unknown evidence, not fabricated 0% mastery |

Node size is a visual value, not a learning parameter. Do not show percentage mastery unless an agreed contract defines it. First prototypes show discrete states and factual counts.

### 6.2 Motivating loop

1. Dashboard shows one recommendation with focus keys/pairs and **Why this practice?**
2. Start an assigned exercise with visible progress and supportive instructions, without reward distractions.
3. Submit into scoring/saving; provisional performance cannot award XP/mastery/certificates.
4. Official result shows performance, applicable returned rewards and next recommendation.
5. Updated path reflects saved evidence and due review. Completing an exercise may still require more practice.

Reason example: “You have less evidence for these keys. Practise them before moving on.” Specific weak keys/pairs must be supported by returned evidence. Present the engine explanation, not invented AI coaching paragraphs.

### 6.3 Required rewards

| Feature | Proposed treatment | Policy boundary |
| --- | --- | --- |
| XP | Gold-icon earned-XP panel on official result | Server reward values; no invented fixed per-lesson XP |
| Level | Label/progress to next configured level | Approved thresholds |
| Daily goal | Progress card with configured unit/local-day context | Units remain TBD; do not assume minutes, sessions or XP |
| Streak | Flame/day count/timezone help | No freezes, paid repairs or punishment copy |
| Badges | Earned/unearned cards with names/criteria | Approved criteria; no duplicate award on recovery |
| Mastery milestone | Keyboard/check illustration and newly available group | Returned mastery/unlock changes only |

Reward persistence and accurate practice. A failed review can return a key to in-progress while later groups stay unlocked. Tests save history and qualifying rewards but do not alter curriculum/mastery. Placement has no XP/certificate celebration. No lives, currency, leaderboards or competition countdowns.

## 7. Figma component catalogue

Build components before screens. Bind semantic variables/text styles; states are variants, not detached copies. Keep components compatible with the planned Tailwind/shadcn/ui stack without prescribing new dependencies. Implementation targets JavaScript/JSX in root-level `client/`, shared runtime schemas in `packages/shared/` and backend behaviour in `server/`. The language/folder decision does not change the proposed visual system.

| Component / properties | Requirements |
| --- | --- |
| `Action/Button` — primary/secondary/ghost/destructive; regular/compact; default/hover/pressed/focus/disabled/loading | Semantic primary fill/foreground; outlined surface secondary; persistent loading label; both themes |
| `Form/Field` — text/email/password/select; default/focus/error/disabled/loading | Visible label/helper/error; no placeholder-only labels; labeled password toggle |
| `Form/Preference` — checkbox/switch/radio | Selected mark/label, keyboard interaction, save success/failure |
| `Preferences/Appearance` — light/dark/system; default/focus/saving/error | Text/icon/check selection; System resolves to a rendered mode; header and profile variants |
| `Preferences/Language` — en/ar; default/focus/loading/error | Own-language labels, globe, selection mark and English-content helper; LTR/RTL-safe |
| `Nav/Item` — selected/unselected/focus; badge | Soft-purple selection, icon/weight cue, real counts |
| `Surface/Card` — default/selected/interactive | 20px radius/24px padding; interactive outline/focus |
| `Feedback/Banner` — info/success/warning/error | Icon/title/explanation/action; colour is supplementary |
| `Feedback/Empty` / `Feedback/Loading` | Useful message/action; matching skeletons, no fake scores |
| `Overlay/Dialog` / `Overlay/Menu` | Heading, intentional focus handling, close/Escape and focus restoration |
| `Learning/PathNode` | Section 6 states; due review independent; detail card |
| `Learning/Recommendation` | Mode, focus chips, reason, one Start action |
| `Learning/Keycap` | Locked/in-progress/mastered; next/error/review overlays; legend/non-colour cues |
| `Typing/Character` | Upcoming/current/correct/incorrect; whitespace variant; stable glyphs |
| `Typing/Controls` | Mode and lifecycle-specific allowed actions |
| `Metric/Tile` | Provisional/official/unavailable; metric/unit/authority label |
| `Progress/Chart` / `Progress/Heatmap` | Filters, axes/legend, tooltip and data alternative |
| `Rewards/Goal` / `Rewards/Level` / `Rewards/Badge` | Policy-bound values and earned/unearned states |
| `Data/Table` | Caption, filters/sort, pagination proposal, actions, empty/loading/error |
| `Forum/Post` / `Forum/Thread` | Author/date, pin/accepted labels, reply/report, moderation placeholders |
| `Certificate/Status` | Valid/revoked/unavailable icon/label; unproctored label |

Save acknowledgements may use toasts; important errors/results need persistent inline content. Never rely solely on a toast for certificate status, typing rejection or deletion outcome.

## 8. Typing experience — primary design priority

Relevant requirements: SYS-10–32, SYS-46–47 and SYS-50–51; SRS sections 8–9.

### 8.1 Screen anatomy

Arrange inside the study shell:

1. **Top bar:** Exit, mode, Large text and Reduced pressure; compact Appearance/Language menu. Explain abandonment before active exit/restart and respect mode focus rules when using preferences.
2. **Activity header:** Title, focus chips and reason. Intentional restricted-alphabet exercises are labeled “Key drill” with a brief explanation.
3. **Progress:** Passage progress for untimed modes; selected duration/time remaining for tests unless visually hidden. Hidden timing still runs.
4. **Typing surface:** Semantic surface card, 32–48px padding, exact English/LTR passage/current position in either theme/interface language. Keep active line visible without jarring scrolling.
5. **Live metrics:** “Live · provisional”, gross WPM and raw accuracy. Reduced pressure hides live speed/timer emphasis while retaining progress/instructions.
6. **QWERTY guide:** Next expected key; Shift hints only for permitted assignments. Informational guide, not a touch keyboard.
7. **Controls/help:** Pause/Resume only where allowed; Restart and keyboard guidance. Shortcuts cannot collide with exercise letters or captured controls.

### 8.2 Character and key feedback

| State | Non-colour cue | Colour |
| --- | --- | --- |
| Upcoming | Plain glyph, no completion underline | Primary text on surface in the selected mode |
| Current | Caret/outline/current-position cue | Blue caret, primary glyph |
| Correct | Thin solid completion underline | Success-text token; optional success-soft tint |
| Incorrect | Thick/double underline, tinted cell, persistent error summary | Error-text token on error-soft |
| Wrong space | Visible space marker with matching state/description | Error semantic colours |

Do not replace assigned characters with decoration. Keep glyphs aligned across states. An accessible error summary can describe the latest mismatch/current position without announcing every keystroke. Screen-reader interaction requires prototyping and actual assistive-technology testing; tokens do not prove it works.

Next keyboard key: blue outline plus arrow/label. Mastered: check. Locked: lock/neutral. Weak/review: labeled dot or pattern with legend. Next-key guidance stays dominant; detailed progress heatmaps are separate.

### 8.3 Session-state prototypes

| UI state | Display/actions |
| --- | --- |
| Preparing | “Preparing your practice”; no running timer/fake scores |
| Ready | “Start typing to begin”; exact text ready; timing starts on first printable input |
| Active | Capture only in exercise; end-of-buffer correction/allowed Shift; block paste/drop/bulk edits |
| Paused practice/review | Quiet overlay; deliberate Resume/focus; valid pauses excluded from active time |
| Placement/test focus loss | Timing continues; reminder on return; no Pause control |
| Restart/exit | Explain abandoned attempt/no result or rewards; new assignment on restart |
| Submitting | “Scoring and saving your result”; preserve payload; prevent duplicate actions |
| Retryable save/network failure | “We couldn't confirm your result yet. Retry saving.” Identical payload; no official rewards/unlocks |
| Recovered saved result | Existing official result; no repeated reward animation |
| Rejected/conflicting/expired | Useful reason/recovery; ordinary typing mistakes are not rejection |
| No validated content | Retry/return; never serve unvalidated text |
| Test text exhausted early | Content failure/fresh attempt; no full-duration certificate claim |

Lesson/practice/review allow pause and auto-pause on focus loss. Placement/timed/certified do not pause. Certified tests show a pre-start countdown after text is ready; scored timing starts with the first insert. SRS section 8 remains authoritative.

## 9. Screen inventory and architecture alignment

These are **screen labels, not agreed browser URLs or new API endpoints**. Use architecture feature folders/draft API groups; complete DTOs/routes need phase agreement. Each screen needs loading, empty, error, success and unavailable/permission states where applicable.

| Screen / module | Content and primary action | Requirements/boundaries |
| --- | --- | --- |
| Landing / public | “Build speed. Keep accuracy.”; Start learning/Log in; keyboard illustration; benefits/path sample; certificate explanation | Guest entry; no invented efficacy claims/testimonials |
| Register/login / auth | Labeled single-column form, verification explanation, safe errors | SYS-1–8; email/password; no role picker/Google button |
| Verify/resend / auth | Needed/success/expired/used states, actual resend guidance | SYS-3; login blocked until verified |
| Forgot/reset / auth | Generic acknowledgement, invalid/expired/used token, return to login | SYS-5, SYS-48; no enumeration |
| Placement / placement | Take or Skip, device/mode guidance, estimate/next step | SYS-16; no mastery/XP promise; skip uses initial configured group |
| Dashboard / dashboard | Recommendation/reason first; goals/streak/XP, review, recent sessions | SYS-18, SYS-22, SYS-33–35; first use points to placement/path |
| Path/map / keyboard-map | Configured groups/nodes, QWERTY states, prerequisites | SYS-17–23; due review/insufficient evidence |
| Practice setup / typing | Focus/reason, permitted options, Start | SYS-18, SYS-24–29; theme only if contract supports it; cannot unlock characters |
| Review / review | Due keys/rationale, Start; no-due return to practice | SYS-21; preserve later unlocks |
| Typing / typing | Section 8 study shell | One mode-driven lifecycle |
| Result / result | Four metrics, evidence, applicable rewards, next activity, Continue | SYS-30–35, SYS-46; official before reward updates |
| Tests / tests | Timed/certified tabs, rules, timed 1/3/5-minute choices, Start | SYS-36–38; certified policy loaded, not invented |
| Progress/history / progress | Mode/difficulty/date filters, trends, heatmap, session table/detail | SYS-33; comparable data, unknown evidence, no raw logs |
| Achievements / gamification | XP/level, goal, streak, badges | SYS-34–35; configuration-bound criteria |
| My certificates / certificates | Issued/revoked list, detail/PDF/verification link | SYS-37–38; PDF retry does not erase issuance |
| Public verification / certificates | Code lookup/link, status/public fields, unproctored explanation | SYS-38; consented name, issue date, duration, metrics, code/status only |
| Forum list/thread/compose / forum | Threads/replies, accepted answer, report; list/search proposal | SYS-39–40; student access; guest reading TBD |
| Profile/preferences / profile | Name/timezone/target/goal/accessibility, Appearance & language, deletion | SYS-9, SYS-48, SYS-53–56; saved presentation settings, future-session target, separate public-name consent |
| Admin overview / admin + analytics | Windowed usage, comparable performance, problem keys, validation/fallback rates | SYS-44; periods/denominators, no invented measurements |
| Admin users / admin | Search/status, protected admin creation, deactivate/delete | SYS-6, SYS-41, SYS-45, SYS-48; last-admin protection |
| Admin content / admin + generation | Lists/blocked words/themes/groups, prerequisites, validation preview/activation | SYS-25, SYS-42, SYS-51; feasible fallback checks |
| Admin learning settings / settings | Current version, validated changes, save/activate | SYS-43; future sessions, not retroactive |
| Admin moderation / forum + admin | Reports/context, pin/hide/delete | SYS-40, SYS-45; hidden/deleted content excluded from ordinary views |
| Admin certificates / certificates + admin | Search/status/revoke confirmation | SYS-38, SYS-45; privacy-safe |
| Admin audit / admin | Actor/action/target/time/minimal summary | SYS-45; protected, no logs/secrets |

Deletion views explain personal history, authored text and certificate identity/PDF removal before confirmation. Anonymous structural forum placeholders retain reply structure without deleted content. Revoked/unavailable certificate views cannot restore erased identity.

### 9.1 Three anchor screens for the first Figma pass

**Dashboard, 1440 × 1024:** 224px sidebar, 72px header, 32px main gutters. Flexible content + 280px rail, 24px gap. Main: title/greeting, large recommendation with reason/focus/Start, compact path preview, recent sessions. Rail: daily goal, streak/level and due review. Compact desktop moves rail below. Counts/XP are labeled fixtures.

**Typing, 1440 × 1024 and 1024 × 768:** 960px centred study shell; compact header, activity/reason, progress, mode-bound passage surface, provisional metrics, guide and controls. Fit active passage/essential controls at minimum desktop; secondary help may scroll. Include both themes, Arabic shell with unchanged English passage, large-text, reduced-pressure, paused, timed and save-retry variants. Its phone counterpart is device guidance.

**Official result, 1440 × 1024:** mode-specific completion heading + **Official result**. Metric row: Net WPM, Gross WPM, Raw accuracy, Final accuracy, each explicitly labeled. Follow with key/pair evidence, applicable rewards, next recommendation; Continue primary, View progress/Return secondary. Placement says “Placement estimate” with official saved measurements and provisional ability evidence; omit XP/certificates. Tests omit curriculum/mastery-change claims.

Raw-accuracy help: “Counts every typing attempt, including corrected mistakes.” Final-accuracy help: “Accuracy of the text remaining when you finished.” Unknown shows “Not available”, never a perfect score. Low accuracy uses “Let's give these keys more practice”, not a failure banner for insufficient evidence.

### 9.2 Charts and reports

Use separate labeled speed/accuracy charts or clearly distinct axes; no unexplained combined score. Filter modes/difficulty where needed. Lines use patterns and labeled legends. Heatmaps distinguish locked/unknown/in-progress/mastered/review due and offer a data table for counts/accuracy/latency. Unknown latency is unavailable, not zero.

Admin metrics explain reporting windows/denominators. Raw streams, tokens, internal integrity heuristics and private learning records stay out of public/student mocks. Admin detail needs explicit authorised access; navigation does not grant it.

## 10. Accessibility, copy and edge states

- Keyboard access to every action, skip-to-content, visible focus, logical order; no traps outside intentional dialogs. Closing restores meaningful focus.
- Capture typing only in the exercise. Preferences/forum/navigation retain ordinary input behaviour. Resume deliberately restores exercise focus.
- Non-colour character cues follow section 8; key/path states have text/icons. Hover information also appears on focus/click.
- Real labels/headings/units/action names. Do not announce every glyph/live WPM assertively; announce important transitions/errors without flooding assistive technology.
- Review zoom/reflow, large text, reduced motion/pressure and forced-colour behaviour. No clipped critical controls.
- Check Light/Dark, English/Arabic, LTR/RTL and desktop/mobile together. Translation and preference failures preserve useful content, field values, privacy-safe messages and the active session.
- Honest loading/empty states: preparing, saving, first use, no history/review/certificates/filter matches; offer useful next actions.
- Error recovery respects mode rules. Permission/session-expiry messages do not reveal another student's data.
- Rate limits use server retry guidance; no invented cooldowns. Reset/resend acknowledgements do not expose email existence.
- Always say **Unproctored TypeFlow performance certificate**. Explain public fields/display-name consent before issuance; no claim of verified identity/human input.
- Keep service details out of learning flows. Valid curated/drill fallback is a normal exercise, with relevant content guidance.

Copy is brief, direct and encouraging: “Continue practice”, “Review these keys”, “More evidence needed”, “Your next practice focuses on…”. Use sentence case; explain adaptation from evidence rather than an unspecified AI coach.

## 11. Instructions for the Figma agent

This is a prototype brief, not permission to implement code/change the SRS. Use applicable Figma skills/tools when creating the file. This documentation task creates no Figma file.

### 11.1 File organisation

1. `00 Brief & sources` — status, sources, scope, limits, open decisions.
2. `01 Foundations` — Light/Dark variables, English/Arabic typography, desktop/mobile grids, radius/effects/focus.
3. `02 Components` — sets, variants and interaction documentation.
4. `03 Student core` — dashboard, path/map, practice/review, typing/results.
5. `04 Accounts & public` — landing/auth, placement entry, verification.
6. `05 Progress & community` — history, achievements, certificates, forum/preferences.
7. `06 Administration` — analytics/management workflows.
8. `07 Responsive & accessibility` — full desktop/phone inventory, RTL/LTR matrix, minimum typing desktop, device guidance and accessibility variants.
9. `08 Prototypes & review` — journeys and unresolved questions.

### 11.2 Construction rules

- Create colour primitives then semantic aliases with **Light** and **Dark** modes. System resolves to one of these. Keep locale/direction and viewport separate from colour modes; use locale strings, mirrored layout variants and desktop/mobile component properties. Separate number collections for spacing/layout/radius/motion; reusable text/effect styles.
- Use auto-layout, constraints and component instances. Purpose-based names: `Recommendation/Reason`, `Typing/Passage`, `Metric/Raw accuracy`.
- Compose dashboard, typing and official result first; reuse their shell/metrics/feedback across modes.
- Preparing/submitting/retryable are UI states, not invented backend enums.
- Label sample identities/counts/rewards. Keep curriculum/reward/certificate TBDs in annotations/policy-pending variants; no permanent invented defaults.
- Example beginner passage: `asdf asdf asdf`, only where `a/s/d/f` and spaces are explicitly allowed. Not final curriculum or sufficient test text. No locked punctuation/digits/uppercase for decoration.
- Annotate missing data as **Contract to agree**, especially key evidence, reward events, prerequisite detail and certificate DTOs; do not invent endpoints.
- Include focus/disabled/loading/empty/error variants, tab order, focus-return and responsive notes.
- Deliver each inventory screen/group in the desktop/mobile × Light/Dark × English/Arabic matrix from section 5.2 using instances; phone typing gets device guidance. Include Appearance & language controls, System-selected state, RTL mixed-text examples, save failure/retry and unchanged-English-passage comparisons.
- Use original TypeFlow illustrations/icons; no competitor brand downloads needed.

### 11.3 Required clickable journeys

| Journey | Frames |
| --- | --- |
| New student | Landing → register → verification-needed/success → login → placement/skip → dashboard |
| Adaptive loop | Recommendation → ready → active → submitting → official result → updated path/next activity |
| Review | Due-review card → review → result → evidence update, later groups still unlocked |
| Retry recovery | Submit → network uncertainty → identical retry → existing result, no repeated rewards |
| Tests | Timed setup → active → expiry/result; certified rules/consent → countdown → ready/active → result → certificate/PDF |
| Verification | Code/link → valid/revoked/unavailable, privacy-safe |
| Forum | List → thread/reply → owner accepts answer; report → moderation |
| Admin content/settings | Edit → validation failure/success → activation/new version → audited outcome |
| Deletion | Preferences → effects → confirm → signed-out completion/downstream placeholders |
| Appearance | Header/profile selector → Light/Dark/System → saved preference → navigation/reload; failure/retry state |
| Interface language | English → العربية → RTL shell with unchanged English content → saved preference → mobile/desktop navigation |

Required review frames: first use, locked prerequisites, insufficient evidence, no review due, large text, reduced pressure/motion, narrow desktop guidance, missing metrics, rate limit, permission denied, retry, invalid token, PDF failure and no-history charts. Simulated prototypes do not verify scoring, email, persistence or accessibility.

## 12. Review gates and unresolved decisions

Concrete enough for Figma exploration; team approval and implementation evidence remain separate.

- [x] Reference declarations extracted with source links.
- [x] Proposed tokens, components, layouts and full screen inventory specified.
- [x] Selected Light/Dark opaque colour-pair contrast calculations completed.
- [x] Required appearance, English/Arabic interface and desktop/mobile behaviour documented with a scope decision.
- [ ] Design owner/reviewer and Figma link assigned.
- [ ] Anchor screens reviewed by team.
- [ ] Branding, Latin/Arabic font licences/assets, Arabic translation and typing glyph legibility reviewed.
- [ ] Curriculum/targets, reward policies and certificate rules approved in owning documents.
- [ ] Missing DTOs and public forum-reading policy agreed.
- [ ] Desktop/mobile × Light/Dark × English/Arabic responsive, keyboard, screen-reader and rendered contrast checks completed.
- [ ] Final visual approval/date recorded.

Begin anchor-screen exploration with labeled sample data/configurable UI. Do not treat policy TBDs as agreed behaviour. Update the SRS/decision records if a later team choice changes requirements.
