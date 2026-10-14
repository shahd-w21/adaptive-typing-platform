# TypeFlow — visual system and Figma design brief

**Status: PROPOSED / READY FOR FIGMA EXPLORATION, NOT TEAM-APPROVED OR IMPLEMENTED.**

Version 0.1 · 14 October 2026 · Design owner/reviewer: TBD · Figma file: not created.

Purpose: give a Figma agent concrete visual tokens, components, screen layouts and interaction rules for an adaptive typing learning website. The project owner's reference direction is edclub for fonts, colours, style and theme, and Duolingo for learning-path and game-design ideas. This document translates those references into TypeFlow without changing product scope or approving unresolved learning policies.

## 1. Read this before designing

The [SRS](docs/srs.md) owns behaviour. Use [architecture](docs/architecture.md) for feature boundaries, [API contract](docs/api-contract.md) for draft data shapes, [content guide](docs/content-guide.md) for exercise constraints, and [auth](docs/auth.md)/[security](docs/security.md) for access and privacy. These describe the target product. **Ignore the current application code and do not derive screens from it.**

- TypeFlow teaches English touch typing on a physical desktop QWERTY keyboard. Typing targets viewports at least 1024 CSS pixels wide; other pages adapt to narrow screens.
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

Light is the baseline theme. Navy landing sections are inverse surfaces, not a dark-mode toggle. A full dark theme needs separate token/contrast work; do not add that setting to baseline mockups.

## 3. Proposed TypeFlow colour system

Create Figma colour variables with these exact names. Semantic variables may alias primitives. All values are **proposed**, including reused edclub values. Additional tints and dark status colours support readable UI.

| Semantic variable | Hex | Role |
| --- | --- | --- |
| `color/bg/page` | `#F5F3F0` | Canvas |
| `color/bg/surface` | `#FFFFFF` | Cards, inputs, typing stage, dialogs |
| `color/bg/subtle` | `#F7F7F9` | Muted sections/table headings |
| `color/bg/inverse` | `#242E3E` | Selected landing sections |
| `color/text/primary` | `#122947` | Headings, body, upcoming exercise characters |
| `color/text/secondary` | `#556576` | Supporting copy/metadata |
| `color/text/inverse` | `#FFFFFF` | Text on navy/purple |
| `color/border/subtle` | `#E5E7EB` | Decorative separators/card edges |
| `color/border/control` | `#7C8796` | Outlines identifying interactive controls |
| `color/action/primary` | `#2B3749` | Main CTA |
| `color/action/hover` | `#354B63` | Hovered CTA |
| `color/action/pressed` | `#435F7D` | Pressed CTA |
| `color/action/link` | `#0666DF` | Links; underline in prose |
| `color/focus/ring` | `#0666DF` | Focus/current-character caret |
| `color/learning/accent` | `#8449EB` | Current node/selected learning tab |
| `color/learning/strong` | `#6D36C4` | Accent hover/review text |
| `color/learning/soft` | `#F1E9FC` | Selected navigation/review-chip background |
| `color/success/accent` | `#25CBA9` | Progress decoration/illustration |
| `color/success/text` | `#186B56` | Positive text/correct characters |
| `color/success/soft` | `#E8F8F1` | Success/mastered-key backgrounds |
| `color/warning/accent` | `#CD964D` | Attention icon |
| `color/warning/text` | `#8A4B08` | Warning text |
| `color/warning/soft` | `#FFF1DE` | Attention background |
| `color/error/text` | `#B42318` | Errors/incorrect characters/destructive action |
| `color/error/soft` | `#FFF0EE` | Error panels/incorrect cells |
| `color/reward/accent` | `#E0E04C` | Reward decoration |
| `color/reward/text` | `#684500` | XP/badge labels |
| `color/reward/soft` | `#FFF7CC` | Earned-reward background |
| `color/streak/text` | `#9A4D00` | Streak icon/label on white |
| `color/disabled/bg` | `#E5E7EB` | Disabled fill |
| `color/disabled/text` | `#556576` | Disabled label; also explain unavailability |
| `color/overlay` | `#171C26` at 48% | Modal scrim |

Do not use bright teal, citrus or gold as small text on white. Keep instructional text at full opacity. Decorative borders cannot be the only cue identifying an interactive control. The source's lighter blue link is replaced with its darker blue for TypeFlow links.

### 3.1 Contrast evidence and target

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

Check all actual text/icon/chart/focus pairings in Figma; these calculations do not verify rendering, transparency or unlisted combinations. On inverse surfaces use a white focus ring with a navy separation gap.

## 4. Proposed typography

Retain edclub's Open Sans/Lato pairing. Add **IBM Plex Mono** for aligned exercise text and keyboard legends; this is a TypeFlow proposal, not an extracted edclub font. Obtain fonts from their own distributions and review licences when preparing assets; do not copy font binaries from competitor sites.

| Role | Family and weights | Fallback |
| --- | --- | --- |
| Display/headings | Open Sans 700/800 | Arial, sans-serif |
| Body/navigation/forms | Lato 400/700 | Arial, sans-serif |
| Exercise/key legends | IBM Plex Mono 400/500 | Consolas, Courier New, monospace |
| Metrics | Lato 700, tabular numerals | Arial, sans-serif |

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
| Student | Left navigation, header, primary content, optional goal/review rail | At 1280px and above use content + rail. At 1024–1279px move rail below. Below 1024px use drawer + one column for non-typing pages. |
| Study | Exit/mode/preferences top bar, progress, passage, keyboard guide | Centred 960px maximum; no dashboard rail. Below 1024px show desktop/physical-keyboard guidance and return action, not mobile typing. |
| Admin | Role-labeled navigation, header, tables/editors | Drawer navigation, wrapped filters, labeled contained table scrolling where necessary |

Student navigation: **Dashboard, Learning path, Practice, Review, Tests, Progress, Achievements, Certificates, Forum**. Profile/settings and logout are in the account menu. Review may show a real due count. Progress contains history; achievements contains XP/level, goals, streak and badges.

Admin navigation: **Overview, Users, Content, Learning settings, Moderation, Certificates, Audit**. Content includes Word lists, Blocked words, Themes and Key groups. Admin tools use their own shell; a role label does not grant access to private student records.

Narrow-screen menus have a labeled keyboard-accessible trigger. Charts resize and offer data alternatives; metric cards stack. Device guidance must not discard an already-active attempt: resizing/focus changes preserve the current mode's timing semantics.

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
| `Effect/NodeLip` | 0 4px 0, `#6D36C4` | Current path node |

Normal dashboard/admin surfaces use flat borders. Raised lips are reserved for main learning actions/path nodes. Standard action height 48px, compact 40px where needed; icon-only hit areas at least 44 × 44px. Focus ring 3px with 2px separation; no clipping by cards or sticky headers.

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
| Available | White node, navy outline, activity icon | Start eligible activity |
| Recommended next | Purple 72px node, 4px bottom lip, adjacent label | Primary Start plus engine reason |
| In progress | Blue outline, dot/progress cue, text | Evidence still developing |
| Mastered | Success-soft node, dark teal check, label | Confirmed server evidence |
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

Build components before screens. Bind semantic variables/text styles; states are variants, not detached copies. Keep components compatible with the planned Tailwind/shadcn/ui stack without prescribing new dependencies.

| Component / properties | Requirements |
| --- | --- |
| `Action/Button` — primary/secondary/ghost/destructive; regular/compact; default/hover/pressed/focus/disabled/loading | Navy primary; outlined white secondary; persistent loading label |
| `Form/Field` — text/email/password/select; default/focus/error/disabled/loading | Visible label/helper/error; no placeholder-only labels; labeled password toggle |
| `Form/Preference` — checkbox/switch/radio | Selected mark/label, keyboard interaction, save success/failure |
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

1. **Top bar:** Exit, mode, Large text and Reduced pressure. Explain abandonment before active exit/restart.
2. **Activity header:** Title, focus chips and reason. Intentional restricted-alphabet exercises are labeled “Key drill” with a brief explanation.
3. **Progress:** Passage progress for untimed modes; selected duration/time remaining for tests unless visually hidden. Hidden timing still runs.
4. **Typing surface:** White card, 32–48px padding, exact passage/current position. Keep active line visible without jarring scrolling.
5. **Live metrics:** “Live · provisional”, gross WPM and raw accuracy. Reduced pressure hides live speed/timer emphasis while retaining progress/instructions.
6. **QWERTY guide:** Next expected key; Shift hints only for permitted assignments. Informational guide, not a touch keyboard.
7. **Controls/help:** Pause/Resume only where allowed; Restart and keyboard guidance. Shortcuts cannot collide with exercise letters or captured controls.

### 8.2 Character and key feedback

| State | Non-colour cue | Colour |
| --- | --- | --- |
| Upcoming | Plain glyph, no completion underline | Primary navy on white |
| Current | Caret/outline/current-position cue | Blue caret, primary glyph |
| Correct | Thin solid completion underline | Dark teal; optional success tint |
| Incorrect | Thick/double underline, tinted cell, persistent error summary | Dark red on error-soft |
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
| Profile/preferences / profile | Name/timezone/target/goal/accessibility/deletion | SYS-9, SYS-48; future-session target, separate public-name consent |
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

**Typing, 1440 × 1024 and 1024 × 768:** 960px centred study shell; compact header, activity/reason, progress, white passage, provisional metrics, guide and controls. Fit active passage/essential controls at minimum desktop; secondary help may scroll. Include large-text, reduced-pressure, paused, timed and save-retry variants.

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
2. `01 Foundations` — variables, typography, spacing/grids, radius/effects/focus.
3. `02 Components` — sets, variants and interaction documentation.
4. `03 Student core` — dashboard, path/map, practice/review, typing/results.
5. `04 Accounts & public` — landing/auth, placement entry, verification.
6. `05 Progress & community` — history, achievements, certificates, forum/preferences.
7. `06 Administration` — analytics/management workflows.
8. `07 Responsive & accessibility` — minimum desktop, narrow non-typing, accessibility variants.
9. `08 Prototypes & review` — journeys and unresolved questions.

### 11.2 Construction rules

- Create colour primitives then semantic aliases, one Light mode. Separate number collections for spacing/layout/radius/motion; reusable text/effect styles.
- Use auto-layout, constraints and component instances. Purpose-based names: `Recommendation/Reason`, `Typing/Passage`, `Metric/Raw accuracy`.
- Compose dashboard, typing and official result first; reuse their shell/metrics/feedback across modes.
- Preparing/submitting/retryable are UI states, not invented backend enums.
- Label sample identities/counts/rewards. Keep curriculum/reward/certificate TBDs in annotations/policy-pending variants; no permanent invented defaults.
- Example beginner passage: `asdf asdf asdf`, only where `a/s/d/f` and spaces are explicitly allowed. Not final curriculum or sufficient test text. No locked punctuation/digits/uppercase for decoration.
- Annotate missing data as **Contract to agree**, especially key evidence, reward events, prerequisite detail and certificate DTOs; do not invent endpoints.
- Include focus/disabled/loading/empty/error variants, tab order, focus-return and responsive notes.
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

Required review frames: first use, locked prerequisites, insufficient evidence, no review due, large text, reduced pressure/motion, narrow desktop guidance, missing metrics, rate limit, permission denied, retry, invalid token, PDF failure and no-history charts. Simulated prototypes do not verify scoring, email, persistence or accessibility.

## 12. Review gates and unresolved decisions

Concrete enough for Figma exploration; team approval and implementation evidence remain separate.

- [x] Reference declarations extracted with source links.
- [x] Proposed tokens, components, layouts and full screen inventory specified.
- [x] Selected opaque colour-pair contrast calculations completed.
- [ ] Design owner/reviewer and Figma link assigned.
- [ ] Anchor screens reviewed by team.
- [ ] Branding, font licences/assets and typing glyph legibility reviewed.
- [ ] Curriculum/targets, reward policies and certificate rules approved in owning documents.
- [ ] Missing DTOs and public forum-reading policy agreed.
- [ ] Responsive/keyboard/screen-reader/rendered contrast checks completed.
- [ ] Final visual approval/date recorded.

Begin anchor-screen exploration with labeled sample data/configurable UI. Do not treat policy TBDs as agreed behaviour. Update the SRS/decision records if a later team choice changes requirements.
