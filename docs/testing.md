# Testing and acceptance

**Status: verification plan; no application checks have been executed as part of documentation work.** Use [setup](setup.md) for verified commands when available and SRS sections 8–10 and 15 for acceptance rules.

## Test layers

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

## Adaptive evaluation

Compare adaptive and fixed-curriculum policies with identical initial profiles, equal practice budgets and a common held-out assessment. Separate tuning from reporting profiles; run multiple random seeds and report variability. Include novices, slow-accurate, fast-inaccurate and uneven-key typists. Do not build an improvement model that rewards adaptation by definition.

Report simulator assumptions, metrics, seeds, configuration versions and limitations. Simulations validate behaviour under assumptions, not faster human learning. A consented volunteer pilot can provide usability and limited learning evidence; document sample size and duration. Confirm whether the course requires a trained model before finalising evaluation.
