# TypeFlow — Figma implementation reference

Version 1.0 · 9 November 2026. Implement the visual design from [TypeFlow — Main Screens](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj). The file contains `00 Foundations` and `01 Main screens`. Ten screen frames and 45 prototype links were checked for this handoff. The recorded views are Light/English. Dark variables exist; Arabic, dark-mode renderings, intermediate breakpoints and browser accessibility still need implementation review.

## 1. Read this before designing

The [SRS](docs/srs.md) owns behaviour. Use [architecture](docs/architecture.md) for feature boundaries, [API contract](docs/api-contract.md) for draft data shapes, [content guide](docs/content-guide.md) for exercise constraints, and [auth](docs/security.md#authentication-and-authorisation)/[security](docs/security.md) for access and privacy. These describe the target product. **Use requirements to define behaviour and reuse existing teammate screens/components during implementation. This documentation revision does not authorize code or Figma changes.**

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

### 1.1 How to implement a screen

Start with the matching frame in section 9. Inspect its nested layout, text styles, artwork, scroll regions and interactions at reference width. Map its component instances to shared React UI. Use semantic tokens for both appearance modes. Render and compare first at the frame dimensions, then check reflow, keyboard use and Arabic. Review static previews as examples; real actions use owned destinations, eligible activities and saved data.

The Figma file governs visual composition. This document records its essential implementation details and responsive requirements. The SRS governs learning, permissions and session behaviour; API and architecture docs govern data and integration. Existing frontend styles and historical screenshots describe implementation progress, not the visual target.

## 2. Visual identity

Warm paper and navy carry the composition. Cobalt identifies primary actions, current keys and the active lesson. Tangerine picks out finger guides, glider folds, annotation lines and selected margin marks. Treat the quiet/loud balance as a hierarchy, not a literal measured area. Use dedicated status colors, labels, icons and underlines for feedback. Tangerine alone must never communicate a typing error, warning, or eligibility.

The visual story follows one keystroke from fingertip to saved evidence and an explained next drill. Original illustrations draw from fingertip arcs, keycap bevels and ridges, engraved legends, folded maps, and paper gliders. Use fine outlines and restrained grain on large illustrated surfaces. Keep texture off forms, tables, charts and the passage. Take editable art from the corresponding frame; do not flatten a screen or source competitor assets.

Public pages use large illustrations, curved section boundaries and editorial display type. Working screens reuse these details selectively: navy recommendation panels with one cobalt action, small role-specific icons, ink chart lines, and evidence annotations. The active exercise prioritizes stable character positions.

## 3. TypeFlow colour system

Map these 34 semantic variables from the Figma collection to the application theme. Values are resolved sRGB hex. Illustrations can have local surface and edge shades. Use white text on cobalt in both modes; keep charts ink-colored and match inverse panels with inverse text.

| Figma variable | Light | Dark | Role |
| --- | --- | --- | --- |
| `color/bg/page` | `#F5F3F0` | `#171C26` | Canvas |
| `color/bg/surface` | `#FBFAF8` | `#242E3E` | Cards, inputs, passage, dialogs |
| `color/bg/subtle` | `#EAE8E4` | `#2B3749` | Muted sections/table headings |
| `color/bg/inverse` | `#242E3E` | `#101722` | Selected marketing sections |
| `color/text/primary` | `#242E3E` | `#F7F7F9` | Main text/upcoming characters |
| `color/text/secondary` | `#515B68` | `#B3B9C1` | Supporting copy/metadata |
| `color/text/inverse` | `#F5F3F0` | `#F7F7F9` | Text on inverse sections |
| `color/border/subtle` | `#D4D3D0` | `#42576E` | Decorative edges only |
| `color/border/control` | `#78808B` | `#8997AA` | Identifying control outlines |
| `color/action/primary` | `#145EFF` | `#145EFF` | Main CTA fill |
| `color/action/hover` | `#0E52EB` | `#0E52EB` | Hovered CTA fill |
| `color/action/pressed` | `#1344C6` | `#1344C6` | Pressed CTA fill |
| `color/action/foreground` | `#FFFFFF` | `#FFFFFF` | Text/icons on all primary CTA states |
| `color/action/link` | `#344459` | `#93C5FD` | Underlined prose links |
| `color/focus/ring` | `#2858C1` | `#9CB9FF` | Focus/current-character caret |
| `color/learning/accent` | `#145EFF` | `#145EFF` | Current node/learning accent |
| `color/learning/foreground` | `#FFFFFF` | `#FFFFFF` | Text/icons on solid accent nodes |
| `color/learning/strong` | `#2D4154` | `#BFDBFE` | Emphasized learning text, chart lines |
| `color/learning/soft` | `#EBEEE9` | `#1E3551` | Selection/review-chip background |
| `color/learning/lip` | `#163EA9` | `#163EA9` | Decorative dimensional key edge |
| `color/success/accent` | `#28AF42` | `#86EFAC` | Progress decoration |
| `color/success/text` | `#166534` | `#A7F3D0` | Success/correct characters |
| `color/success/soft` | `#E8F7EC` | `#17352A` | Success/mastered backgrounds |
| `color/warning/accent` | `#D97706` | `#FBBF24` | Attention icon |
| `color/warning/text` | `#854D0E` | `#FDE68A` | Warning text |
| `color/warning/soft` | `#FFF4DB` | `#3A2E16` | Attention background |
| `color/error/text` | `#B42335` | `#FDA4AF` | Errors/incorrect characters/destructive text |
| `color/error/soft` | `#FFF0F2` | `#3D202C` | Error panels/cells |
| `color/reward/accent` | `#8A7355` | `#FACC15` | Reward decoration |
| `color/reward/text` | `#554C40` | `#FDE68A` | XP/badge labels |
| `color/reward/soft` | `#EFEBE4` | `#352D18` | Earned-reward background |
| `color/disabled/bg` | `#E5E7EB` | `#354154` | Disabled fill |
| `color/disabled/text` | `#556576` | `#B3B9C1` | Disabled label/explanation |
| `color/illustration/tangerine` | `#FF8D43` | `#FF8D43` | Illustration details, guides and annotations |

### 3.1 Appearance control and persistence

- Show a labeled **Appearance** menu in public/student/admin headers and in mobile navigation; repeat it under Profile → Appearance & language. Options: **Light**, **Dark**, **System**. The stored default is System; resolve it to Light/Dark from the device preference, with Light fallback if unavailable. Figma has only the two rendered modes; System is a selection state, not a third palette.
- Use sun/moon/device icons plus text and a selected check; never rely on an unlabeled icon or ambiguous toggle. Keyboard and screen-reader users can identify the current choice.
- Resolve initial appearance before the main screen renders to avoid a light flash on dark pages. System follows device changes only while selected; explicit Light/Dark overrides it.
- Signed-in users save the preference on their own account; saved account preferences win at sign-in. Visitors remember only allowlisted appearance/locale values locally. See SRS section 10.5 and the draft preference contract; do not add a theme environment variable.
- Saving shows pending/success/failure. Failure restores the last confirmed value and offers Retry. Theme changes recolour the existing view without remounting the recorder, navigating or resetting an assignment. Opening a preference control still follows mode focus/pause rules.
- Apply tokens to all pages, portal dialogs, menus, charts, keyboard states and illustrations. Dark cards use borders and layered fills rather than bright shadows. Keep original assets legible in both modes; do not invert images globally.

### 3.2 Contrast evidence and target

Target: at least 4.5:1 for normal text and 3:1 for large text and essential non-text indicators. This is not a claim of rendered accessibility conformance.

Earlier palette audits cover historical CSS. For the current tokens, white on cobalt is 5.15:1, warm paper on navy is 12.35:1, and tangerine on warm paper has insufficient contrast for small text. Use an appropriate text token or darker annotation stroke on paper. Check rendered hover, pressed, focus, disabled, error, and chart states in both themes, including dark sections inside Light mode. Separate focus rings from selected fills with a contrasting gap.

## 4. Typography

Use Source Serif 4 Regular for selected English editorial headings and the captions in the left account illustrations. The landing hero is 99px with approximately 1.04 line height and −3% tracking at 1440px. The adaptive example heading is 58px, the curved course statement 63px, the closing invitation 60px and the account captions 46px. Scale display type for available width; preserve the centered hero and left-aligned evidence headings. Use Open Sans for app headings, controls, body and metrics, IBM Plex Mono for English passages, key legends and drill previews, and Noto Sans Arabic for Arabic UI. Keep Latin display styling scoped to its actual placements. Provide readable serif, sans-serif and monospace fallbacks.

| Figma text style | Size / line height | Weight | Usage |
| --- | --- | --- | --- |
| `Display/Large` | 48 / 60px desktop; 32 / 42px narrow | Open Sans 800 | App display style; landing uses the editorial override above |
| `Heading/Page` | 32 / 44px | Open Sans 700 | Page title |
| `Heading/Section` | 24 / 34px | Open Sans 700 | Major section |
| `Heading/Card` | 20 / 30px | Open Sans 700 | Card title |
| `Body/Large` | 18 / 28px | Open Sans 400 | Intro copy |
| `Body/Default` | 16 / 26px | Open Sans 400 | Main copy/forms |
| `Body/Strong` | 16 / 26px | Open Sans 700 | Emphasis/navigation |
| `Label/Default` | 14 / 22px | Open Sans 700 | Labels/chips |
| `Caption/Default` | 14 / 22px | Open Sans 400 | Metadata |
| `Action/Default` | 16 / 24px | Open Sans 700 | Sentence-case buttons |
| `Metric/Large` | 32 / 40px | Open Sans 700 | Result numbers |
| `Typing/Default` | 28 / 48px | IBM Plex Mono 400 | Passage |
| `Typing/Large` | 36 / 60px | IBM Plex Mono 400 | Large-text preference |
| `Keyboard/Legend` | 16 / 24px | IBM Plex Mono 500 | Key labels |

Use zero tracking by default for interface text and logical-start alignment; never justify. Body lines should usually stay within 60–75 characters. Preserve exercise spaces, disable ligatures and keep glyph advances stable. Visual wrapping must not alter the assigned passage. Represent space errors with a visible marker and accessible description. Large text also enlarges surrounding instructions without clipping. Check `i/l/1`, `O/0`, punctuation and space markers before approving the typing font.

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

Spacing variables use their pixel values as names: `space/4` is 4px, `space/16` is 16px, through `space/96`. Card padding 24px, section gap 32px, form gap 20px, icon-label gap 8px.

| Token / frame | Implementation reference |
| --- | --- |
| `layout/public/header` / `layout/app/header` | 72px minimum; can grow for wrapped content |
| `layout/app/sidebar` | 224px wide |
| `layout/content/max` | 1200px |
| `layout/rail/width` | 280px |
| `layout/study/max` | 960px |
| `layout/auth/max` | 440px field width |
| `layout/gutter/desktop` | 32px |
| `layout/gutter/compact` | 24px |
| `layout/gutter/narrow` | 16px |
| `layout/grid/gap` | 24px |
| Main Figma desktop | 1440 × 1024; 12-column content grid |
| Minimum typing frame | 1024 × 768 |
| Non-typing tablet | 768 × 1024 |
| Non-typing phone | 390 × 844; also check reflow at 320px |

Frame heights are viewport sizes, not fixed page heights. Use auto-layout and scrolling; do not crop history, forms or long forum text.

#### High-value measurements from the desktop frames

- The hero headline sits in a 1200px-wide centered text box. The main action row is centered. The exercise strip is 1024 × 164px and fits within the navy hero. Keep the fine divider, left device label, prominent passage, tangerine caret and raised F cue.
- The dashboard showcase has a clipped 1048 × 650px preview of the student workspace. The adaptive example has a 710 × 422px light exercise sheet on navy. Preserve the marked character and angled annotation at normal reading size.
- Desktop account layouts allocate 720 × 1024px to each half. The navigation header belongs entirely to the right half. Student/admin chrome uses a 224px sidebar and 72px workspace header. On mobile the 64px header precedes a scrollable 358px content column.
- Use the token defaults below for new surfaces, and the actual frame for local overrides. Paper exercise sheets have fine outlines and straighter edges than standard cards. The large teaching illustrations are static editable compositions.

#### Layout budgets and density

`layout/content/max` caps the content inside its shell; it is not a width added beside the sidebar. Subtract navigation, gutters and any rail before sizing the main column. At larger widths centre the capped content within the remaining workspace. The following budgets are for the English desktop student shell; Arabic mirrors placement with the same widths.

| Viewport | Navigation | Content after gutters | Main / gap / rail |
| --- | --- | --- | --- |
| 1440px | 224px | 1152px after two 32px gutters | 848px / 24px / 280px |
| 1280px | 224px | 992px after two 32px gutters | 688px / 24px / 280px |
| 1024px | 224px | 752px after two 24px gutters | 752px main; rail moves below |
| 390px | Drawer | 358px after two 16px gutters | One column; rail content follows recommendation |

These are composition checks, not new fixed-width tokens. If long Arabic labels or larger text make the main column unusable, move the rail below sooner. Never squeeze fields or introduce horizontal page scrolling to preserve a two-column mockup. The study shell has no sidebar: its maximum is 960px within the viewport minus its gutters.

Use open sections for page structure; a card groups one task or related evidence. Learning cards use 24px internal padding on desktop and 16px on phones. Admin records may use 12–16px internal spacing while retaining readable text and 44px action hit areas. Public sections use 64–96px vertical separation on desktop and 40–48px on phones. Do not enlarge every dashboard gap to the landing-page rhythm or shrink font sizes to fit more records.

### 5.2 Shells and responsive behaviour

| Shell | Composition | Responsive behaviour |
| --- | --- | --- |
| Public | Wordmark, Log in/Get started, centred content, footer with verification link | Stack sections; keep account actions accessible |
| Student | Inline-start navigation (left in English/right in Arabic), header, primary content, optional goal/review rail | At 1280px and above use content + rail. At 1024–1279px move rail below. Below 1024px use drawer + one column for non-typing pages. |
| Study | Exit/mode/preferences top bar, progress, passage, keyboard guide | Centred 960px maximum; no dashboard rail. Below 1024px show desktop/physical-keyboard guidance and return action, not mobile typing. |
| Admin | Role-labeled navigation, header, tables/editors | Drawer navigation, wrapped filters, labeled contained table scrolling where necessary |

Student navigation: **Dashboard, Courses, Learning path, Practice, Review, Tests, Progress, Achievements, Certificates, Forum**. Courses groups the library and My courses; a selected course opens its own path. The general learning/keyboard view remains distinct from course completion. Profile/settings and logout are in the account menu. Review may show a real due count. Progress contains history; achievements contains XP/level, goals, streak and badges.

Admin navigation: **Overview, Users, Courses, Content, Learning settings, Moderation, Certificates, Audit**. Courses contains draft authoring, version preview, validation, publication and archival. Content includes Word lists, Blocked words, Themes and Key groups. Admin tools use their own shell; a role label does not grant access to private student records.

Narrow-screen menus have a labeled keyboard-accessible trigger. Charts resize and offer data alternatives; metric cards stack. Device guidance must not discard an already-active attempt: resizing/focus changes preserve the current mode's timing semantics.

#### Desktop layout

- Primary frame 1440 × 1024; also check 1280px and minimum typing viewport 1024 × 768. Use 12 content columns with 24px gaps and 32px gutters at wide desktop; compact desktop uses 24px gutters. Side navigation stays 224px and the optional rail 280px where space permits.
- Dashboard: recommendation/path/history in the main column, goals/review in the rail. Path and progress may use side-by-side map/detail views. Result metrics form one row of four when space permits.
- Forms remain readable rather than stretching across all columns; the desktop account form is 496px wide with 440px fields. Admin tables use full available width with filters above and visible row actions.
- Study stays centred with a 960px maximum, passage-first hierarchy and complete physical-QWERTY guide. Secondary help can scroll at short heights, but the active line and essential controls must stay reachable.
- Both themes preserve identical geometry. Arabic mirrors shell placement/reading order while retaining LTR exercise, keyboard, codes and chart chronology.

#### Mobile-phone layout

- Primary frame 390 × 844; validate at 320, 360 and 430 CSS pixels. Use four columns, 16px gutters, 16px card padding, 16px gaps and a 64px minimum header that can grow for text. Cards/forms become one column with no fixed viewport-height clipping.
- Header: compact TypeFlow wordmark, labeled menu trigger and account action. The drawer contains the full navigation, Appearance and Language choices, account/settings and logout. Mark the current page; opening/closing handles focus. RTL drawer opens from the right; LTR from the left. Avoid a crowded bottom bar with nine destinations.
- Landing stacks copy/illustration/CTA; account fields and main actions fill available width. Dashboard places the practice journal immediately after the recommendation, followed by daily goal/review and streak. A practice CTA opens device guidance; account, progress and forum remain usable.
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
| `radius/pill` | 999px | Pills and chips; standard primary buttons use the control radius |
| `border/default` | 1px | Decorative edges |
| `border/control` | 2px | Fields/interactive cards/keycaps |
| `Effect/Card` | 0 2px 8px, `#122947` at 6% | Selective card elevation |
| `Effect/Popover` | 0 8px 24px, `#122947` at 12% | Popovers/dialogs |
| `Effect/PrimaryLip` | 0 3px 0, `color/learning/lip` | Optional main learning CTA depth, bound to theme |
| `Effect/NodeLip` | 0 4px 0, `color/learning/lip` | Current path node in either mode |

Normal dashboard/admin surfaces use flat borders; use open sections and dividers for history and reporting rather than wrapping everything in a card. Raised lips are reserved for main learning actions/path nodes. Standard action height is 48px; compact controls retain at least a 44 × 44 CSS-pixel hit area, even when the visual is smaller. Keep adjacent touch targets at least 8px apart where practical. These are TypeFlow usability targets, not a claim about the minimum size of every accessibility standard. Focus ring 3px with 2px separation; no clipping by cards or sticky headers.

The listed card/popover shadow colours describe Light mode. In Dark mode use minimal black shadow plus the semantic border/surface layers; retain the node lip's mode binding. Certificate PDFs keep their independent print-friendly styling; changing website appearance does not regenerate or invert them.

### 5.4 Motion

Foundation implementation, 23 October 2026: shared timings/easing, immediate keyboard and typing feedback, static information surfaces and runtime reduced-motion handling are applied. Existing menus/dialogs remain immediate with their native focus behaviour. The optional overlay/milestone effects below are recipes for later feature work, not claims that every effect is implemented. Verification is recorded in [testing](docs/testing.md#typography-and-shared-foundations--23-october-2026).

Motion must explain an action or state change. Decide frequency and purpose before choosing an effect. Repeated typing, keyboard navigation, shortcut-triggered actions and live metric updates are immediate. Normal focus/selected/pressed feedback must still be visible.

| Token | Value | Purpose |
| --- | --- | --- |
| `motion/fast` | 120ms | Subtle pointer feedback and optional opacity-only reduced-motion feedback |
| `motion/standard` | 180ms | Occasional small overlays and inline acknowledgements |
| `motion/panel` | 240ms | Drawer/dialog transitions and one confirmed milestone acknowledgement |
| `motion/ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Enter/exit |
| `motion/ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Deliberate movement between on-screen positions |
| `motion/ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawer movement |

These replace the earlier single curve and 600ms reward token. Map them into the existing styling system; do not add a parallel animation stylesheet. Use CSS `ease` for subtle colour transitions. No UI transition above 300ms is needed by this brief.

| Interaction | Purpose and normal behaviour | Reduced motion / keyboard behaviour |
| --- | --- | --- |
| Button | Feedback: colour change at 120ms; a main learning CTA may depress up to 2px on pointer press | No movement; keyboard feedback immediate |
| Menu/popover | Spatial consistency: 180ms opacity and scale from 0.97, origin aligned with its trigger | Immediate for keyboard activation; pointer version instant or opacity-only up to 120ms |
| Dialog/drawer | Spatial consistency: 240ms entrance / 180ms exit, opacity/transform; drawer comes from logical inline-start and exits the same way | Keyboard activation: instant. Reduced motion: no slide/scale, instant or opacity-only up to 120ms; focus available immediately |
| Save acknowledgement | State indication: persistent status text; optional 180ms fade | Instant or short opacity change; never colour alone |
| Official milestone | Feedback: one contained 240ms check/badge acknowledgement after newly confirmed server evidence | Static earned state; no replay on reload, retry or cached results |
| Landing illustration | Explanation: static by default; user may step through a labelled practice example | The same static steps and controls; no auto-typing, looping caret, parallax or scroll choreography |
| Characters, caret, key guide, chart data, metrics | Immediate updates; stable reading/typing geometry | Same immediate state; no digit counters or animated progress interpolation |

**Implementation rules for later work:**

- Prefer CSS transitions. Use WAAPI only when programmatic control is needed; this brief requires no Motion/GSAP dependency. Reuse existing accessible overlay primitives where available; component semantics and focus management come before animation.
- Animate transform/opacity for movement/reveal; colour transitions may provide lightweight feedback. Avoid layout animation, `transition: all`, `scale(0)`, shake, particles, spring bounce and moving glyphs. A necessary accordion height transition needs separate review and an instant fallback.
- A second activation reverses or retargets from the current visual state; no queued entrances or duplicate timers. Closing does not trap focus in an exiting layer, and an invisible overlay cannot intercept input.
- Gate hover-only movement behind `(hover: hover) and (pointer: fine)`. Touch and keyboard users receive equivalent state information without needing hover.
- Honour `prefers-reduced-motion: reduce`, including a preference change while the page is open. Remove translation, scaling, smooth scrolling and decorative movement; short opacity/colour feedback is optional, and instant updates are valid. Essential content remains visible if animation is unavailable.
- Reduced pressure is a separate presentation preference: it reduces live speed/timer emphasis without changing timing or scoring. Neither preference remounts the recorder or changes an assignment.
- Never wait for an entrance, reward or exit animation before capturing input, exposing an action, showing an error or navigating. Focus changes in tests still follow their real timing rules.

#### Motion contract for Figma and later implementation

The interaction table above decides whether motion exists. Use these exact recipes only for the permitted occasional pointer/touch interactions; keyboard-triggered overlays and repeated typing/navigation updates remain instant. The target state and controls are available immediately, even while a visual transition finishes.

| Recipe | Start → end | Timing and origin | Exit / interruption |
| --- | --- | --- | --- |
| Small menu | Opacity 0 → 1; scale 0.97 → 1 | 180ms, `motion/ease-out`; origin at the trigger attachment | Reverse the same path at 180ms; a second activation retargets the current state |
| Centred dialog | Opacity 0 → 1; scale 0.97 → 1 | 240ms, `motion/ease-out`; centre origin | Reverse at 180ms; dismissal and focus return never wait for the visual exit |
| Navigation drawer | Opacity 0 → 1; translate from minus 100% of its own width in LTR, plus 100% in RTL, to 0 | 240ms, `motion/ease-drawer`; no content reflow | Return toward the same logical edge at 180ms; retarget without a queued replay |
| Save acknowledgement | Existing status region changes to confirmed text; optional opacity 0 → 1 | 180ms, `motion/ease-out`; no position change | Text persists until the next relevant state; no duplicate toast on retry |
| Newly earned milestone | One check/badge changes opacity 0 → 1 and scale 0.97 → 1 | 240ms, `motion/ease-out`; centre origin | Remains in its earned state; no loop, confetti or replay for an already-saved event |

In reduced motion, omit translation/scale; use instant states or an opacity-only change up to `motion/fast`. An instant option is always valid. Main learning-button pointer depression is at most 2px over `motion/fast`, with immediate release; it never changes layout or runs on keyboard activation. Ordinary hover uses colour only. No animation runs merely because a dashboard, path, table or chart enters the viewport.

For each Figma prototype connection, annotate trigger, purpose, start/end values, duration, curve, exit, interruption and reduced-motion/keyboard alternative. Keep matching layer names across motion states. Use the prototyping capability available through the selected MCP tools; where it cannot express a curve, interruptibility or runtime preference change, draw the end states and record the exact contract beside them. Do not silently replace it with a default spring or claim Figma proves browser behaviour.

Later implementation should use CSS transitions for these recipes, with WAAPI only where control is required. Prefer transform/opacity for movement and reveals; do not animate blur, shadows, layout dimensions or inherited variables across a whole subtree. Never drive animation through per-frame React state or add permanent `will-change` speculatively. Performance approval needs a browser recording during real loading/navigation on representative hardware; a smooth Figma preview is not evidence of web frame performance.

## 6. Learning-path and game-design translation

Duolingo's [official path explanation](https://blog.duolingo.com/new-duolingo-home-screen-design/) describes guiding learners through new material and review on one path. TypeFlow adopts visible steps and review integration while its adaptive engine and key-group prerequisites determine eligibility.

### 6.1 Path composition

Use the chapter flag, contour lines and dashed winding route from the course frame. Keep DOM and tab order top-to-bottom. Each sculpted lesson casing is about 82 × 72px with sloped sidewalls, bevel and lower lip. The inset face is 58px wide, approximately 38px tall when seated/completed and 43px on the raised current key. Face radius is 5px. Keep labels and state icons adjacent to the key. The compact dashboard preview uses smaller keys. The independent spaced-review key has a return-arrow symbol and its own label.

Sections reflect the configured prerequisite graph; do not invent final group names/order. A visually linear recommended route can coexist with several unlocked groups. Include a readable group-list alternative and QWERTY map. A node opens an eligible activity; it does not promise mastery after a fixed number of clicks.

| Path presentation | Visual treatment | Meaning/action |
| --- | --- | --- |
| Locked | Neutral node, lock, prerequisite text | View why locked; Start unavailable |
| Available | Surface-fill node, control outline, activity icon | Start eligible activity |
| Recommended next | Raised cobalt face, darker beveled base, directional icon and adjacent label | Primary Start plus engine reason |
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

### 6.4 Courses, entry and progress

Course paths reuse the learning components and the single typing experience. See SRS section 9.6 / [decision 0008](docs/decisions.md#0008); do not turn course artwork into a second progression system.

| Moment | Show | Boundary |
| --- | --- | --- |
| Browse | Course title, objective, prerequisite summary and an honest availability state | No invented duration, popularity, price or completion percentage |
| Enroll | Course/version context and the entry recommendation returned by the agreed contract | New enrollment does not reset the shared skill profile |
| First learning entry | Optional broad placement or beginner entry | Never require placement at each login or for every course |
| Later course entry | Explain compatible prior evidence; offer a targeted check when needed | Placement exemption is distinct from learned/mastered/completed work |
| Course path | Units/lessons with locked, available, in-progress, completed or placement-exempt labels | Keep course lesson status separate from key mastery and due-review indicators |
| Resume | Returned enrollment/lesson identity and the actual next action | With no agreed API, show a labelled review fixture; never guess a resume URL |
| Completion | Confirmed course status and the next suitable learning action | Placement alone cannot complete a course; no automatic performance certificate |
| Admin authoring | Draft → preview → validation → publish; successor versions and archive effects | Preview data is labelled; preserve enrolled versions and explain validation errors before publication |

Use a compact, readable vertical path by default; connectors represent actual prerequisites. Decorative zigzags must not obscure lesson order or tab order. Unknown progress says “Not available”; zero completed lessons is shown only when the server confirms it.

## 7. Figma component catalogue

Use the existing Figma components as the starting point for shared implementation. The file contains button variants, navigation states, keycaps, keyboard guide keys, typing characters, fields, metrics and the TypeFlow logo. Some sculpted casings and artwork are editable assemblies around an instance. Reproduce the whole placed composition. The catalogue below also includes implementation requirements beyond the component library. Bind semantic variables/text styles; states are variants, not detached copies. Target the existing React/Vite JavaScript/JSX and Tailwind stack. Reuse current UI components; shadcn/ui or any other component library is not assumed installed or authorized by this brief. Implementation targets JavaScript/JSX in root-level `client/`, shared runtime schemas in `packages/shared/` and backend behaviour in `server/`. The catalogue also covers required states beyond the ten framed views.

| Component / properties | Requirements |
| --- | --- |
| `Action/Button` — primary/secondary/ghost/destructive; regular/compact; default/hover/pressed/focus/disabled/loading | Semantic primary fill/foreground; outlined surface secondary; persistent loading label; both themes |
| `Form/Field` — text/email/password/select; default/focus/error/disabled/loading | Visible label/helper/error; no placeholder-only labels; labeled password toggle |
| `Form/Preference` — checkbox/switch/radio | Selected mark/label, keyboard interaction, save success/failure |
| `Preferences/Appearance` — light/dark/system; default/focus/saving/error | Text/icon/check selection; System resolves to a rendered mode; header and profile variants |
| `Preferences/Language` — en/ar; default/focus/loading/error | Own-language labels, globe, selection mark and English-content helper; LTR/RTL-safe |
| `Nav/Item` — selected/unselected/focus; badge | Learning-soft selection with learning-strong text, current-page semantics and icon/weight cue; real counts |
| `Surface/Card` — default/selected/interactive | 20px radius/24px padding; interactive outline/focus |
| `Feedback/Banner` — info/success/warning/error | Icon/title/explanation/action; colour is supplementary |
| `Feedback/Empty` / `Feedback/Loading` | Useful message/action; matching skeletons, no fake scores |
| `Overlay/Dialog` / `Overlay/Menu` | Heading, intentional focus handling, close/Escape and focus restoration |
| `Learning/PathNode` | Section 6 states; due review independent; detail card |
| `Learning/Recommendation` | Mode, focus chips, reason, one Start action |
| `Course/Card` / `Course/Entry` / `Course/Lesson` | Objective/prerequisites, enrollment/entry states and distinct lesson/exemption status; no invented progress |
| `Admin/CourseEditor` / `Admin/Publication` | Draft/version context, field validation, sample preview, publish/archive confirmation and returned outcome |
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

### 7.1 Component composition and state precedence

Build small, meaningful sets rather than one variant for every theme × language × viewport × data-state combination. Theme belongs to semantic variable modes; direction belongs to shell/layout variants; content uses text properties; optional icons/help use boolean or instance-swap properties. Create only valid component-state combinations and put screen-specific data states in named review frames.

| Component family | Explicit component properties | Composition rule |
| --- | --- | --- |
| Button / field | Kind, size and interaction state; label/help/error text; optional icon | Focus is visible on any enabled state; loading preserves label/width and prevents duplicate activation |
| Navigation | Current/unselected, focus, optional real badge; label/icon | Current page and keyboard focus can coexist; selection never replaces the focus ring |
| Path node / course lesson | Eligibility/progress state, recommended flag, optional due-review marker | Locked explains its prerequisite; due review does not erase mastery; placement exemption never uses the mastered/completed label |
| Typing character / keycap | Character state or key-learning state; independent next-key/error cue | The current position and latest error remain readable without changing glyph advance or physical key position |
| Metric / status | Authority, availability and value/unit text | Unavailable has no fabricated numeric value; official authority is independent of positive/negative performance |
| Dialog / menu / drawer | Open/closed, purpose/content, direction where relevant | Shared focus/close behaviour; long content scrolls inside the overlay and actions remain reachable |

Keep `Surface/Card` neutral: selected, interactive, warning and reward treatments belong to named semantics, not a different shadow/gradient for every feature. Use dividers and rows for history, reports and preferences. A blank card is not an acceptable substitute for a loading, unavailable or empty state.

During implementation, exercise default, focus, failure and relevant long-content examples in both themes. Check at least one Arabic long-label instance and one reduced-motion interaction before propagating the set. Reuse these instances across screen families; avoid detached copies that drift when a token changes.

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

Next keyboard key: ink outline and a named target in the live provisional metrics. F/J guide keys have tactile ridge marks. Mastered: check. Locked: lock/neutral. Weak/review: labeled dot or pattern with legend. Next-key guidance stays dominant; detailed progress heatmaps are separate.

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

### Main screen references

Reference widths, heights and content below come from the current file. The long landing frame is a scrolling composition. Desktop and mobile shell heights describe viewports. Scroll the document or workspace where content extends beyond the viewport.

| Existing Figma frame | Reference px | Implementation details |
| --- | --- | --- |
| [01 Landing](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-2) | 1440 × 5476 | Full-width story following one keystroke from fingertip to next lesson. See section 9.3 for section order and surfaces. |
| [02 Log in](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-3) | 1440 × 1024 | Full-height 50/50 split. Navy illustration fills the left 720px edge to edge. A tangerine glider crosses an engraved keyboard. The serif caption sits on a curved textured navy field. Center the 496px form with 440px fields in the right half. Logo, Appearance and language belong above the form in that half. |
| [03 Register](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-4) | 1440 × 1024 | Same split and header as login. Two outlined hands reach toward cobalt F and J, with tangerine finger guides and individual QWERTY legends. Right panel holds email, password, confirmation and the verification explanation. |
| [04 Dashboard](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-5) | 1440 × 1024 | Lead with a navy next-lesson panel, focus keys, monospaced drill excerpt, reason, glider and cobalt Continue practice. Follow with the path preview and practice journal. Right rail carries goal, streak and review. Current lesson links to the course. Matching journal entry opens its official result. |
| [05 Course learning path](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-6) | 1440 × 1024 | Chapter header and flag, contour lines and a dashed winding path with sculpted keys. The recommendation rail explains eligibility and includes the separate review key. Current lesson opens the shared exercise. See section 6.1. |
| [06 Active typing](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-7) | 1440 × 1024 | Study shell without student sidebar. Follow the caret in the exact passage; progress and provisional metrics stay quiet. F/J guide keys have tactile ridges. Pause, restart and reduced-pressure controls follow the active mode. |
| [07 Official result](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-8) | 1440 × 1024 | Show official metrics together, then the marked passage, letter evidence and confirmed rewards. Connect the underlined missed character to its explanation. The navy next-drill panel names the focus keys, explains what the saved evidence supports, previews the sequence and offers Continue, View progress and Back to dashboard. |
| [08 Progress](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-9) | 1440 × 1024 | Filters precede home-row key history. Connect the selected cobalt F to the evidence directly beneath it. Separate net-speed and raw-accuracy charts use ink lines; the history table gives exact values and a matching result link. |
| [09 Admin overview](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-10) | 1440 × 1024 | Keep admin navigation, reporting period and denominators explicit. Activity chart and recent activity occupy the main column. The attention rail distinguishes course validation, forum reports and PDF retries with separate icons and text. |
| [10 Mobile dashboard](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=4-11) | 390 × 844 | 390 × 844 reference. Use the mobile header and 16px gutters. Show the focus pair, compact drill excerpt, route illustration, course link and desktop-device guidance first. Put the journal directly below, then daily goal/review and streak. Latest matching entry links to the result. Allow vertical scrolling. |

### Product coverage beyond the main frames

These are **screen labels, not agreed browser URLs or new API endpoints**. Use architecture feature folders/draft API groups; complete DTOs/routes need phase agreement. Each screen needs loading, empty, error, success and unavailable/permission states where applicable.

| Screen / module | Content and primary action | Requirements/boundaries |
| --- | --- | --- |
| Landing / public | “Find F without looking.”; Start learning/Log in; annotated exercise and illustrated course map; certificate explanation | Guest entry; no invented efficacy claims/testimonials |
| Register/login / auth | Full-height illustration and centered form on desktop, verification explanation, safe errors | SYS-1–8; email/password; no role picker/Google button |
| Verify/resend / auth | Needed/success/expired/used states, actual resend guidance | SYS-3; login blocked until verified |
| Forgot/reset / auth | Generic acknowledgement, invalid/expired/used token, return to login | SYS-5, SYS-48; no enumeration |
| Placement / placement | Take or Skip, device/mode guidance, estimate/next step | SYS-16; no mastery/XP promise; skip uses initial configured group |
| Dashboard / dashboard | Recommendation/reason first; goals/streak/XP, review, recent sessions | SYS-18, SYS-22, SYS-33–35; first use points to placement/path |
| Course library / courses | Published course objectives/prerequisites; inspect a course | SYS-57–64; draft/archived eligibility follows the agreed contract |
| Course detail/My courses / courses | Enrollment, captured version, entry/resume and separate progress | Shared skill evidence; fixture/unavailable clearly distinguished |
| Course path / courses + learning-path | Units/lessons, eligibility/reason and returned next action | Reuse study/session flow; no guessed mastery or completion |
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
| Admin courses / admin + courses | Draft metadata, units/lessons/prerequisites, preview, validate, publish/version/archive | SYS-57–64; explicit version effects, audit and server validation |
| Admin learning settings / settings | Current version, validated changes, save/activate | SYS-43; future sessions, not retroactive |
| Admin moderation / forum + admin | Reports/context, pin/hide/delete | SYS-40, SYS-45; hidden/deleted content excluded from ordinary views |
| Admin certificates / certificates + admin | Search/status/revoke confirmation | SYS-38, SYS-45; privacy-safe |
| Admin audit / admin | Actor/action/target/time/minimal summary | SYS-45; protected, no logs/secrets |

Deletion views explain personal history, authored text and certificate identity/PDF removal before confirmation. Anonymous structural forum placeholders retain reply structure without deleted content. Revoked/unavailable certificate views cannot restore erased identity.

### 9.1 Anchor screen implementation

**Dashboard, 1440 × 1024:** 224px sidebar, 72px header, 32px main gutters. Flexible content + 280px rail, 24px gap. Main: title/greeting, large recommendation with reason/focus/Start, compact path preview, recent sessions. Rail: daily goal, streak/level and due review. Compact desktop moves rail below. Counts/XP are labeled fixtures.

**Typing, 1440 × 1024 and 1024 × 768:** 960px centred study shell; compact header, activity/reason, progress, mode-bound passage surface, provisional metrics, guide and controls. Fit active passage/essential controls at minimum desktop; secondary help may scroll. Include both themes, Arabic shell with unchanged English passage, large-text, reduced-pressure, paused, timed and save-retry variants. Its phone counterpart is device guidance.

**Official result, 1440 × 1024:** mode-specific completion heading + **Official result**. Metric row: Net WPM, Gross WPM, Raw accuracy, Final accuracy, each explicitly labeled. Follow with key/pair evidence, applicable rewards, next recommendation; Continue primary, View progress/Return secondary. Placement says “Placement estimate” with official saved measurements and provisional ability evidence; omit XP/certificates. Tests omit curriculum/mastery-change claims.

Raw-accuracy help: “Counts every typing attempt, including corrected mistakes.” Final-accuracy help: “Accuracy of the text remaining when you finished.” Unknown shows “Not available”, never a perfect score. Low accuracy uses “Let's give these keys more practice”, not a failure banner for insufficient evidence.

#### Anchor composition and content priority

Use these diagrams for information order. Match the linked frames for placement and artwork. Text aligns to logical start, except individual centred node icons and deliberately centred numeric values. Do not centre whole working screens.

```text
Dashboard — wide desktop
[224px navigation] [Page title                                      ]
                   [Recommendation: activity, focus, why] [Goal      ]
                   [Start learning activity             ] [Streak/XP ]
                   [Compact path preview                 ] [Review    ]
                   [Recent sessions: readable rows                   ]

Study — centred, no sidebar
[Exit] [Mode]                          [Text / pressure / preferences]
[Activity title, focus keys and short reason                         ]
[Passage progress OR mode-bound timer                                ]
[Exact English passage; stable current line and error cues           ]
[Live provisional metrics, reduced-pressure alternative              ]
[Complete physical-QWERTY guide                                      ]
[Mode-permitted actions and concise help                             ]

Official result
[Completion heading] [Official result / placement-specific authority ]
[Net WPM] [Gross WPM] [Raw accuracy] [Final accuracy]
[Evidence and what it means; unavailable states remain explicit      ]
[Applicable confirmed rewards] [Explained next activity + Continue    ]
```

| Anchor | First visual priority | Supporting content and checks |
| --- | --- | --- |
| Dashboard | Recommendation title, concise reason, focus chips and one Start action | Use section headings/rows for the path and recent sessions. Rail items remain quieter than Start; a due-review count is not a second competing hero. First-use and unavailable recommendation frames have their own honest action. |
| Typing | The active passage line and current-position cue | Keep instructions compact and long reasons expandable before typing. At 1024 × 768 test the complete keyboard, essential controls and large-text variant together; reduce optional surrounding spacing and use a stable passage viewport with visible scroll affordance as needed, never shrink the specified exercise type or remove assigned text. Secondary help may scroll. |
| Official result | Completion/authority and all four explicitly named metrics | At wide desktop use one shared metric band with separators, not four promotional cards. Evidence and next activity precede expanded reward detail. At phone width reflow metrics to two columns, then one if labels/text need it. Saving uncertainty is a separate frame, never a result frame with provisional rewards. |

For each anchor, show typical content plus a stress case: a wrapped Arabic recommendation, long focus-key list, unavailable optional metric or no-history state. Focus chips wrap and the reason may grow; neither should push the sole primary action out of reach. Fixture annotations sit beside review frames, with a visible sample-data notice whenever a preview could be mistaken for real progress. Do not derive mastery, daily-goal units or completion rules from sample numbers.

#### Learning-loop parity checks

- Dashboard: the navy recommendation pairs focus keys with a monospace excerpt. The current row in the compact path opens the course, and the latest matching journal entry opens its own result.
- Course: completed keys sit lower with checks; available keys have an action glyph, the current key has a cobalt face, and locked keys include a lock and prerequisite. The due-review panel is independent of the ordered lessons. Only eligible activities can launch the shared exercise.
- Typing and result: match the F/J ridges, quiet target outline and visible incorrect-character underline. In the saved result excerpt, the missed S is explicitly named and connected to its explanation. The next panel explains the F/J recommendation and previews a short drill. A missed S and incomplete F/J evidence are separate observations.
- Progress: keep the selected F visually aligned with its evidence excerpt. Provide chart equivalents as actual table rows; open the matching session result from the journal. On mobile offer View learning path and View result, preserving the physical-keyboard guidance.
- Admin: use the validation, report and retry icons beside readable issue labels. Tangerine margin marks may reinforce grouping. Keep chart lines, values and table controls legible without relying on hue.

### 9.2 Charts and reports

Use separate labeled speed/accuracy charts or clearly distinct axes; no unexplained combined score. Filter modes/difficulty where needed. Lines use patterns and labeled legends. Heatmaps distinguish locked/unknown/in-progress/mastered/review due and offer a data table for counts/accuracy/latency. Unknown latency is unavailable, not zero.

Admin metrics explain reporting windows/denominators. Raw streams, tokens, internal integrity heuristics and private learning records stay out of public/student mocks. Admin detail needs explicit authorised access; navigation does not grant it.

### 9.3 Landing page: show the learning experience

The landing page follows one keystroke from fingertip to an explained drill. Implement these sections in frame order. Heights are the measured 1440px-wide reference, not fixed responsive heights. Preserve the uninterrupted navy background from navigation through the course statement. The hero ends flat against the dashboard showcase. The single curved edge leads into a continuous paper field for the course map, history and FAQ.

| Section and frame | Reference height (px) | Composition |
| --- | ---: | --- |
| [Public header](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=6-2) | 72 | Wordmark, page links, Appearance, language and Log in share the navy opening. |
| [One keystroke / illustrated opening](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-302) | 824 | Centered “Find F without looking.” in Source Serif 4 Regular, 99/103px at reference width. Cropped outlined finger reaches toward a beveled cobalt F. Keep Start learning dominant. The 1024 × 164 navy preview strip separates device guidance, monospaced passage with tangerine caret, and the raised next-key F. The hero ends flat against the showcase. |
| [Inside TypeFlow / dashboard showcase](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=70-321) | 835 | Large inset of the learner dashboard framed by cobalt and tangerine keycap silhouettes. Use a static, sample product view with the same components as the real dashboard. |
| [Adaptive learning / annotated D–F example](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-386) | 546 | “One keystroke. A different drill.” White exercise sheet on navy compares target `a s d f` with typed `a s d d`. Underline and name the final substitution. Draw the fine annotation to `d f d f`. Repeated substitutions in saved evidence may support a focused drill; the example is illustrative. |
| [Learning by touch / curved statement](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=70-479) | 518 | Centered statement and Explore the course link above outlined hands and key shapes. The broad arc at the bottom is the transition from navy into paper. |
| [A learning path made of keys](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-408) | 659 | On paper, pair the folded map and course link with the contour-lined, winding course preview. Use the sculpted key states of the student path. |
| [Progress you can understand](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-506) | 619 | Stay on paper. Pair “A history for every key.” with the selected F, a legible practice-history excerpt and a sample speed chart. |
| [Questions before you start](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-536) | 532 | Compact, readable device, placement, language and certificate answers on the same paper field. |
| [Start your learning](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-557) | 516 | Return to navy. Center the F/J invitation and account actions over a frieze of outlined hands lifting individual keys. |
| [Footer / product and navigation](https://www.figma.com/design/OYtuX60oQ9GVoMn1ghUqgj?node-id=22-565) | 355 | Paper footer with brand, section links, account and certificate verification, Appearance and language. Only link to real destinations. |

On narrow pages, scale the illustration independently of the heading. Stack evidence copy and exercise sheet, preserve target/typed labels and underline, and keep controls reachable. Reflow wide dashboard/chart previews as contained illustrations. Adapt the 50/50 auth layout to a single readable form with reduced illustration at narrow widths. English keystrokes and keyboard geometry remain LTR in either interface language. The ten frames include one mobile dashboard; other responsive compositions are implementation requirements.

**Navigation boundary:** anonymous Start learning follows the agreed registration/onboarding flow; an authenticated Student gets Continue learning through the real owned destination; an Admin gets the appropriate admin destination. Pending identity must not display a fabricated student or guess their course resume target. Auth redirects, route registration and public certificate data stay with their feature owners; agree component props before changing shared header/auth/router files.

The proposed team split is landing design/implementation by the project owner, with Dev 1 retaining auth/navigation integration and Dev 5 coordinating the shared header/certificate verification. The [FE-24 plan](docs/project-plan.md) remains the allocation reference; this brief does not reassign its tasks or authorize implementation.

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

### 10.1 Forms, data states and recovery

| State | Required presentation | Recovery / safety |
| --- | --- | --- |
| Initial loading | Reserved content geometry, meaningful status and stable button labels | A static skeleton is enough; no mandatory shimmer or invented metrics |
| Background refresh | Keep usable previous data if safe for the same owner; indicate refresh separately | Never carry protected data across an account change |
| Empty | Explain the confirmed absence: no completed sessions, no due review or no matching filters | Offer the relevant first action or clear filters; empty is not an API outage |
| Unavailable/future | Explicit “Not available yet” or labelled development fixture in review builds | No success-shaped empty array, guessed value or active unsupported action |
| Error / offline | Brief problem, preserved safe input and a relevant Retry/return action | Unconfirmed session saves follow the identical-retry flow in section 8.3 |
| Permission / expired login | Safe explanation and the correct login/return path | Do not reveal another account's data or let a visual guard replace server authorization |

**Account dialog implementation:** login/register reuse the existing routed modal and native `Dialog` focus/scroll boundary. The branded header, start-aligned introduction, full-width fields/action, password visibility control, inline validation, verification notice and separated account-switch action use shared tokens in both themes. Email/password entry stays LTR within Arabic UI. Paste and password-manager autocomplete remain available; mobile dialogs scroll within the viewport.

Forms have visible labels, field-level messages and an error summary for multiple failed fields. After a failed submission, focus the summary or the first relevant error. A multi-field summary links each message to its invalid field; keep the inline messages and do not move focus on every blur. Preserve entered non-secret values; allow password managers and paste in authentication fields. The paste restriction applies to the scored typing surface only. Destructive actions name the object and consequence; users can cancel without losing unrelated work. Course editors provide button/keyboard alternatives to dragging lessons.

Use semantic buttons/links, current-page states, one page heading and a logical heading order. Decorative icons beside equivalent text are hidden from assistive technology; icon controls have accessible names. Sticky elements should keep the entire focused control visible as a TypeFlow design target. Charts need a readable table/summary; tooltips cannot be the only way to obtain a value.

Format WPM and accuracy with at most two decimal places and explicit units; never render raw floating-point tails. Rounding is presentation only: keep the server value for calculations, threshold decisions and stored evidence. Unknown remains unavailable, not 0 or 100%.

Copy is brief, direct and encouraging: “Continue practice”, “Review these keys”, “More evidence needed”, “Your next practice focuses on…”. Use sentence case; explain adaptation from evidence rather than an unspecified AI coach.

## 11. Figma-to-code handoff

Use the ten frame links in section 9 and the components/variables in `00 Foundations`. Keep the existing routing and one shared typing engine. Reuse the selected TypeFlow logo, key faces, button instances, glyph states and the actual illustration layers. Export individual decorative vectors where appropriate; keep headings, instructions, actions, tables and exercise text semantic and selectable. Decorative art is hidden from assistive technology. Provide text for instructional content conveyed by artwork.

The prototype has 45 linked elements across the ten frames: landing 16, login 2, register 1, dashboard 8, course 5, exercise 2, result 3, progress 6, admin 0 and mobile dashboard 2. Preserve the demonstrated flows (section scrolling, public entry, current lesson → exercise, matched journal row → result, result → next activity or progress). Bind links to actual owned resources. For example, a saved journal entry opens its own session result; the current lesson uses the eligible assignment. The static dashboard showcase inside the landing page is a preview. Admin navigation, verification, auth and server scoring still require real application behaviour even when no prototype link exists.

Implement against one reference frame at a time. Compare at reference width and normal reading size, including the main hero drill strip, evidence sheet, course key housings, account split and mobile journal. Verify viewport scrolling, focus, non-color state cues, persistent preferences, real loading/empty/error states and reduced motion. Capture differences and resolve them against the frame and SRS.

## 12. Review gates and unresolved decisions

The ten main compositions, semantic modes and prototype flows are documented. Browser parity, dark/RTL rendering, responsive coverage beyond the reference frames, font licensing, API integration, keyboard/screen-reader testing and learning policy approvals remain separate checks. Use the following matrix for implementation acceptance.

| Check | Review coverage |
| --- | --- |
| Appearance and language | Light/Dark × English/Arabic, including long labels, mixed-direction codes and English exercises |
| Layout | 1440, 1280, 1024 desktop; 768 tablet; 390 and 320 narrow non-typing views; 200% text/zoom |
| Interaction | Keyboard-only, visible focus, labels/error recovery, screen-reader status and non-hover alternatives |
| Motion | Default and reduced motion, preference changes, rapid reversal and no typing-stage movement |
| Session continuity | Theme/locale/large-text changes and resize keep assignment/input; timing follows the active mode |
| Data | First-use/returning, missing optional fields, failed refresh, unavailable future API and identical-save retry |

Use labelled fixtures for visual comparison. Do not treat policy TBDs as agreed behaviour. Update the SRS/decision records if a later team choice changes requirements.
