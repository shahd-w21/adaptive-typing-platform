# Testing and acceptance

**Status: verification plan; no application checks have been executed as part of documentation work.** Use [setup](../README.md#quick-start) for verified commands when available and SRS sections 8–10 and 15 for acceptance rules.

## Test layers

Use `.test.js` for JavaScript tests and `.jsx` where a React test renders JSX. Cover `client/`, `server/` and the shared package as appropriate. Baseline checks are JavaScript linting, runtime validation, tests and build; static-type checking is not required.

| Layer | Highest-value checks |
| --- | --- |
| Pure unit tests | Replay, scoring denominators, timing, accuracy gate, missing evidence, mastery/review, feasible fallback |
| Database integration | Ownership, atomic rollback, duplicate submission, concurrent updates, unique rewards, revocation, deletion |
| Browser flow | Register/verify → type → official result; focus/pause, restart, deadline, accessibility and network retry |
| Presentation/localisation | Light/Dark/System, English/Arabic RTL/LTR, desktop/mobile non-typing layouts, owner/guest preferences, unchanged English typing state |
| Content validation | Word/group/theme references, allowed alphabet, coverage feasibility, blocked text and cache versions |
| Performance | SRS workload and reference environment; warm/cold results separately |

## Fixed scoring examples

Use server-reconstructed counts. These examples illustrate SRS formulas; do not replace them with a library's different WPM convention.

| Case | Inputs | Expected result |
| --- | --- | --- |
| Perfect timed minute | `I=C=B=F=100`, `M=1` | Gross/net 20 WPM; both accuracies 100% |
| Corrected mistakes | `I=110`, `C=100`, `B=F=100`, `M=1` | Gross/net 20; raw about 90.91%; final 100% |
| Five remaining errors | `I=B=100`, `C=F=95`, `M=1` | Gross 20; net 15; both accuracies 95% |
| Unattempted timed suffix | 500 assigned characters; `I=C=B=F=100`, `M=1` | Same as perfect minute; suffix is not an error |
| No printable attempts | `I=B=0` | Accuracy unavailable; no reward/certificate |

Add event-level fixtures for backspace at position zero, incorrect inserts, Shift, held-key repeats, equal timestamps, invalid sequence numbers, pauses, post-deadline events and text exhaustion. Check unrounded threshold comparisons and differences between learning and test modes.

## Acceptance evidence register

For each implemented requirement, add a row or link to a tracked test. Do not mark an entire SYS range passed from one happy-path test.

| SYS ID | Scenario | Test/manual procedure | Result/date | Evidence/owner |
| --- | --- | --- | --- | --- |
| SYS-46 | Lost response, identical retry | TBD | Not run | TBD |
| SYS-47 | Two sessions update the same student | TBD | Not run | TBD |
| SYS-48 | Reset/deactivation invalidates old session | TBD | Not run | TBD |
| SYS-53 | Light/Dark/System applies consistently without session reset | Presentation matrix below | Not run | TBD |
| SYS-54 | English/Arabic UI, English/LTR exercises and stable scoring | Localisation checks below | Not run | TBD |
| SYS-55 | Desktop/mobile feature parity outside typing; device guidance | Responsive checks below | Not run | TBD |
| SYS-56 | Preference defaults, ownership, partial merge and failure recovery | Persistence checks below | Not run | TBD |

Expand to cover all requirements before release. Use a dedicated test database with a positive identity check before any reset. Never run destructive test setup against shared development or production data.

## FE-03 shared interface browser checks

Run `npm run test:ui --workspace=client` from the repository root after the root workspace install. The restored suite uses installed Google Chrome through Playwright and starts/stops an isolated Vite server on `127.0.0.1:5174`; port 5174 must be free. No Docker services or login credentials are needed. All `/api/v1/` requests are intercepted with synthetic responses, and `tests/fixtures/shared-ui.html` is a test entry only, outside the production build. Runs normally generate ignored artifacts under `client/test-results/`; the previously deleted results have not been restored.

The restored [browser suite](../client/tests/e2e/shared-ui.spec.js) covers:

- Public, Student and Admin headers/drawers in English/Arabic and Light/Dark at 320px and 1280px; axe checks of headers, sidebars and open drawers, focus containment/return and page-width assertions with overflow masking removed.
- Keyboard skip links, public destinations/authentication, Admin/profile navigation, preference menu arrows/Home/End/Escape, and the same authorized Admin destinations/actions on phones.
- Loading, empty, safe generic/permission errors, explicit retry, Cancel-first confirmation focus, pending dismissal prevention, failed confirmation retry and successful focus return in both locales/themes.
- Mobile typing entry issuing zero assignment requests; an existing sample review retaining entered correct/incorrect characters and English/LTR passage after theme, locale and viewport changes, including confirmation dismissal.
- Existing profile/forum modal labels and focus behavior; supporting-page reflow; wrong-role denial; all Admin section controls and a contained, keyboard-focusable user table at 320px with 200% root text size.

**Local verification, 22 October 2026:** `npm run lint` passed; `npm test` passed all 31 tests; `npm run build` passed Prisma generation, the client production build and server entry syntax; `npm run test:ui --workspace=client` passed all 24 browser tests using Windows Google Chrome 155.0.8059.86, Playwright 1.64.1 and axe-core 4.14.0. Representative Light/Dark and Arabic drawer screenshots were visually inspected. New documentation links, translation encoding and `git diff --check` passed. Database integration tests and remote CI were not rerun for this frontend task.

This is focused shared-interface evidence, not acceptance of the entire SYS-11/53–55 range. Owner Dev 5 and reviewer Dev 1 still need to demonstrate the flows together and review the new Arabic copy. Manual screen-reader/forced-colour checks, Firefox/Edge, real-API browser journeys, complete feature-page localisation and broader release acceptance remain pending. Admin/forum/certificate screen bodies and workflows belong to their follow-on feature tasks; their fixture notices remain visible. Official scoring, reward saving and database behavior are outside FE-03.

Defects found and corrected during FE-03: missing phone public navigation, drawer/dialog keyboard boundaries and focus return, disappearing menu-option focus, unsafe narrow popup placement, nested loading/permission main landmarks, assignment creation before phone guidance, overflowing certificate actions, and uncontained Admin navigation/table layout. Test-selector mistakes and Arabic encoding damage introduced during implementation were corrected before the final run. The production bundle still emits the existing over-500-kB chunk warning; local Node 24.13.1 is below the repository's pinned 24.14.0 and emitted an engine warning during test-tool installation.

## Appearance, interface language and responsive acceptance

SRS SYS-53–56 and section 10.5 own behaviour; [DESIGN.md](../DESIGN.md) owns proposed tokens, frame sizes and layouts. These checks are planned, not executed browser evidence.

| Area | Required checks |
| --- | --- |
| Appearance | Light/Dark on public/student/admin, passage/key feedback, dialogs/menus/charts; System follows device changes, explicit selection overrides; initial render avoids theme flash; PDF styling unchanged |
| Contrast/accessibility | Actual text/status/button/focus combinations in both themes, including hover/disabled/selected states; keyboard order/focus return, reduced motion/pressure, large text, forced colours and screen-reader labels |
| Interface locale | English/Arabic controls, help/errors/system explanations; own-name selector; Arabic `lang`/RTL shell with isolated English/LTR passage/input, key/pair labels, QWERTY geometry, emails/codes/units; reviewed translations and safe English fallback |
| Content invariants | Same exact assignment/events/spec and permitted characters before/after theme/locale changes; authored/forum content and PDF not translated; identical replay/official metrics and learning updates |
| Active sessions | Changing preferences/viewport preserves recorder/buffer/assignment; ordinary mode focus-loss/pause/deadline rules still apply; save retry retains payload and does not repeat rewards |
| Responsive | Every non-typing page and edge state at desktop/minimum desktop and 320–430px phone widths in both modes/locales; no page-wide overflow, Arabic wrapping, reachable drawer/forms/actions, 200% text size, data alternatives and contained two-dimensional tables |
| Mobile typing boundary | Practice/review/placement/test launch shows desktop/physical-English-QWERTY guidance without creating a scored touch session; existing attempts retain timing/state after resize |
| Preference persistence | System/English defaults, allowed visitor local choices, owner-only account updates, account precedence at login, reload/cross-device persistence, logout account-cache cleanup, save-failure rollback/retry |
| Partial update/privacy | Changing locale retains theme/other fields; concurrent different-field updates do not overwrite unrelated settings; invalid enum/locale denied, other-user update denied, CSRF/active-account checks, no auth/PII in visitor preference storage |

Compare desktop/mobile × Light/Dark × English/Arabic fixtures; System is a resolver test, not a third rendered palette. Record exact desktop/mobile browser versions and assistive technologies when implementation is tested; no browser is claimed verified by a Figma prototype. Theme/locale must not change the saved timezone or qualifying streak date. Keep machine-readable API values canonical while formatting display labels.

## Course expansion acceptance — required, not run

For SYS-57–64 and [decision 0008](decisions.md#0008), verify:

- Catalog hides drafts; enrollment/path access enforces ownership, version and prerequisites; repeated enrollment requests have agreed retry behavior.
- First learning entry offers placement/skip; later visits resume without repeating it; a new course reuses compatible evidence and offers targeted checks only when needed. Sparse/absent evidence cannot grant mastery, advanced prerequisites or course completion.
- Identical learner profiles can receive different practice in the same lesson as evidence changes; extra practice/reviews preserve course objectives and permitted characters. The LLM cannot decide progression, and a service outage still permits feasible fallback exercises.
- Learning in one course can inform shared skill estimates without falsely completing unrelated lessons, losing progress or duplicating XP. Exercise completion, lesson completion, placement exemptions and mastery are distinct states with auditable evidence.
- Concurrent submissions atomically save shared evidence, course progress and rewards; identical retries return the same saved effects. Changing course during an active attempt does not change that attempt.
- Publishing rejects invalid prerequisites, cycles and impossible content; editing/publishing a new version preserves old enrollments/assignments. Archival prevents new enrollment without erasing existing access/history; account deletion removes personal course progress.
- Completion follows approved objectives/checkpoints and cannot be obtained through placement alone; course completion does not silently issue a performance certificate. Existing language/theme/device and certified-test rules remain unchanged.

Map concrete behavioral tests to SYS-57–64 once exact contracts are agreed. `server/tests/fixtures/courses.js` is comment-only; it supplies no fixtures or assertions. No course implementation, test execution or acceptance is asserted by this checklist.

## Adaptive evaluation

Compare adaptive and fixed-curriculum policies with identical initial profiles, equal practice budgets and a common held-out assessment. Separate tuning from reporting profiles; run multiple random seeds and report variability. Include novices, slow-accurate, fast-inaccurate and uneven-key typists. Do not build an improvement model that rewards adaptation by definition.

Report simulator assumptions, metrics, seeds, configuration versions and limitations. Simulations validate behaviour under assumptions, not faster human learning. A consented volunteer pilot can provide usability and limited learning evidence; document sample size and duration. Confirm whether the course requires a trained model before finalising evaluation.
