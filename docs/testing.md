# Testing and acceptance

**Status: target acceptance plan plus dated implementation evidence; unrecorded checks remain unverified.** Use [setup](../README.md#quick-start) for verified commands when available and SRS sections 8–10 and 15 for acceptance rules.

## FE-06 / FE-10 verification — 22 October 2026

Implemented the existing dashboard and owned-practice boundaries; this is not acceptance of future courses or every typing mode.

| Check | Evidence / result |
| --- | --- |
| Unit tests | 43 passed, including 11 new dashboard/controller checks: DTO validation, nullable/zero values, double start, frozen retries, dropped-response recovery, reload, failed abandonment and late account/logout responses |
| Real API integration | 7 passed against guarded `typeflow_test`; the new test uses real cookie authentication, server assignment/scoring, deliberately drops a committed response, recovers without resubmitting, and verifies dashboard history/XP/streak |
| Browser checks | 36 passed in Chrome 155.0.8059.85: 12 new dashboard/session checks plus the 24 existing shared UI checks |
| Dashboard states | New/returning accounts, loading, no history, permission denial, server error/retry, isolated path failure and stale-data warning after refresh failure |
| Presentation | English/Arabic and Light/Dark dashboard reflow/accessibility; existing System resolver checks; real-assignment fixture survives theme/locale/large-text/viewport changes with its recorded input intact |
| Browser data source | Explicit intercepted HTTP fixtures; no developer database writes. The real scoring/authentication loop is the separate PostgreSQL integration test, not a mocked browser claim |
| Static/build checks | Root lint and production build passed; the existing JavaScript bundle-size warning remains |

Defects found and resolved: keyboard-inaccessible horizontal history table; malformed path-error prop; premature redirect before reload recovery; lost pointer after failed recovery; external font timeouts; cold-run assertion timeouts. Browser tests isolate external fonts and exercise fallback fonts; production font delivery is unchanged. The final run uses condition-based waits, a 60-second test limit and 15-second assertion limit. No fixed sleeps were added.

**FE-10 re-verification — 23 October 2026:** all 11 `dashboard-session.test.js` controller tests passed, including frozen identical retry, dropped-response recovery without replaying rewards, restart-after-abandon, expiry/abandonment and duplicate-start protection. All 7 PostgreSQL integration tests passed, including the real API lost-response recovery flow. All 12 `dashboard-session.spec.js` browser checks passed serially, covering recovery, retry, English/Arabic, Light/Dark, accessibility, and typing through presentation changes. Root lint and production build passed; the existing bundle-size warning remains. Two English presentation checks timed out during an initial parallel run under load, then both passed when rerun serially and passed again in the complete serial suite.

**FE-15 verification — 23 October 2026:** all 60 unit tests passed, including seven new recorder/reducer/shared-metric checks. Fake-clock recorder events for zero-time start, correction, backspace and pause were replayed through the server scoring function and matched raw/final accuracy, active duration and key-latency results. All 7 PostgreSQL/API integration tests passed. All 13 `dashboard-session.spec.js` browser checks passed serially, including English/Arabic, Light/Dark, responsive/accessibility checks, preserved typing through presentation changes, Shift+A capture, and rejection of paste, drop, bulk input, IME composition, key repeats and non-ASCII input. Root lint and production build passed; the existing bundle-size warning remains. The browser uses intercepted API fixtures; recorder/replay agreement is separately checked against the server scoring function. Owner/reviewer demonstration, human Arabic review, and live browser cookie/CORS and screen-reader acceptance remain pending.

**Handoff / still pending:** Dev 4 dashboard review, Dev 1 lifecycle review, human Arabic wording approval, live browser cookie/CORS and screen-reader acceptance, and visual review with delivered web fonts. Course resume contracts, placement/review/test APIs, translated reason codes and FE-16 reward notifications remain future work. The backend has no idempotent start contract; a lost start response may leave an orphan assignment, which is explained without an automatic retry. Unfinished typing events are intentionally not persisted across reload.

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

## FE-08 forum browser checks

Run `npm run build` before `npm run test:ui --workspace=client`. The browser config now includes [forum checks](../client/tests/e2e/forum.spec.js) alongside the preserved FE-03 suite. Tests use the isolated Vite origin on port 5174, a test-only [forum entry](../client/tests/fixtures/forum.html), disposable adapters and intercepted authentication/preferences. One test starts the built production app on port 5175 to verify that the forum fails closed without a real API; both ports must be free. No real forum endpoint or developer database is used.

Coverage includes list loading/error/retry and empty state; list/reply pagination; empty threads; create and reply drafts retained across failed/lost responses and deduplicated retries; literal HTML/script-like text and mixed authored languages; owner-only single accepted-answer replacement and retry; reporting without browser hiding; explicit read-only DTOs; unavailable/hidden detail and hidden/deleted replies; English/Arabic, Light/Dark, 320px/1280px, axe checks, keyboard entry/dialog focus, and 200% text reflow. The existing FE-03 test still checks active English/LTR typing state across appearance, locale and viewport changes.

**Local verification, 22 October 2026:** root `npm run lint` passed; `npm test` passed all 32 unit tests; `npm run build` passed Prisma client generation, the client production build and server syntax; `npm run test:ui --workspace=client` passed all 42 browser tests (18 forum and 24 preserved shared-interface checks) using Windows Chrome 155.0.8059.86. English mobile and Arabic Dark desktop screenshots were visually inspected. All 48 forum translation leaf keys and interpolation parameters match across English/Arabic; new local links/anchors and `git diff --check` pass. Fixture implementations/test markers are absent from the production bundle. Prisma generation does not alter the schema or migrate/reset data.

Defects corrected during FE-08 include lost keyboard focus after an accepted-answer/report control disappears, retained generic fixture notices on an unavailable production forum, ambiguous browser-test selectors, an incomplete authentication test DTO and an incorrect test expectation about the existing anonymous redirect (`/register`). The final run has no failing checks. The existing production bundle-size warning above 500 kB remains.

**Search/filter follow-up, 22 October 2026:** root lint, client production build and all 45 browser tests pass (21 forum and 24 shared-interface checks). Added checks cover combined search/category/accepted-answer criteria before pagination, page reset, Clear filters, no-match recovery, off-page matches, exclusion of hidden/deleted text from filtered matches/counts, failed search retry, rapid query replacement, and Arabic criteria retained across detail navigation and appearance/locale changes. The complete English/Arabic Light/Dark viewport/accessibility matrix still passes, including 200% text reflow and the active typing-state regression. English desktop and Arabic mobile list screenshots were visually inspected; all 61 forum translation leaf keys/placeholders match, and `git diff --check` passes. Search/filter flows use development fixtures; the production API gate and existing bundle-size warning remain. Backend/database checks were not rerun for this frontend-only follow-up.

**FE-06 / FE-08 merge verification, 22 October 2026:** root lint, all 43 unit tests and the full build passed. The combined browser configuration discovers all 57 dashboard, forum and shared-interface tests. The parallel run passed 50 and failed 7; rerunning the 7 failures with `npm run test:ui --workspace=client -- --last-failed --workers=1 --timeout=180000` passed 5. Across both runs, 55 checks passed. Two existing shared confirmation-dialog checks (English Light/Dark, `shared-ui.spec.js`) remain failing around the transient disabled Cancel state / Escape behavior. The test and dialog implementation were unchanged by this merge; investigation remains open, and the combined browser suite is not fully green. The existing bundle-size warning remains. No database integration checks were rerun for this merge.

Owner Dev 5 and reviewer Dev 4 must still demonstrate the behavior together and review Arabic copy. Forum DTO/shared schemas, public reading policy, real server authorization/moderation and persistence remain unimplemented team gates; these fixture checks do not establish SYS-39/40 end-to-end acceptance. Database integration, remote CI, manual screen-reader/forced-colour checks and other browsers are outside this local frontend verification.

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
