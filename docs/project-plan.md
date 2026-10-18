# TypeFlow project plan

- **Updated:** 16 October 2026
- **Team:** five developers
- **Frontend deadline:** 23 October 2026
- **Next milestone:** complete the frontend, then finish and connect the remaining backend features.

This plan uses the supplied **`Whats Done (16-10).md`** progress report, the repository instructions and the existing requirements. It separates finished setup, working features that need adjustment, and features that still need implementation. Suggestions and quoted instructions in the report are reference material; they do not approve new policies or replace the [SRS](srs.md).

This is the current local delivery plan. It does not create tasks in an external service or change application code. Earlier planning exports are superseded by this document.

Read the status and team allocation first, then your own frontend task group. Backend tasks are for the next delivery phase. All file paths are relative to the repository root.

- [Current status](#1-current-status-what-is-done-and-what-needs-work)
- [Milestones](#2-delivery-milestones)
- [Five-developer allocation](#3-five-developer-allocation)
- [Shared-file coordination](#4-how-the-team-works-together)
- [Frontend week](#5-frontend-schedule-19-23-october)
- [Detailed frontend tasks](#6-detailed-frontend-tasks)
- [Backend plan](#7-backend-roadmap-after-frontend-acceptance)
- [Schema changes](#8-schema-change-plan)
- [Decisions and blockers](#9-decisions-risks-and-blockers)
- [Completion checks](#10-completion-and-evidence)

## 1. Current status: what is done and what needs work

### 1.1 Development setup is in place

Preserve this work. The implementation plan extends it rather than creating another project structure, server or installation process.

| Finished area | What already exists | Remaining check |
| --- | --- | --- |
| Repository | JavaScript workspaces in `client/`, `server/` and `packages/shared/` | Verify a fresh teammate clone can follow onboarding |
| Root commands | Environment setup, development startup, lint, tests, build and database commands | Record actual command results when integrating changes |
| Environment | Tracked examples, local JWT-secret generation and preservation of existing `.env` values | Keep real secrets out of Git and client variables |
| Local services | Docker PostgreSQL and Mailpit with persistent database storage | Confirm another teammate's local services work without resetting data |
| Database tooling | Prisma generation, committed migrations, non-destructive starter seed and Studio | Review future schema changes and upgrade behavior |
| Startup | Health endpoints and development-port checks | Check process health and database readiness separately |
| CI | Installation, generation, lint, tests and build workflow; the report notes action runtime updates | Verify the latest remote GitHub Actions run actually passes |
| Styling | Tailwind configured; `client/src/index.css` is the single styling entry point | Complete rendered browser, accessibility and responsive checks |
| Scaffold | Frontend, backend and shared paths reflected in architecture documentation | Implement reserved files before importing them |

Use the [README](../README.md) for commands and the [development guide](development.md#foundation-status-and-frontend-handoff) for the foundation and teammate handoff.

### 1.2 Backend behavior exists, with specific extensions remaining

The active server is `server/src/server.js`. Preserve the migrated feature services and their existing regression coverage.

| Existing behavior | What still needs adjustment or completion | Planned work |
| --- | --- | --- |
| Register, verification/resend, login/logout and reset | Connect forms and prove complete browser journeys | FE-04, FE-09, FE-29, BE-09 |
| Cookie JWT, database sessions, revocation, CSRF and role/owner checks | Broader security acceptance and deployment cookie/origin configuration | BE-09, BE-24, BE-25 |
| Profile/preferences, password change and account deletion | Frontend persistence, preference precedence, failure recovery and deletion across future features | FE-14, FE-19, BE-22 |
| Server-assigned practice; start, submit, abandon, history and owned result | Other modes and owned course/lesson context | FE-05, FE-10, BE-04, BE-14 |
| Server replay, corrections, pause handling and SRS metrics | Mode-specific timing and key/pair evidence cases | BE-03, BE-04 |
| Atomic save, identical retries, conflicting-retry rejection and concurrency protection | Apply the same guarantees to course progress, badges and certificates | BE-14, BE-18, BE-20 |
| Per-key evidence, mastery and prerequisite unlocking | Pair statistics, difficulty progression, placement and reviews | BE-06, BE-07, BE-08 |
| Constrained local fallback | Complete validation, curated content, cache and LLM integration | BE-05, BE-16 |
| Basic dashboard/progress, XP, levels, goals and streak calculations | Approved final policies, badges, reporting and UI connections | FE-06, FE-11, FE-16, BE-18, BE-22 |
| Raw-log expiry cleanup at startup and hourly | Durable generation/job coordination, catch-up and safe failure diagnostics | BE-17 |
| Admin protection, admin check endpoint and last-active-admin safeguard | Actual user/content/settings/analytics/moderation workflows | BE-19, BE-21, BE-22 |

Supporting tables for a feature do not establish that its API or workflow is implemented. Existing prototype settings are migration defaults, not approval of every product policy.

### 1.3 Existing frontend screens should be integrated in place

The teammate's landing/auth, dashboard, learning path/keyboard map, typing, recorder, keyboard guide, results, tests, progress, achievements, certificates, forum, profile and admin views are preserved. Appearance preferences, English/Arabic dictionaries and device guidance also exist.

Much of the application still uses demonstration data. Finishing the frontend means making these adjustments, not rebuilding those screens:

| Current behavior | Required adjustment | Main tasks |
| --- | --- | --- |
| `App.jsx` starts with a hardcoded user | Restore the real authenticated account and anonymous/loading states | FE-01, FE-04 |
| Navigation uses local view state | Add routing, direct links and access guards | FE-01, FE-24 |
| IDs and assignments are created in the browser | Obtain owned assignments from the server | FE-05, FE-10 |
| Completion simulates verification using `setTimeout` | Submit the recorded event log and display the saved response | FE-10, FE-25 |
| Browser code calls a calculated result official | Keep live values provisional; use the server result as authoritative | FE-15, FE-25 |
| Recorder builds `finishTime` with extra metadata | Adapt to the server's strict `events` / `finishTimeMs` body | FE-05 |
| Several views display sample statistics/content | Connect feature hooks and APIs; isolate development fixtures for missing APIs | FE-02, FE-06 through FE-28 as applicable |
| Preferences primarily use local storage | Add account persistence, login precedence, save recovery and logout cleanup | FE-14, FE-19 |
| Missing evidence can display perfect accuracy | Use shared formulas and unavailable values; align timing semantics | FE-15, FE-31, FE-34 |

Lint and build success do not establish that these integrations work.

### 1.4 Approved scope that still needs implementation

These areas have reserved paths or supporting concepts; comment-only files supply no runtime behavior:

- Course library, enrollment, separate course progress and resumable paths.
- Admin course authoring, preview, validation, publication, versioning and archival.
- Exact shared course/enrollment contracts and reviewed Prisma models.
- Placement, targeted entry checks, complete adaptive difficulty, pair statistics and spaced reviews.
- Full generation validation, curated content, LLM integration and compatible cache.
- Timed and certified session modes.
- Certificate eligibility, PDF generation, verification and revocation.
- Forum backend workflows and moderation, badge awards, and complete administration.
- Frontend transport, routing/providers, guards and remote-data hooks.
- Simulation, content-validation commands and executable browser-test infrastructure.

Course model approval does not mean course implementation is finished. One shared skill profile/session engine must support separate course enrollments and progress. Course completion remains distinct from a performance certificate.

### 1.5 Verification is partial and dated

| Evidence in the supplied report | How to use it |
| --- | --- |
| Latest frontend lint and production build passed | Preserve that baseline; rerun after implementation changes |
| Earlier setup/backend run: 17 tests passed after environment fixes | Historical evidence for that run, not a new result from this plan |
| Earlier database verification: five integration tests passed | Preserve covered migration behaviors and expand cases for new work |
| Fresh-clone onboarding and latest remote CI pass are not established | Verify them explicitly; local checks cannot establish remote CI status |
| Browser journeys, courses, deployment and accessibility/performance acceptance are not established | Keep these as planned acceptance work |
| Last recorded audit: four high-severity Prisma-tooling findings | Review actual locked versions and remediation before release |

The development guide records earlier test snapshots with different counts. Do not add those counts together or present them as one current full-product test run. This documentation task does not rerun the application or database tests.

**Curriculum issue to resolve:** `server/src/modules/settings/starter.js` currently seeds punctuation including `; , . /`. Reconcile that with the SRS introductory alphabet before adopting the starter curriculum as final. Preserve existing assignments, results and learner history; changing content is a reviewed transition, not permission to reset progress.

Some status documents describe an earlier phase. This section is the consolidated planning baseline. Preserve `docs/context/current-state.md`, `DESIGN.md` and teammate-owned documentation until their separately coordinated integration.

## 2. Delivery milestones

| Milestone | Target | What the team demonstrates |
| --- | --- | --- |
| Agree boundaries and preserve the baseline | Before dependent frontend work | Existing work saved; current vs draft APIs identified; course data contract and schema questions documented |
| Complete frontend | **23 October 2026** | All required screens, interactions and failure states; existing APIs connected; future APIs represented honestly |
| Finish backend learning loop | After frontend acceptance | Real placement/learning/review/tests with correct server scoring and persistence |
| Finish real course loop | After agreed schema, objectives and shared engine boundaries | Register/login, enroll, start lesson, submit, save official result and course progress, resume |
| Complete required supporting features | Following core/course integration | Generation, rewards/badges, forum, certificates and full administration |
| Accept and release the product | After full-system verification | Real-service journeys, privacy/security checks, measured performance, evaluation and recovery evidence |

For 23 October, record two statuses separately:

- **Frontend complete:** screens, forms, navigation, loading/empty/error/retry states, Light/Dark, English/Arabic and required responsive/accessibility behavior pass review. Existing endpoints are used where available. Missing endpoints can use clearly identified, schema-valid development fixtures; production must not claim fixture persistence.
- **Backend integration complete:** the same flow passes against real API/database services. Course/forum/certificate/admin workflows cannot claim this until those services exist.

The first full course demonstration is the report's proposed common goal: **register/login → enroll in one course → start a lesson → submit typing → save the official result and course progress**. Until the course backend is implemented, the earlier real practice loop is the integration baseline. Forum and certificates remain required later phases.

## 3. Five-developer allocation

Developer numbers are planning labels, not assignments to named teammates. Everyone contributes frontend work before 23 October, then follows the backend allocation. Match actual people to these areas based on the existing teammate's ownership and strengths.

| Developer | Frontend area | Backend area afterward | Main reviewer |
| --- | --- | --- | --- |
| Dev 1 | App integration, accounts, recovery, profile and preferences | Auth/security, settings, admin APIs and migration coordination | Dev 5 |
| Dev 2 | Typing, session hooks, test modes and official results | Replay, evidence, adaptation, placement/review and simulation | Dev 3 |
| Dev 3 | Transport/contracts, dashboard, progress, rewards and analytics UI | Content/generation, cache/LLM/fallback, rewards and jobs | Dev 2 |
| Dev 4 | Student courses/path and admin course editor | Course model, enrollments, publication and course/session integration | Dev 1 |
| Dev 5 | Shared shells, forum, certificates and remaining admin screens | Forum, certificates/PDF, release verification and operations | Dev 4 |

Every developer writes meaningful tests and supplies verification for their own work. Dev 5 coordinates common acceptance; that does not make them responsible for all testing.

| Developer | Frontend tasks | Estimated feature effort | Review/integration/buffer | Assumed capacity |
| --- | --- | --- | --- | --- |
| Dev 1 | FE-01, FE-04, FE-09, FE-14, FE-19, FE-24, FE-29 | 30 h | 10 h | 40 h |
| Dev 2 | FE-05, FE-10, FE-15, FE-20, FE-25, FE-30, FE-34 | 31 h | 9 h | 40 h |
| Dev 3 | FE-02, FE-06, FE-11, FE-16, FE-21, FE-26, FE-31 | 31 h | 9 h | 40 h |
| Dev 4 | FE-07, FE-12, FE-17, FE-22, FE-27, FE-32, FE-35 | 32 h | 8 h | 40 h |
| Dev 5 | FE-03, FE-08, FE-13, FE-18, FE-23, FE-28, FE-33 | 31 h | 9 h | 40 h |

The forecast is **155 feature hours plus 45 team hours for review, integration, fixes and contingency**. It assumes five focused eight-hour days, reusable existing screens and prompt contract decisions. Availability has not been confirmed. Re-estimate after the first working demo; retain unresolved work openly rather than quietly dropping required features.

## 4. How the team works together

1. Agree a feature's requests, responses, component props and any schema change before connecting both sides.
2. Preserve existing teammate work. Use focused branches and PRs; integrate small changes daily.
3. Give each task one owner and one reviewer. A dependency means the named contract/behavior must be ready for integration; page work can begin against an explicitly reviewed fixture contract.
4. Run checks that actually include the new files. The integration wrapper currently names only two test files; update discovery when adding suites.
5. Keep a short record of actual results, blockers and the next integration step. A screenshot or placeholder is not implementation evidence.

Dev 5 also verifies one fresh teammate clone and the latest GitHub Actions run, recording the tested commit and failures separately from local checks. Track this under FE-33; it is verification of existing setup, not a request to rebuild it.

In the tasks below, a **contract** is an agreed request/response or function shape; a **fixture** is controlled development/test data; a **DTO** is an API data shape. A **pure function** takes explicit inputs and returns a result without database/network access or hidden clock/random inputs.

### Shared files need coordination

| Shared files | Coordinator | Rule |
| --- | --- | --- |
| Root/client/shared manifests and root `package-lock.json` | Dev 1 | One dependency change at a time; install from root; preserve the historical client lockfile until handoff |
| `client/src/App.jsx`, `main.jsx`, `app/router.jsx`, `app/providers.jsx`, `app/queryClient.js` | Dev 1 | Other owners supply route/provider needs; avoid competing app rewrites |
| `client/src/api/client.js`, `lib/queryKeys.js`, shared DTO exports | Dev 3, reviewed by Dev 1 | One transport; coordinated contracts; export only implemented modules |
| `client/src/index.css`, shared shells and icons | Dev 5 | Reuse semantic utilities; keep one styling entry point |
| Existing dictionaries and preference Context | Dev 1 | Feature owners provide message keys and reviewed Arabic wording; preserve existing implementation |
| `client/src/features/auth/AuthPages.jsx` | Dev 1 | Coordinate public certificate UI with Dev 5 |
| `server/prisma/schema.prisma`, migrations and server route assembly | Dev 1 plus affected domain owner | Review compatibility and serialize conflicting changes |
| `server/src/modules/sessions/service.js`, `stats/service.js` | Dev 2 with Dev 4 for course effects | One authoritative lifecycle and transaction for all participating updates |

The most important shared design deliverable is the **course/enrollment/session data and API contract**. It must cover version ownership, lesson eligibility, evidence transfer and completion rules without pretending the final Prisma schema is already agreed.

Use the existing Node server test runner and CI while resolving the SRS table's Vitest discrepancy with the team. Select executable frontend/browser tooling deliberately rather than replacing working server infrastructure as part of page integration.

## 5. Frontend schedule: 19-23 October

These are proposed work blocks around the confirmed deadline. Available time on 16-18 October can bring preparation forward. Do not assume every teammate is available on every listed date.

| Date | Team checkpoint | Main tasks |
| --- | --- | --- |
| 19 October | Baseline preserved; routing/transport/props and first course contracts agreed | FE-01, FE-02, FE-03, FE-05; begin FE-04, FE-07, FE-15, FE-26 |
| 20 October | Real account → practice assignment → submit/result integration underway | FE-04, FE-09, FE-10, FE-15; dashboard/history/course/forum/certificate screens |
| 21 October | All required page groups reachable, including admin authoring | Profile/preferences, modes/results, rewards/analytics, course editor and remaining admin forms |
| 22 October | Feature freeze; fix failures and theme/language/device issues | Finish authoring/moderation, verify fixtures/transport, FE-24, FE-30, FE-32 |
| **23 October** | Five owners demonstrate and accept their areas; backend handoff complete | FE-29, FE-31, FE-33, FE-34, FE-35 |

Each developer follows the ordered tasks in their own group below. The typing integration depends on FE-01/FE-02, the account/session boundary, recorder alignment and the official-result response. Course work can proceed against agreed contracts while its backend remains pending.

## 6. Detailed frontend tasks

There are **35 frontend tasks: seven per developer**. Reuse existing screens and behavior. A file named below may already work or may be a comment-only placeholder; inspect it before editing. Implement a placeholder before importing it. Keep JavaScript/JSX, Tailwind, English desktop QWERTY typing and English/LTR exercise regions within the Arabic shell.

Every feature owner supplies loading, empty, error, retry and permission states; interface message keys and reviewed Arabic wording; and the relevant browser checks. No frontend task directly changes Prisma. The schema note on each task identifies a contract boundary to coordinate, not authorization to change the database.

### Shahd - Accounts, app integration and preferences

#### FE-01 — Integrate the existing app and navigation foundation

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 5 h
- **Dependencies:** teammate handoff/baseline review.
- **Requirements:** SYS-6, 53–56; architecture frontend flow.

**Files to work in**

- Extend `client/src/App.jsx`, `client/src/main.jsx`, `client/package.json`, root `package.json` / `package-lock.json` only if needed
- Implement `client/src/app/router.jsx`, `client/src/app/providers.jsx`, `client/src/app/queryClient.js`, `client/src/app/ErrorBoundary.jsx`, `client/src/components/RequireAuth.jsx`, `client/src/components/RequireRole.jsx`.

**Steps**

1. Inventory existing screens/props and incoming teammate commits; agree routing/query/forms packages from the target stack and declare the client dependency on `@typeflow/shared` when consumed; integrate existing components behind public/Student/Admin routes.
2. Replace demo identity on the real app path with loading/anonymous/authenticated states.
3. Preserve presentation providers and active-session lifetime.
4. Coordinate all route registrations; no placeholder imports.

**Done when**

- Direct URL/reload/back navigation works
- Anonymous and wrong-role routes are guarded
- Logout clears protected data
- Runtime errors have a useful recovery view. Guards do not replace server permissions.

**Contract/schema note:** public user DTO consumed, no database change.

#### FE-04 — Connect registration, login, logout and session restoration

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 5 h
- **Dependencies:** FE-01, FE-02.
- **Requirements:** SYS-1–8, 48–49.

**Files to work in**

- Extend `client/src/features/auth/AuthPages.jsx`
- Implement `client/src/api/auth.js`, `client/src/context/AuthContext.jsx`, `client/src/hooks/useAuth.js`
- Coordinate route guards/providers from FE-01.

**Steps**

1. Connect existing forms to migrated auth endpoints; normalize displayed roles from canonical DTOs.
2. Restore authentication through `/auth/me`, keep CSRF in session memory, and handle unverified/inactive/expired sessions with safe feedback.
3. Logout clears private query/cache state.
4. Remove simulated login success from the real path.

**Done when**

- Real register/verify/login/logout flow works with Mailpit
- Reload restores the account
- Failed login never grants access
- Role-specific navigation is correct.

**Contract/schema note:** consume current auth DTO; no new stored fields.

#### FE-09 — Complete verification and password-recovery pages

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 3 h
- **Dependencies:** FE-04.
- **Requirements:** SYS-3, 5, 8, 48.

**Files to work in**

- Extend `client/src/features/auth/AuthPages.jsx`
- Implement `client/src/features/auth/pages/VerifyEmailPage.jsx`, `client/src/features/auth/pages/ForgotPasswordPage.jsx`, `client/src/features/auth/pages/ResetPasswordPage.jsx`
- Extend `client/src/api/auth.js` and route registration through FE-01.

**Steps**

1. Verification success/expired/used token and resend flow; generic reset request acknowledgement; reset form with invalid/expired token, confirmation and subsequent login.
2. Token URL handling must avoid logging tokens or treating them as analytics data.

**Done when**

- Mailpit links land on the right page
- Token failure is recoverable
- Known/unknown emails show the same request acknowledgement
- Reset does not leave a stale authenticated account.

**Contract/schema note:** reuse current auth requests, not the draft example's alternate reset field names.

#### FE-14 — Connect profile, timezone, password and deletion forms

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 4 h
- **Dependencies:** FE-04, FE-09.
- **Requirements:** SYS-9, 34, 48, 56.

**Files to work in**

- Extend `client/src/features/profile/ProfileView.jsx`
- Implement `client/src/features/profile/hooks/useProfile.js`, `client/src/api/users.js`
- Use shared auth/user validation where implemented.

**Steps**

1. Populate and partially update real profile fields, validate timezone, show confirmed save state and password-change reauthentication.
2. Deletion requires the current backend password confirmation and explains loss of personal records.
3. Respect last-admin errors; do not clear local state before a failed server delete.

**Done when**

- Independent fields survive partial edits
- Invalid timezone/password and failed save are recoverable
- Password change clears stale auth
- Delete denial retains account UI.

**Contract/schema note:** consume current camelCase DTO and prototype bounds while policy remains pending.

#### FE-19 — Persist appearance, interface locale and accessibility preferences

- **Owner:** Dev 1
- **Reviewer:** Dev 2
- **Estimate:** 4 h
- **Dependencies:** FE-04, FE-14.
- **Requirements:** SYS-53–56; SRS 10.5.

**Files to work in**

- Extend existing `client/src/context/PreferencesContext.jsx`, `client/src/context/preferences.js`, `client/src/components/controls/AppearanceSelector.jsx`, `client/src/components/controls/LanguageSelector.jsx`, profile UI and `client/src/api/users.js`
- Preserve existing dictionary/translation implementation.

**Steps**

1. Visitor allowlisted local choices; account values/defaults win at sign-in; save partial preferences without overwriting unrelated fields.
2. Restore confirmed state and offer retry on failure.
3. On logout clear account-scoped cache and restore visitor resolution.
4. Appearance/locale are independent of learning policy/timezone.

**Done when**

- System follows device changes, explicit choice overrides
- Login/logout/reload and failed partial save work
- Active recorder/assignment stays unchanged.

**Contract/schema note:** existing preference enums/DTO; no new learning settings.

#### FE-24 — Finish public landing/navigation and certificate-verification host

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 3 h
- **Dependencies:** FE-03, FE-04, FE-13 props agreement.
- **Requirements:** SYS-38, 53–55.

**Files to work in**

- Extend `client/src/features/auth/AuthPages.jsx`, `client/src/components/layout/PublicHeader.jsx` only through Dev 5 coordination
- Register public routes in `client/src/app/router.jsx`.

**Steps**

1. Reuse landing/auth visual work, correct real auth-aware calls to action, direct recovery/verification links and certificate lookup.
2. Host Dev 5's verification data/actions through agreed props/hooks without a second public verification implementation.
3. Confirm phone navigation and anonymous states.

**Done when**

- Public pages work without a fake user
- Certificate links open directly
- Auth redirects preserve safe return targets
- English/Arabic navigation and both themes work.

**Contract/schema note:** consume current auth and proposed public certificate DTOs.

#### FE-29 — Accept account/public/preferences frontend flows

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 6 h
- **Dependencies:** FE-04, FE-09, FE-14, FE-19, FE-24, FE-26.
- **Requirements:** SYS-1–9, 48–49, 53–56.

**Files to work in**

- Add `client/tests/e2e/account.spec.js`, `client/tests/e2e/preferences.spec.js`
- Update `docs/testing.md` and `docs/development.md` with actual evidence, preserving protected context/design paths.

**Steps**

1. Exercise real account lifecycle and account/visitor preference precedence, failure/retry, logout cleanup and cross-account query isolation.
2. Run English/Arabic and both themes on desktop/phone; check keyboard/focus/error announcements.
3. Verify form/token messages do not disclose secrets or account existence.

**Done when**

- Reproducible browser checks pass, or remaining defects are linked and open. Record browser/version, date, test command and live/fixture boundary.

**Contract/schema note:** none; any DTO defect becomes a coordinated issue rather than a silent browser workaround.

### Merna - Typing, tests and official results

#### FE-05 — Agree the typing assignment/event/result adapter

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 4 h
- **Dependencies:** FE-02.
- **Requirements:** SYS-10, 15, 30, 50.

**Files to work in**

- Implement `client/src/api/sessions.js`
- Extend `packages/shared/src/session.js` with agreed response schemas and `client/src/features/typing/engine/keystrokeRecorder.js` only for necessary boundary adaptation
- Add `client/src/features/typing/engine/sessionPayload.js` if a separate adapter makes the boundary clearer.

**Steps**

1. Map current server `text`/`source`/rules to existing component props.
2. Emit the strict body `{events, finishTimeMs}`; session ID stays in the URL.
3. Never submit client scores, expected keys or correctness flags.
4. Separate display mode labels from machine mode values.
5. Document future mode fields as draft.

**Done when**

- A captured practice payload passes the shared schema and real server
- Extra recorder metadata is excluded
- Exact assignment text is unchanged.

**Contract/schema note:** frontend/server wire agreement; preserve compatible practice payloads.

#### FE-10 — Implement owned-session lifecycle hooks and recovery

- **Owner:** Dev 2
- **Reviewer:** Dev 1
- **Estimate:** 5 h
- **Dependencies:** FE-04, FE-05.
- **Requirements:** SYS-13, 15, 31–32, 46, 50.

**Files to work in**

- Implement `client/src/features/typing/hooks/useTypingSession.js`, `client/src/features/typing/hooks/useSubmitSession.js`
- Extend `client/src/api/sessions.js`, existing `client/src/features/typing/pages/TypingSessionPage.jsx`, `client/src/features/result/OfficialResult.jsx` only at lifecycle boundaries.

**Steps**

1. Start from server assignment, fetch owned status/result, abandon/restart through server, and model ready/typing/paused/submitting/retry/completed states.
2. Freeze the accepted submission payload for retry.
3. Do not regenerate finish time or events after an uncertain response.
4. A recovered saved result must not replay rewards as new.

**Done when**

- Real practice saves
- Dropped response then identical retry returns the saved result
- Conflicting retry and expired/abandoned attempts are explained
- No duplicate session on ordinary render.

**Contract/schema note:** current assignment/result shapes plus separately reviewed future mode extensions.

#### FE-15 — Integrate and verify the existing recorder/reducer

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 5 h
- **Dependencies:** FE-05, FE-10 interfaces.
- **Requirements:** SYS-10–14, 30; SRS section 8.

**Files to work in**

- Extend `client/src/features/typing/engine/keystrokeRecorder.js`, `client/src/features/typing/engine/typingReducer.js`, `client/src/features/typing/engine/liveMetrics.js`, existing `client/src/features/typing/pages/TypingSessionPage.jsx`, `client/src/features/typing/components/TypingStage.jsx`, `client/src/features/typing/components/KeyboardGuide.jsx`
- Implement `client/src/features/typing/hooks/useTypingRecorder.js`
- Consume `packages/shared/src/metrics.js`.

**Steps**

1. Retain correct capture behavior; reconcile monotonic start, correction accounting, end-of-buffer editing, repeat/paste/drop/bulk input and pause spans.
2. Use shared formulas and unavailable denominators.
3. Keep English text/keyboard LTR and only capture inside the exercise.
4. Keep state stable across appearance, locale and resize changes; test fake clock inputs around zero.

**Done when**

- Correction/pause/repeat/Shift/boundary fixtures agree with server replay
- Paste does not enter events
- No browser result is called official
- Presentation changes preserve the exact event sequence and assigned text.

**Contract/schema note:** event compatibility preserved; no extra wire fields.

#### FE-20 — Complete timed/certified test setup and mode controls

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 5 h
- **Dependencies:** FE-10, FE-15; approved/draft mode contract explicitly labelled.
- **Requirements:** SYS-13, 31, 36–38, 50.

**Files to work in**

- Extend `client/src/features/tests/TestsView.jsx`, `client/src/features/typing/pages/TypingSessionPage.jsx`
- Implement `client/src/features/tests/hooks/useTests.js`
- Extend `client/src/api/sessions.js` and mode-related shared schemas when agreed.

**Steps**

1. Timed durations from SRS; certified duration/eligibility supplied by server policy, not hardcoded candidates.
2. No pause in assessment modes; focus loss continues time; certified focus loss follows the agreed integrity-event contract.
3. Countdown waits for assigned text.
4. Exhausted text is a content error; restart abandons and requests a new assignment.

**Done when**

- Deterministic deadline/focus/no-pause/text-exhaustion states work
- Reduced-pressure display does not stop timing
- Unsupported real API mode shows unavailable rather than falling back to practice.

**Contract/schema note:** draft mode rules/focus-report contract, final server behavior BE-04.

#### FE-25 — Display authoritative results and safe submit recovery

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 4 h
- **Dependencies:** FE-10, FE-15, FE-16 reward interface.
- **Requirements:** SYS-30–32, 35, 46–47, 64.

**Files to work in**

- Extend `client/src/features/result/OfficialResult.jsx`, existing `client/src/features/typing/pages/TypingSessionPage.jsx`
- Implement/finish `client/src/features/typing/hooks/useSubmitSession.js`
- Coordinate cache invalidation with Dev 3 and course effects with Dev 4.

**Steps**

1. Display separately labelled gross/net WPM and raw/final accuracy from the saved response; show key/evidence/reward/recommendation/course effects only when returned.
2. Explain saving, rejected submission, uncertain network result, retry and fetched saved result.
3. Clear provisional vs official distinction.

**Done when**

- Corrected error retains lower raw accuracy
- No local calculation awards mastery/certificate
- Repeated response does not repeat notifications
- Retry preserves frozen events/finish time.

**Contract/schema note:** agreed official-result DTO, current prototype extras retained or versioned explicitly.

#### FE-30 — Finish typing viewport, accessibility and stability states

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 3 h
- **Dependencies:** FE-15, FE-20, FE-25.
- **Requirements:** SYS-11–14, 53–55; SRS 10.2.

**Files to work in**

- Extend existing typing components/page/hooks and `client/src/components/layout/DeviceGuidance.jsx` through Dev 5
- Shared CSS changes through Dev 5 only.

**Steps**

1. Non-colour error cues, large text, reduced motion/pressure, focus controls and English/LTR keyboard geometry within Arabic shell.
2. Keep recorder mounted when an active viewport narrows; show guidance while preserving mode timing.
3. Block phone initiation before a scored assignment is created.

**Done when**

- Resize/theme/locale/menu/focus scenarios preserve assignment/event buffer
- Practice pauses and tests continue according to mode
- Keyboard-only controls remain reachable.

**Contract/schema note:** none; no new device or touch-input support.

#### FE-34 — Accept typing correctness, retry and input performance

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 5 h
- **Dependencies:** FE-10, FE-15, FE-20, FE-25, FE-30, FE-26.
- **Requirements:** SYS-10–15, 30–32, 46–47, 50; SRS 10.1.

**Files to work in**

- Add `client/tests/e2e/typing.spec.js`, `client/tests/e2e/session-retry.spec.js`
- Add focused shared/recorder tests to the agreed executable runner
- Update `docs/testing.md`.

**Steps**

1. Real practice → official result/history; deterministic event cases for every mode's UI; lost response, identical/conflicting retry, expired assignment, no-pause/focus rules and presentation/resize stability.
2. Measure scripted five-minute input-to-display behavior with environment/method recorded.

**Done when**

- Real core loop and retry pass
- No dropped accepted events in measured input test
- Report observed p95 against SRS instead of asserting target success
- Unsupported server modes stay API-blocked.

**Contract/schema note:** none; no heuristic is presented as proof of human typing.

### Mahmoud - Data access, progress, rewards and analytics

#### FE-02 — Establish shared transport and frontend contract boundaries

- **Owner:** Dev 3
- **Reviewer:** Dev 1
- **Estimate:** 4 h
- **Dependencies:** current API inspection, FE-01 package agreement.
- **Requirements:** SYS-6, 30–31, 49, 56, 57–64 boundary contracts.

**Files to work in**

- Implement `client/src/api/client.js`, `client/src/lib/queryKeys.js`
- Extend `packages/shared/src/auth.js`, `packages/shared/src/session.js`, `packages/shared/src/index.js`
- Propose/add missing shared DTO modules only as reviewed by the feature owners. Update `docs/api-contract.md` with field status.

**Steps**

1. Send credentialed requests, serialize only agreed fields, map safe error codes and handle 401/403/409/422/429/network failures.
2. Obtain CSRF from real login/me responses; do not persist JWTs in local storage.
3. Namespace query keys by authenticated owner and filters.
4. Agree future DTOs with backend owners; keep draft, implemented and verified shapes distinct.

**Done when**

- One real authenticated write succeeds and missing CSRF fails
- Known/unknown field behavior matches schemas
- Unavailable future endpoints are distinguishable from empty data.

**Contract/schema note:** runtime DTO proposals, not final Prisma models.

#### FE-06 — Connect the student dashboard

- **Owner:** Dev 3
- **Reviewer:** Dev 4
- **Estimate:** 4 h
- **Dependencies:** FE-02, FE-04; launch integration FE-10.
- **Requirements:** SYS-18, 22–23, 33–35.

**Files to work in**

- Extend `client/src/features/dashboard/Dashboard.jsx`
- Implement `client/src/features/dashboard/hooks/useDashboard.js`, `client/src/api/path.js`, `client/src/api/progress.js` as needed
- Coordinate query keys with FE-02.

**Steps**

1. Consume real `/dashboard` data, recommended mode/reason, recent sessions and goal/streak information.
2. Use factual unknown/empty states.
3. Future course resume cards use reviewed fixtures until their API exists; do not invent a resume target or mastery value.
4. Launch through the owned-session hook.

**Done when**

- New/returning accounts, loading, no-history and server-error views work
- Refresh after submit shows server data
- Presentation state changes do not reset an active session.

**Contract/schema note:** dashboard DTO, with explicit future optional course fields.

#### FE-11 — Connect progress, heat map and history filters

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 5 h
- **Dependencies:** FE-02, FE-04, FE-06.
- **Requirements:** SYS-17, 23, 33.

**Files to work in**

- Extend `client/src/features/progress/ProgressView.jsx`
- Implement `client/src/features/progress/hooks/useProgress.js`, `client/src/api/progress.js`
- Extend relevant query keys and add shared `packages/shared/src/stats.js` DTO proposal only with boundary review.

**Steps**

1. Consume current progress data, show key evidence without turning missing latency into zero, and provide accessible table alternatives.
2. Define future pagination and mode/difficulty/time filters against agreed draft contracts.
3. Never compare assessment and learning scores as a single unlabeled trend.

**Done when**

- Real current history renders
- Sparse/no-data/error states are honest
- Future filters use validated fixtures until implemented
- Switching accounts clears previous private data.

**Contract/schema note:** reporting DTO/units; no frontend database assumptions.

#### FE-16 — Complete achievements and reward notifications

- **Owner:** Dev 3
- **Reviewer:** Dev 5
- **Estimate:** 4 h
- **Dependencies:** FE-02, FE-10, reward DTO agreement.
- **Requirements:** SYS-34–35, 46.

**Files to work in**

- Extend `client/src/features/achievements/AchievementsView.jsx`
- Implement `client/src/features/gamification/components/RewardNotifications.jsx`, `client/src/features/gamification/hooks/useGamification.js`, `client/src/api/gamification.js`, `client/src/context/RewardsContext.jsx`, `client/src/hooks/useRewards.js` only if the cross-page state is needed.

**Steps**

1. Display official XP/level/goal/streak events and earned/unearned badges; deduplicate notifications by server event identity.
2. Use captured policy values/units, not Figma examples.
3. Keep animations accessible and outside active typing.
4. Placement does not display earned rewards.

**Done when**

- Real basic reward summary renders
- Retry/recovered result does not celebrate twice
- Unknown badge policy uses explicit fixture/unavailable state
- Timezone labels and goal units are clear.

**Contract/schema note:** reviewed reward DTO; formulas remain backend/versioned settings.

#### FE-21 — Complete admin analytics screens

- **Owner:** Dev 3
- **Reviewer:** Dev 1
- **Estimate:** 5 h
- **Dependencies:** FE-02, FE-03, analytics DTO agreement.
- **Requirements:** SYS-44–45.

**Files to work in**

- Implement `client/src/features/admin/components/AnalyticsPanel.jsx`
- Extend `client/src/features/admin/hooks/useAdmin.js`, `client/src/api/admin.js` through coordinated feature exports.

**Steps**

1. Usage/active-user/session metrics, comparable speed/accuracy breakdown, problem keys and generation pass/fallback rates.
2. Show reporting window, denominator and unavailable values; paginate large detail views and supply accessible chart alternatives.
3. Avoid displaying private raw logs.

**Done when**

- Zero denominators are unavailable rather than perfect rates
- Empty/error/window changes work
- Mixed modes are not presented as a misleading combined learning trend.

**Contract/schema note:** draft analytics DTO and filter contract, real aggregates BE-22.

#### FE-26 — Supply schema-valid development fixtures and test execution

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 4 h
- **Dependencies:** FE-02 and per-feature contracts; start early, finish after page contracts settle.
- **Requirements:** contract consistency across all frontend features.

**Files to work in**

- Add `client/src/dev/fixtures.js`, `client/src/dev/fixtures.test.js` or feature fixtures when size warrants
- Extend `client/package.json`, root `package.json`, lint config and CI only through Dev 1's shared-file queue
- Add browser configuration after tooling agreement.

**Steps**

1. Create validated success/empty/error/permission/version-conflict/sparse-evidence fixtures for missing APIs.
2. One explicit development adapter supplies them; feature components still use the real transport boundary.
3. Test that production cannot enable fake authentication or silently serve fixture success.
4. Arrange actual commands to discover/run added frontend/shared checks.

**Done when**

- Invalid fixture fails validation
- Production build cannot activate fixture transport
- Demonstrated live vs fixture flows are listed
- New checks visibly execute rather than sitting in unreferenced files.

**Contract/schema note:** schema consumers, no speculative database structure.

#### FE-31 — Accept dashboard/progress/reward/analytics frontend flows

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 5 h
- **Dependencies:** FE-06, FE-11, FE-16, FE-21, FE-26.
- **Requirements:** SYS-17–18, 22–23, 33–35, 44.

**Files to work in**

- Add `client/tests/e2e/progress.spec.js`, `client/tests/e2e/rewards.spec.js`, `client/tests/e2e/analytics.spec.js`
- Update `docs/testing.md` with results.

**Steps**

1. Verify empty/sparse evidence, filter changes, unknown denominators, distinct modes, accessible data alternatives, reward deduplication and account data isolation.
2. Check current migrated API responses separately from future fixtures.
3. Measure and fix needless polling/rerenders during active typing.

**Done when**

- Dashboard/progress current paths use real data
- Future reports are labelled fixture/API-blocked
- Reward retry checks pass
- No translation/appearance change modifies data filters or learning policy.

**Contract/schema note:** none; contract discrepancies are tracked.

### Jonathan - Courses, learning paths and course authoring

#### FE-07 — Build course library, detail and My Courses pages

- **Owner:** Dev 4
- **Reviewer:** Dev 3
- **Estimate:** 4 h
- **Dependencies:** FE-02, FE-03; reviewed course DTO proposal.
- **Requirements:** SYS-57–58, 61.

**Files to work in**

- Implement `client/src/features/courses/pages/CourseLibraryPage.jsx`, `client/src/features/courses/pages/CourseDetailPage.jsx`, `client/src/features/courses/pages/MyCoursesPage.jsx`, `client/src/features/courses/components/CourseCard.jsx`, `client/src/features/courses/components/CourseFilters.jsx`, `client/src/features/courses/hooks/useCourses.js`, `client/src/api/courses.js`
- Coordinate routes through Dev 1.

**Steps**

1. Published catalog search/filter, objectives/prerequisites/path preview, enrollment pending/error/duplicate response and resume link.
2. Drafts never appear in student fixture sets.
3. Keep course version/enrollment IDs opaque; forms do not derive progress from local clicks.

**Done when**

- Published/empty/search-no-match/archived/enrollment-error cases are reviewable in desktop/mobile and both UI languages. Fixture demonstration is labelled frontend-only.

**Contract/schema note:** draft catalog/enrollment DTOs; exact database uniqueness remains BE-02/11 decisions.

#### FE-12 — Build resumable course path and lesson detail UI

- **Owner:** Dev 4
- **Reviewer:** Dev 2
- **Estimate:** 5 h
- **Dependencies:** FE-07, FE-10, course path contract.
- **Requirements:** SYS-58–61, 64.

**Files to work in**

- Implement `client/src/features/courses/pages/CoursePathPage.jsx`, `client/src/features/courses/components/CoursePath.jsx`, `client/src/features/courses/components/LessonNode.jsx`, `client/src/features/courses/hooks/useCoursePath.js`
- Extend existing `client/src/features/learning-path/LearningPath.jsx` through reuse, not a competing keyboard map
- Extend `client/src/api/courses.js` and `client/src/api/sessions.js` by agreement.

**Steps**

1. Display locked/available/in-progress/completed/placement-exempt nodes and reason text; resume the server-selected action.
2. Keep course progress distinct from shared key mastery.
3. Launch with owned enrollment/lesson context; selecting a different course cannot mutate a running assignment.

**Done when**

- Novice/experienced/sparse evidence paths, unmet prerequisites, failed start and resume states work
- A finished exercise does not locally mark a lesson completed.

**Contract/schema note:** draft path/session context DTOs; version ownership remains server-controlled.

#### FE-17 — Complete placement, keyboard map and review entry UI

- **Owner:** Dev 4
- **Reviewer:** Dev 2
- **Estimate:** 4 h
- **Dependencies:** FE-10, FE-12 path interfaces.
- **Requirements:** SYS-16–23, 60–61.

**Files to work in**

- Implement `client/src/features/placement/PlacementPage.jsx`, `client/src/features/placement/hooks/usePlacement.js`, `client/src/features/review/ReviewPage.jsx`, `client/src/features/review/hooks/useReviews.js`, `client/src/features/courses/components/CourseEntryCheck.jsx`
- Reuse `client/src/features/learning-path/LearningPath.jsx`, `client/src/api/path.js`, `client/src/api/sessions.js`.

**Steps**

1. First-entry optional placement/skip, later resume and targeted-check invitation; due reviews with insufficient-evidence explanations.
2. Allow approved beginner entry when placement is declined; do not unlock advanced prerequisites locally.
3. Use the common session launch and explicit mode rules.

**Done when**

- Novice, skipped placement, reused evidence, weak review and insufficient coverage states are distinct
- No repeat placement on every login
- Placement gives no mastery/XP/course-completion message.

**Contract/schema note:** draft placement/review/path DTOs pending backend policy gates.

#### FE-22 — Complete admin course list and metadata/unit editor

- **Owner:** Dev 4
- **Reviewer:** Dev 5
- **Estimate:** 5 h
- **Dependencies:** FE-07, FE-18 admin-shell contract.
- **Requirements:** SYS-58, 62.

**Files to work in**

- Implement `client/src/features/admin/courses/pages/AdminCoursesPage.jsx`, `client/src/features/admin/courses/pages/CourseEditorPage.jsx`, `client/src/features/admin/courses/components/CourseMetadataForm.jsx`, `client/src/features/admin/courses/components/UnitEditor.jsx`, `client/src/features/admin/courses/hooks/useAdminCourses.js`, `client/src/api/adminCourses.js`.

**Steps**

1. Draft list, create/edit metadata, objective/entry requirement fields, ordered units and version labels.
2. Published content opens read-only or creates a successor draft.
3. Preserve dirty-form state; surface stale-edit conflicts instead of silently overwriting another author.

**Done when**

- Draft/published/archived states, invalid fields, unsaved changes and save conflict are clear
- Student navigation never exposes drafts.

**Contract/schema note:** draft authoring/edit-version contracts; actual immutable publication BE-12.

#### FE-27 — Complete lesson authoring, preview, validation and publication UI

- **Owner:** Dev 4
- **Reviewer:** Dev 3
- **Estimate:** 6 h
- **Dependencies:** FE-22, FE-12, FE-23 content contract.
- **Requirements:** SYS-58–59, 62–63.

**Files to work in**

- Implement `client/src/features/admin/courses/components/LessonEditor.jsx`, `client/src/features/admin/courses/components/PublishCourseDialog.jsx`, `client/src/features/admin/courses/pages/CoursePreviewPage.jsx`
- Extend `client/src/features/admin/courses/pages/CourseEditorPage.jsx`, `client/src/features/admin/courses/hooks/useAdminCourses.js`, `client/src/api/adminCourses.js`.

**Steps**

1. Edit lesson prerequisites, shared skill objectives, allowed modes/difficulty/characters/content references and approved completion policy fields.
2. Preview novice/experienced paths and validation errors.
3. Confirm publish creates an immutable version; archive prevents new enrollment while preserving existing access.
4. Show stale-edit/publication conflicts.

**Done when**

- Cycle/unreachable lesson/impossible fallback errors identify the affected node
- Preview never issues real rewards
- Published version stays read-only
- No arbitrary LMS/video/game authoring is added.

**Contract/schema note:** draft course publication/validation DTOs; final model BE-02/12.

#### FE-32 — Finish course and authoring responsive/localisation states

- **Owner:** Dev 4
- **Reviewer:** Dev 1
- **Estimate:** 3 h
- **Dependencies:** FE-07, FE-12, FE-17, FE-22, FE-27.
- **Requirements:** SYS-53–55, 57–64 presentation.

**Files to work in**

- Extend existing student/admin course components and hooks
- Supply new interface keys to Dev 1 for `client/src/i18n/dictionaries/en.json` and `client/src/i18n/dictionaries/ar.json`.

**Steps**

1. Arabic shell, stable English key/pair/content strings, long titles, phone path/editor reflow, keyboard lesson ordering/controls, focus restoration and readable validation summaries.
2. Course metadata stays authored content rather than machine translation.

**Done when**

- Catalog/path/editor/preview/confirmation screens work at 320–430px and supported desktop sizes
- No phone scored typing starts
- No lesson objective or assignment changes with locale/theme.

**Contract/schema note:** none; message codes/parameters must match agreed reason DTO.

#### FE-35 — Accept course frontend and publish the backend handoff

- **Owner:** Dev 4
- **Reviewer:** Dev 5
- **Estimate:** 5 h
- **Dependencies:** FE-07, FE-12, FE-17, FE-22, FE-27, FE-32, FE-26.
- **Requirements:** SYS-57–64; all frontend page inventory.

**Files to work in**

- Add `client/tests/e2e/courses.spec.js`, `client/tests/e2e/course-authoring.spec.js`
- Update `docs/testing.md`, `docs/api-contract.md`, `docs/development.md`, and this plan's task status when evidence exists.

**Steps**

1. Demo library → enroll → optional entry check → lesson → returned progress, plus admin draft → preview → validate → publish → archive.
2. Check separate enrollments/shared skills, current vs successor version, no duplicate reward and no certificate from course completion using reviewed fixtures.
3. Assemble all five owners' acceptance/defect/API-blocked lists.

**Done when**

- All frontend tasks have evidence or open defects
- Real vs fixture status is explicit
- Backend owners receive schemas, sample/error payloads, UI field needs and unresolved choices. A frontend demo does not mark course backend implemented.

**Contract/schema note:** freeze the frontend contract revision for BE-01; later changes follow section 8.

### Giovanni - Shared UI, forum, certificates and administration

#### FE-03 — Complete reusable shells and common interface states

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 4 h
- **Dependencies:** FE-01 route/props agreement.
- **Requirements:** SYS-11, 53–55.

**Files to work in**

- Extend `client/src/components/layout/PublicHeader.jsx`, `client/src/components/layout/StudentShell.jsx`, `client/src/components/layout/DeviceGuidance.jsx`, `client/src/components/ui/Icons.jsx`, `client/src/index.css`
- Implement `client/src/components/layout/AdminShell.jsx`, `client/src/components/Loading.jsx`, `client/src/components/EmptyState.jsx`, `client/src/components/ErrorMessage.jsx`, `client/src/components/ConfirmDialog.jsx` in their existing scaffold locations.

**Steps**

1. Retain existing visual system; add consistent loading, retry, empty and confirmation states.
2. Complete responsive navigation, focus return, dialog keyboard behavior and semantic landmarks.
3. Admin navigation uses the same authorized actions on mobile.
4. Keep device guidance independent of server assignment creation.

**Done when**

- Keyboard-only public/Student/Admin navigation works
- Dialogs restore focus
- 320px pages avoid page-wide overflow
- Dark/RTL variants remain legible.

**Contract/schema note:** none; component props agreed with page owners.

#### FE-08 — Complete forum reading and participation UI

- **Owner:** Dev 5
- **Reviewer:** Dev 4
- **Estimate:** 5 h
- **Dependencies:** FE-02, FE-03; forum access/DTO agreement.
- **Requirements:** SYS-39–40.

**Files to work in**

- Extend `client/src/features/forum/ForumView.jsx`
- Implement `client/src/features/forum/hooks/useForum.js`, `client/src/api/forum.js`
- Add feature-local components only when needed to keep the existing view readable.

**Steps**

1. Thread list/detail, pagination, create/reply forms, owner-only accepted-answer controls, reporting, posting failures and hidden/unavailable posts.
2. Render authored text safely; preserve its language.
3. Permission-driven controls come from agreed DTOs and do not imply server authorization.

**Done when**

- Safe text rendering, empty thread, failed reply/retry, one accepted answer and hidden-post states work
- Mobile/RTL actions remain reachable.

**Contract/schema note:** draft forum DTOs; public reading policy remains a team gate; no browser-only moderation policy.

#### FE-13 — Complete certificate list, download and verification UI

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 4 h
- **Dependencies:** FE-02, FE-03; certificate consent/policy review.
- **Requirements:** SYS-37–38; SRS 10.4.

**Files to work in**

- Extend `client/src/features/certificates/CertificatesView.jsx`
- Implement `client/src/features/certificates/hooks/useCertificates.js`, `client/src/api/certificates.js`
- Coordinate `PublicCertificateVerification` in `client/src/features/auth/AuthPages.jsx` with Dev 1 under FE-24.

**Steps**

1. List owned records, eligible/not-issued/revoked statuses, PDF loading/failure/retry and public code lookup.
2. Explain consented public fields and the unproctored label.
3. Do not create a certificate from local test metrics or course completion.

**Done when**

- Invalid code, revoked/unavailable code, privacy-safe valid record and failed PDF are demonstrated
- Mobile download/verification remain usable.

**Contract/schema note:** candidate certificate DTO; duration/threshold/name policy and storage finalized in BE-01/20.

#### FE-18 — Complete administration user-management UI

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 4 h
- **Dependencies:** FE-02, FE-03, admin route/access contract.
- **Requirements:** SYS-41, 45, 48–49.

**Files to work in**

- Extend `client/src/features/admin/AdminView.jsx`
- Implement `client/src/features/admin/components/UserManagement.jsx`, `client/src/features/admin/hooks/useAdmin.js`, `client/src/api/admin.js` with Dev 3's transport conventions.

**Steps**

1. User search/pagination, deactivate/delete/create-admin workflows, confirmation and last-active-admin denial.
2. Use safe public/admin DTOs, no token/private keystroke panels.
3. Submit state-changing actions with credentials/CSRF and reflect real returned state.

**Done when**

- Wrong-role UI is inaccessible
- Destructive action failure leaves the record visible with a retry path
- Protected-admin scenarios are represented
- Mobile actions and validation are usable.

**Contract/schema note:** draft admin DTOs; real server authorization/audit remains BE-22.

#### FE-23 — Complete admin content and versioned settings UI

- **Owner:** Dev 5
- **Reviewer:** Dev 3
- **Estimate:** 4 h
- **Dependencies:** FE-18, content/settings contract.
- **Requirements:** SYS-42–43, 45.

**Files to work in**

- Implement `client/src/features/admin/components/ContentManagement.jsx`, `client/src/features/admin/components/SettingsManagement.jsx`
- Extend `client/src/features/admin/hooks/useAdmin.js`, `client/src/api/admin.js` with coordinated exports.

**Steps**

1. Word lists, blocked words, themes/key groups and policy settings forms, validation preview and activate-new-version flow.
2. Distinguish exercise topics from Light/Dark appearance.
3. Show prerequisites/feasibility errors and expected-current-version conflict.
4. Never promise settings changes affect a running assignment.

**Done when**

- Invalid prerequisites, impossible content, stale version and activation failure retain useful input and errors
- Successful fixture activation keeps active-session rules fixed.

**Contract/schema note:** draft content/settings schemas; no approval of numerical defaults.

#### FE-28 — Complete admin moderation, certificate revocation and audit UI

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 4 h
- **Dependencies:** FE-08, FE-13, FE-18.
- **Requirements:** SYS-38, 40, 45.

**Files to work in**

- Implement `client/src/features/admin/components/ForumModeration.jsx`, `client/src/features/admin/components/CertificateManagement.jsx`
- Extend `client/src/features/admin/AdminView.jsx`, `client/src/features/admin/hooks/useAdmin.js`, `client/src/api/admin.js`. Add a feature-local audit panel if needed under `client/src/features/admin/components/`.

**Steps**

1. Report queue, pin/hide/delete actions, certificate revoke confirmation and paginated minimal audit records.
2. Permission failures, stale actions and already-revoked results are explicit.
3. Keep authored text escaped and audit data minimal.

**Done when**

- Ordinary hidden content stays unavailable in student fixtures
- Admin changes show confirmed server/fixture responses only
- No raw keystroke/token data appears
- All required actions remain usable on phones.

**Contract/schema note:** draft moderation/revocation/audit DTOs.

#### FE-33 — Accept supporting/admin frontend flows

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 6 h
- **Dependencies:** FE-03, FE-08, FE-13, FE-18, FE-23, FE-28, FE-26.
- **Requirements:** SYS-38–45, 53–55.

**Files to work in**

- Add `client/tests/e2e/forum.spec.js`, `client/tests/e2e/certificates.spec.js`, `client/tests/e2e/admin.spec.js`
- Update `docs/testing.md`.

**Steps**

1. Complete forum/report/accepted answer, public verification/PDF failure, admin user/content/settings/moderation/revocation/audit journeys.
2. Validate role-based navigation and errors, safe user content, required mobile controls and theme/locale variants.
3. Record unfinished backend routes individually.
4. Verify one fresh teammate clone using the README and inspect the latest remote GitHub Actions run. Record the commit, commands, results and any blocker; do not treat earlier local passes as this evidence.

**Done when**

- Every required supporting/admin page and edge state is reachable, reviewed and tested against its stated live/fixture boundary
- Fresh-clone onboarding and the latest remote CI result are recorded, with unresolved failures left visible
- No action claims real persistence from a fixture.

**Contract/schema note:** none.

## 7. Backend roadmap after frontend acceptance

Start this phase after frontend acceptance, using the existing server and migrated services. Agree each feature's remaining policies and contracts before implementation. This document plans that work; it does not execute it.

Each backend sprint is provisionally five working days with five developers. Estimates below are focused developer-days (one day = eight hours); remaining capacity is review, integration, defects and contingency. Exact calendar dates start after the confirmed frontend acceptance. External provider/hosting choices and software versions are researched when selected, not frozen by this plan.

| Sprint | Dev 1 | Dev 2 | Dev 3 | Dev 4 | Dev 5 | Exit demo |
| --- | --- | --- | --- | --- | --- | --- |
| B1: contracts/data/core | BE-01/02 coordination | BE-03; BE-06 interface design | Begin BE-05, content fixtures | BE-11 design/repository interfaces | BE-10 runner/acceptance foundation; BE-19 contract design | Reviewed contracts and non-destructive migrations; existing real practice preserved |
| B2: adaptive learning | BE-09, begin BE-04 | BE-06, begin BE-07 | Finish BE-05, begin BE-16 | BE-11 implementation | BE-10 core acceptance; begin BE-19 after security contract | Shared evidence and adaptive practice; catalog/enrollment persisted; existing retries preserved |
| B3: modes and course authoring | Finish BE-04, BE-21 | Finish BE-07, BE-08, begin BE-13 | Finish BE-16, BE-17, begin BE-18 | BE-12; BE-14 interface preparation | Finish BE-19; begin BE-20 after mode support | Placement/review/tests and draft/publication workflows; validated live/fallback text |
| B4: atomic course loop and support | BE-22; BE-14 transaction review | Finish BE-13; course evidence cases and evaluation preparation | Finish BE-18; generation/jobs acceptance | BE-14, BE-15 | Finish BE-20; forum/certificate full-flow acceptance | Real course enroll → lesson → atomic resumable progress, rewards, forum, certificates and admin |
| B5: acceptance/release | BE-22 security/privacy closeout | BE-23 evaluation | BE-24 jobs/dependency/performance work | BE-25 course/full-flow regression | BE-24/25 operations and acceptance | All requirements mapped, measured checks, recovery evidence and release decision |

The five-sprint backend forecast is conditional, especially on approved course objectives, trained-model requirement and available providers. If the rubric needs model training, add an explicit approved workstream and re-estimate before BE-06/23; an LLM API call is not model training.

Backend primary estimates total 74 developer-days: Dev 1 has 17, Dev 2 has 18, Dev 3 has 12, Dev 4 has 11 and Dev 5 has 16. Remaining slots within the 125-day team capacity cover contract/schema review, real frontend API reconnection, cross-feature acceptance, evaluation support, defects and contingency. Dev 3 supports performance/jobs and reward/certificate integration; Dev 4 supports evidence-transfer tests, reviewed course content and frontend reconnection. Every owner reconnects their own frontend area as its APIs become available; FE-accepted tasks are not substitutes for these real-service checks. Unused contingency does not justify extra scope or delaying a finished phase.

### Shared contracts, data and test foundation

#### BE-01 — Agree remaining behavior and complete API contracts

- **Owner:** Dev 1
- **Reviewer:** Dev 4
- **Estimate:** 2 d
- **Dependencies:** frontend handoff FE-35
- **Requirements:** SYS-1–64 as applicable.

**Files to work in**

- `docs/api-contract.md`, `docs/decisions.md`, affected `docs/srs.md` only for authorized policy decisions
- Shared `packages/shared/src/auth.js`, `packages/shared/src/session.js`, and new `packages/shared/src/enums.js`, `packages/shared/src/user.js`, `packages/shared/src/keystroke.js`, `packages/shared/src/modeRules.js`, `packages/shared/src/settings.js`, `packages/shared/src/spec.js`, `packages/shared/src/path.js`, `packages/shared/src/stats.js`, `client/src/api/gamification.js`, `client/src/api/certificates.js`, `client/src/api/forum.js`, `client/src/api/admin.js`, existing course/enrollment placeholders as their contracts become agreed.

**Steps**

1. Agree request/response exports, units, nulls, reason/error codes, role/owner checks, pagination/sorts, start/enrollment retries, limits and compatibility with current practice/auth clients.
2. Resolve only relevant policy gates in section 9; do not invent approval.
3. Domain owners author their schemas; Dev 1 coordinates the record.

**Done when**

- Implemented vs agreed vs draft endpoint matrix is accurate
- Positive/error fixtures parse
- Existing practice/auth contracts remain supported or have an explicit transition plan.

**Contract/schema note:** contracts drive candidate data changes, never the reverse.

#### BE-02 — Review and evolve Prisma additively

- **Owner:** Dev 1
- **Reviewer:** Dev 4
- **Estimate:** 3 d initial review/migration work, later feature migrations included in their tasks
- **Dependencies:** BE-01 boundaries
- **Requirements:** SYS-17, 22, 28, 32, 35, 45–47, 50, 52, 58–64.

**Files to work in**

- `server/prisma/schema.prisma`, new timestamped `server/prisma/migrations/<name>/migration.sql`, `server/prisma/seed.js`, `server/prisma.config.mjs` only if necessary, `docs/development.md`, `docs/architecture.md`.

**Steps**

1. Compare actual existing models/indexes with the candidate matrix in section 8; design constraints, ownership/cascades, immutable references and backfill policy.
2. Preserve old migrations and the forum accepted-answer partial index.
3. Use expand/backfill/verify/contract for breaking changes; do not immediately enforce new non-null fields on legacy rows.

**Done when**

- A fresh isolated database and an upgraded populated fixture database both migrate
- Current auth/practice records survive
- Generation/client tests run
- Restore/application compatibility reviewed.

**Contract/schema note:** deliberately revisable design, not the example names becoming mandatory.

#### BE-09 — Complete profile/security/settings service behavior

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 3 d
- **Dependencies:** BE-01/02
- **Requirements:** SYS-1–9, 41, 43, 45, 48–49, 56.

**Files to work in**

- Extend `server/src/modules/auth/`, `server/src/modules/users/`, `server/src/middleware/auth.js`, `server/src/middleware/rateLimit.js`, `server/src/config/env.js`
- Implement `server/src/modules/settings/service.js`
- Preserve `server/src/modules/settings/starter.js` development policy until replaced by approved versioned settings.

**Steps**

1. Regression-review revocation, one-use tokens, cookie/origin/CSRF, preference merges, admin provisioning/last-admin concurrency and configuration activation.
2. New sessions use active immutable settings; existing sessions keep captured versions.
3. Maintain generic reset/resend responses and no secret logging.
4. Review actual deployment cookie/origin policy later.

**Done when**

- Token reuse/expiry, concurrent last-admin changes, owner/role denial, partial preferences and immutable settings tests pass
- No active assignment changes after settings activation.

**Contract/schema note:** settings activation pointer/audit and any approved auth metadata, additive only.

#### BE-10 — Execute the expanded test suite and preserve core regression coverage

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 2 d initial harness plus feature acceptance support
- **Dependencies:** BE-01 and each tested feature
- **Requirements:** SYS-6, 30–32, 46–49.

**Files to work in**

- Extend `scripts/database.js`, `scripts/database-target.js` only as needed, root `package.json`, `.github/workflows/ci.yml`, `server/tests/integration/`, `server/tests/fixtures/sessions.js`, `server/tests/fixtures/courses.js`, `docs/testing.md`.

**Steps**

1. Include every new integration test in actual test execution; preserve positive dedicated-test-database checks and isolation/cleanup under expanded concurrency.
2. Keep existing tests; add per-feature fixtures and failure injection.
3. Tests must not share mutable accounts unintentionally.
4. Capture test names/counts so a newly added file cannot silently go unrun.

**Done when**

- Lint/unit/integration/build actually execute new tests
- Intentional failing new-test fixture fails CI
- Unsafe database target refused
- Rollback, ownership, retry and concurrent sessions retain regression coverage.

**Contract/schema note:** test fixtures cover fresh/upgraded data, no development reset.

### Scoring, modes and adaptive learning

#### BE-03 — Complete authoritative replay and key/pair evidence

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 3 d
- **Dependencies:** BE-01 mode/event contracts
- **Requirements:** SYS-10, 17, 30–31.

**Files to work in**

- Extend `server/src/modules/scoring/replay.js`
- Implement `server/src/modules/scoring/logValidator.js`, `server/src/modules/scoring/evidence.js`, `server/src/modules/scoring/scoreSession.js` under the same module only for useful separation
- Extend shared metrics/events
- Add `server/tests/unit/scoring.test.js`.

**Steps**

1. Preserve correction/raw/final metric semantics; validate mode-specific timing, pauses, sequence, empty denominators, deadline and text exhaustion.
2. Compute independent expected-key accuracy and eligible key/pair latency/error evidence.
3. Record certified focus loss through an agreed contract rather than inventing unsupported events.
4. Keep pure explicit inputs.

**Done when**

- Fixed SRS examples and event fixtures pass, ordinary wrong input is scored, client scores ignored, unattempted timed suffix not penalized, no invalid stream changes persistence.

**Contract/schema note:** evidence output informs stats migration, not separate scorers per mode.

#### BE-04 — Extend one session lifecycle across all modes

- **Owner:** Dev 1
- **Reviewer:** Dev 2
- **Estimate:** 3 d
- **Dependencies:** BE-01, BE-03, captured mode policy
- **Requirements:** SYS-13, 15–16, 31–32, 36–37, 46–50.

**Files to work in**

- Extend `server/src/modules/sessions/routes.js`, `server/src/modules/sessions/service.js`, `server/src/routes.js`, shared `packages/shared/src/session.js`/`packages/shared/src/modeRules.js`, `server/src/db/transaction.js` if required
- Add `server/tests/integration/session-modes.test.js` and register it through BE-10.

**Steps**

1. Placement/lesson/practice/review/timed/certified start/submit/abandon/history use one service.
2. Capture text, target/timezone, mode settings/scoring/engine versions and expiry.
3. Re-read state under existing database row-lock/serializable retry strategy; keep canonical hashing, identical saved response and conflicting-retry rejection.
4. Mode-specific learning/reward eligibility must not leak into unrelated modes.

**Done when**

- All mode success/failure/restart/deadline cases pass
- Same/different payload and concurrent submissions are safe
- No LLM/mail/PDF calls inside save transactions.

**Contract/schema note:** captured policy/version metadata and agreed status fields through BE-02.

#### BE-06 — Complete shared statistics and adaptive selection/difficulty

- **Owner:** Dev 2
- **Reviewer:** Dev 3
- **Estimate:** 4 d
- **Dependencies:** BE-01/02/03; target/curriculum policy
- **Requirements:** SYS-17–20, 22–23.

**Files to work in**

- Extend `server/src/modules/stats/service.js`, `server/src/modules/adaptive/mastery.js`, `server/src/modules/path/service.js`
- Implement `server/src/modules/adaptive/statsUpdate.js`, `server/src/modules/adaptive/weakness.js`, `server/src/modules/adaptive/focusSelection.js`, `server/src/modules/adaptive/difficulty.js`, `server/src/modules/adaptive/defaults.js`, `server/src/modules/path/recommend.js`
- Shared stats/settings/path DTOs
- Add `server/tests/unit/adaptive.test.js`.

**Steps**

1. Separate accuracy/latency counts and contributing sessions; handle unknown evidence explicitly; reserve exploration/due review slots; use SRS gate/difficulty/mastery rules and feasible bounds.
2. Persist readable stable reason codes/params and effective versions.
3. Difficulty never unlocks characters.
4. Preserve earned unlocks and teammate regression cases.

**Done when**

- Novices, fast-inaccurate, slow-accurate and uneven-key profiles behave deterministically under explicit settings/time/randomness
- No difficulty increase below gate or mastery from sparse evidence.

**Contract/schema note:** PairStat, review/difficulty/adaptive-event fields and compatible existing KeyStat backfill under BE-02.

#### BE-07 — Implement optional first-entry placement and compatible reassessment

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 2 d
- **Dependencies:** BE-03/04/06; placement freshness/reattempt policy
- **Requirements:** SYS-16, 60–61.

**Files to work in**

- Implement `server/src/modules/adaptive/placement.js`
- Extend sessions/path/stats services
- Implement `server/src/modules/courses/placement.js` with Dev 4's interface
- Shared placement/enrollment DTOs
- Add `server/tests/unit/placement.test.js`.

**Steps**

1. Broad letter coverage, skip-to-beginner, provisional prerequisite-ordered exemptions, targeted checks for missing evidence and repeat-entry resume.
2. Preserve established learning when reassessment is sparse/contradictory.
3. Treat broad placement as an explicit assessment alphabet exception; no XP/mastery/course completion from placement alone.

**Done when**

- Novice/experienced/skip/returning/new-course scenarios meet SRS evidence rules
- Reattempt policy is enforced
- Later enrollment reuses compatible evidence without resetting skill.

**Contract/schema note:** explicit placement decision/provenance/status as reviewed; current placementDone boolean alone may be insufficient.

#### BE-08 — Implement user-level spaced reviews

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 2 d
- **Dependencies:** BE-04/06
- **Requirements:** SYS-21–23, 61.

**Files to work in**

- Implement `server/src/modules/adaptive/spacedReview.js`
- Extend `server/src/modules/stats/service.js`, `server/src/modules/path/service.js`, session learning update
- Add `server/tests/unit/review.test.js`, integration cases through BE-10.

**Steps**

1. Use explicit effective time, required per-key review evidence and approved intervals; insufficient coverage holds stage, pass advances, fail returns key to in progress with reset schedule.
2. Never relock previously unlocked groups.
3. Compatible course or standalone review uses the same state.

**Done when**

- Due dates, overdue order, insufficient evidence, pass/fail and later-course behavior pass deterministic tests
- Network retry cannot advance a stage twice.

**Contract/schema note:** user-key review schedule/stage/provenance fields, not a separate review profile per course.

### Courses, enrollment and publication

#### BE-11 — Implement published catalog, owned enrollment and path persistence

- **Owner:** Dev 4
- **Reviewer:** Dev 1
- **Estimate:** 3 d
- **Dependencies:** BE-01/02 and course objective/enrollment policy
- **Requirements:** SYS-57–58, 61.

**Files to work in**

- Implement `server/src/modules/courses/routes.js`, `server/src/modules/courses/service.js`, `server/src/modules/courses/repository.js`, `server/src/modules/courses/path.js`
- Shared `packages/shared/src/courses.js`, `packages/shared/src/enrollments.js`
- Mount through Dev 1 in `server/src/routes.js`
- Add `server/tests/integration/course-enrollment.test.js`.

**Steps**

1. Published-only searchable catalog/details, safe path preview, enroll/retry, own-enrollment list and resumable version-owned path.
2. Server derives version/lesson relations and ownership; archived courses reject new enrollments while existing access/history stays.
3. Agreed uniqueness governs re-enrollment/version behavior.

**Done when**

- Draft/private path leakage, cross-user access, duplicate/concurrent enrollment and archived-course cases pass
- Empty progress resumes valid beginner work.

**Contract/schema note:** candidate Course/Version/Unit/Lesson/Enrollment/Progress models and indexes reviewed in BE-02.

#### BE-12 — Implement course authoring, validation and immutable publication

- **Owner:** Dev 4
- **Reviewer:** Dev 3
- **Estimate:** 3 d
- **Dependencies:** BE-05/11, course checkpoints/content policy
- **Requirements:** SYS-58, 62–63.

**Files to work in**

- Implement `server/src/modules/courses/adminRoutes.js`, `server/src/modules/courses/publication.js`, `server/src/modules/courses/validator.js`
- Extend repository/service
- Shared course authoring DTOs
- Add unit/integration publication tests and mount with Dev 1.

**Steps**

1. Protected draft create/edit/preview/validate/publish/archive; optimistic edit conflict handling and retry-safe publication.
2. Check references, same-version lesson prerequisites, cycles/unreachable nodes, objective attainability, alphabet/coverage/fallback feasibility.
3. Published edits create successor drafts; preserve referenced versions and audit material changes.
4. Preview performs no real learning/rewards.

**Done when**

- Invalid graph/impossible lesson blocked
- Concurrent publish/edit deterministic
- Existing learners retain original version and access
- Outage of optional LLM alone does not block valid publication.

**Contract/schema note:** draft revision/version status/audit, publication transaction and constraints.

#### BE-13 — Implement course objective evaluation and evidence transfer

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 3 d
- **Dependencies:** BE-06/07/08/11; approved objective/checkpoint/freshness policy
- **Requirements:** SYS-59–61, 64.

**Files to work in**

- Implement pure `server/src/modules/courses/progress.js`, `server/src/modules/courses/placement.js`, `server/src/modules/courses/path.js` through coordinated ownership
- Extend shared enrollments/path contracts
- Add `server/tests/unit/course-progress.test.js`.

**Steps**

1. Evaluate objectives from compatible shared skill evidence and captured course targets/prerequisites; keep locked/available/in-progress/completed/exempt states distinct.
2. Track provenance/contributing sessions; placement alone cannot complete a course or final checkpoint.
3. Shared global unlocks cannot widen lesson alphabets.
4. Evidence reuse never awards a second session reward.

**Done when**

- Two identical profiles share estimates but retain separate course progress
- Unrelated objectives remain incomplete
- Weak/unknown/stale evidence yields a check/practice reason
- Explicit exemption policy is auditable.

**Contract/schema note:** minimal provenance/objective evidence and completion state, not copied KeyStat/PairStat tables.

#### BE-14 — Atomically integrate course progress into the existing session save

- **Owner:** Dev 4
- **Reviewer:** Dev 2
- **Estimate:** 3 d
- **Dependencies:** BE-04/11/13, generation-spec interface BE-05
- **Requirements:** SYS-32, 46–47, 50, 59, 63–64.

**Files to work in**

- Extend `server/src/modules/sessions/service.js` with Dev 2, `server/src/modules/courses/repository.js` / `server/src/modules/courses/service.js`, stats/reward persistence hooks, shared session/result/enrollment schemas
- Add `server/tests/integration/course-session.test.js`.

**Steps**

1. Resolve valid owned enrollment/lesson at start; capture exact version/constraints/settings with assignment.
2. Under existing per-student database concurrency protection, re-read current skill/progress and save result/hash/log/shared evidence/course effects/rewards once.
3. Return immutable saved course effects on retry.
4. Preserve standalone sessions and immutable active assignment when another course is selected.

**Done when**

- Same retry, conflicting retry, concurrent two-course submissions and forced mid-transaction failure are lossless/atomic
- No duplicate XP or false lesson completion.

**Contract/schema note:** optional course session context and progress evidence constraints, preserving existing session rows.

#### BE-15 — Import and accept two reviewed courses

- **Owner:** Dev 4
- **Reviewer:** Dev 5
- **Estimate:** 2 d
- **Dependencies:** BE-05/11/12/13/14; approved initial outlines
- **Requirements:** SYS-57–64.

**Files to work in**

- `server/prisma/content/courses/` reviewed course files, `server/prisma/seed.js` or explicit importer using the same validators
- Integration fixtures/tests
- Update content guide/development/API evidence.

**Steps**

1. Import one complete foundational path and a second fluency/themed path to prove shared skill transfer with separate progress.
2. Preserve accounts, stable identifiers and published snapshots; seeds add missing starter definitions rather than overwrite authored courses.
3. Review source/license, lesson feasibility and final checkpoint evidence.

**Done when**

- Real browser/API catalog → enroll → optional placement → lesson → saved resume works for both profiles
- Successor publication/archival/history and account deletion verified.

**Contract/schema note:** content data, no bulk database redesign; exact version-migration mapping stays deferred unless explicitly approved.

### Content, generation, maintenance and rewards

#### BE-05 — Implement content schemas, validator and dependable fallback

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 4 d
- **Dependencies:** BE-01 content/spec policy
- **Requirements:** SYS-24–27, 42, 51, 63.

**Files to work in**

- Implement `server/src/modules/generation/feasibility.js`, `server/src/modules/generation/validator.js`, extend `server/src/modules/generation/fallbackGenerator.js`, implement `server/src/modules/adaptive/buildSpec.js` with Dev 2's interface
- Implement `server/src/scripts/validate-content.js`
- Reviewed content under `server/prisma/content/`
- Shared `packages/shared/src/spec.js`.

**Steps**

1. Validate alphabet, length, focus keys/pairs, references and blocked content for every source.
2. Curated-word then constrained-drill fallback; rebuild impossible focus before generation and record permitted relaxation.
3. Agree word matching/normalization and test innocent substrings.
4. Replace empty content placeholders with reviewed licensed/team-authored content, not invented approved curriculum.
5. Review the punctuation in `server/src/modules/settings/starter.js` against the agreed introductory curriculum. Introduce punctuation only through approved groups; coordinate any existing-data transition with BE-02 and Dev 2 before activation.

**Done when**

- Tiny alphabets/impossible pairs/blocked content/coverage cases pass
- Each active lesson/group has a usable validated fallback without locked characters
- Invalid content prevents activation. Add a real root `content:validate` script only when implemented.
- The starter alphabet is reconciled with the approved curriculum without resetting existing learner records or silently changing assignments.

**Contract/schema note:** content/spec/validation versions and optional source records.

#### BE-16 — Implement cache and bounded server-only LLM generation

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 3 d
- **Dependencies:** BE-05, approved provider/budget/timeout, BE-11 lesson constraints
- **Requirements:** SYS-24–29, 51, 63.

**Files to work in**

- Implement `server/src/modules/generation/service.js`, `server/src/modules/generation/cache.js`, `server/src/integrations/llm/client.js`, `server/src/integrations/llm/prompts.js`, `server/src/integrations/llm/schemas.js`
- Extend env validation/sample and session start by agreement
- Add deterministic generation integration/unit tests.

**Steps**

1. Compatible validated cache first; bounded LLM call, one invalid-output retry within total budget, then validated fallback.
2. Validate external response envelopes and generated text.
3. Cache keys include effective course/content/spec/settings/validation compatibility, never just title or UI locale.
4. Record outcomes and permitted relaxations; keep secrets in server configuration.

**Done when**

- Valid/invalid response, timeout, rate-limit, malformed provider output, incompatible cache and no-credential fallback all work
- No network operation inside result save.

**Contract/schema note:** reviewed PracticeText/GenerationAttempt/cache-version concepts and retention/indexes.

#### BE-17 — Implement durable maintenance and content pre-generation

- **Owner:** Dev 3
- **Reviewer:** Dev 5
- **Estimate:** 2 d
- **Dependencies:** BE-02/16
- **Requirements:** SYS-28, 52; SRS 10.3–10.4.

**Files to work in**

- Implement `server/src/jobs/runner.js`, `server/src/jobs/pregenerateTexts.js`, extend existing `server/src/jobs/purgeKeystrokeLogs.js` and server lifecycle
- Implement `server/src/scripts/generate-texts.js`
- Add job tests.

**Steps**

1. Retain working expiry-based raw-log purge, add durable overdue work/claim/checkpoint state as needed for generation.
2. Catch up after downtime and avoid duplicate work across processes with database-backed claims.
3. Bounded retries and sanitized failure summaries; never print raw logs or secrets.
4. Add future script only when actually runnable.

**Done when**

- Restart after overdue work, duplicate workers and interrupted/retried jobs converge safely
- Raw logs expire without deleting retained results/hash
- Pre-generated text is validated and version-compatible.

**Contract/schema note:** JobRun/claim/checkpoint where necessary, expiry indexes and safe cleanup policy.

#### BE-18 — Complete versioned gamification and lossless reward persistence

- **Owner:** Dev 3
- **Reviewer:** Dev 2
- **Estimate:** 3 d
- **Dependencies:** BE-01/02/04 and approved reward/timezone policy
- **Requirements:** SYS-34–35, 46–47.

**Files to work in**

- Extend `server/src/modules/gamification/rules.js`
- Implement `server/src/modules/gamification/service.js`
- Integrate session save through Dev 2
- Shared gamification/settings schemas
- Add reward unit/integration tests.

**Steps**

1. Pure captured-policy XP/levels, qualifying activity, daily goals, validated timezone/day assignment, streaks and one-time badge criteria.
2. Persist reward events with database uniqueness; update current user state under transaction protection.
3. Placement excluded; qualifying tests do not change mastery; one exercise reused by courses earns rewards once.

**Done when**

- Same/conflicting retry, concurrent sessions, timezone changes and duplicate badge eligibility yield exact expected totals/events without lost updates
- Old completed results remain unchanged.

**Contract/schema note:** XpEvent/award uniqueness and activity metadata, approved backfill for existing aggregate-only XP.

### Forum, certificates, administration and privacy

#### BE-19 — Implement forum and moderation services

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 3 d
- **Dependencies:** BE-01/02/09 and public-read policy
- **Requirements:** SYS-39–40, 45.

**Files to work in**

- Implement `server/src/modules/forum/routes.js`, `server/src/modules/forum/service.js`
- Shared forum DTOs
- Admin moderation service through Dev 1
- Routes assembly
- Add forum integration tests.

**Steps**

1. Paginated threads/replies, create/report, owner-only accepted answer and admin pin/hide/delete.
2. Preserve existing one-accepted-answer partial unique index and validate post/thread relationship.
3. Filter hidden/deleted data from every ordinary list/detail/search response.
4. Apply ownership/role/CSRF/abuse limits and safe text DTOs.

**Done when**

- Wrong owner/role denied, concurrent accept operations obey one-answer rule, hidden content inaccessible, XSS strings safely rendered and moderation audited.

**Contract/schema note:** nullable/anonymized authors or structural deletion placeholders reviewed so account deletion preserves others' replies appropriately.

#### BE-20 — Implement performance certificates, public verification and PDF

- **Owner:** Dev 5
- **Reviewer:** Dev 2
- **Estimate:** 4 d
- **Dependencies:** BE-01/02/04, approved certification/consent policy
- **Requirements:** SYS-32, 37–38.

**Files to work in**

- Implement `server/src/modules/certificates/eligibility.js`, `server/src/modules/certificates/service.js`, `server/src/modules/certificates/routes.js`, `server/src/integrations/pdf/certificate.js`
- Integrate record issuance in session save through Dev 2
- Shared certificate DTOs
- Certificate/PDF/privacy tests.

**Steps**

1. Pure captured-policy eligibility for completed certified mode only; unique unguessable code and one record per qualifying session saved atomically.
2. Public verification exposes only consented allowlisted fields/status.
3. Generate/download retryable PDF after commit, with unproctored wording and stable print layout.
4. Revocation is protected/audited.

**Done when**

- Below threshold/wrong mode/short or invalid assignment gets no certificate
- Retries/PDF failure never duplicate issuance
- Valid/revoked/deleted-account verification leaks no email/logs.

**Contract/schema note:** captured policy, consented name/duration/status/artifact lifecycle beyond existing prototype fields; deletion rules reviewed.

#### BE-21 — Implement required admin user/content/settings APIs

- **Owner:** Dev 1
- **Reviewer:** Dev 3
- **Estimate:** 3 d
- **Dependencies:** BE-05/09, agreed admin contracts
- **Requirements:** SYS-41–43, 45, 48.

**Files to work in**

- Implement `server/src/modules/admin/routes.js`, `server/src/modules/admin/service.js`
- Extend settings/content/auth/users services
- Shared admin schemas
- Audit helper added only where reused
- Mount routes through existing assembly.

**Steps**

1. Protected paginated user management, admin creation, last-active-admin preservation, deactivate/revoke/delete; validate word lists/themes/blocked content/key-group graph before activation; immutable settings updates with expected-version check.
2. Admin content and importer reuse the same validators.
3. No fake production admin headers or implicit learner-log access.

**Done when**

- Role/owner/CSRF denials, last-admin races, invalid content, stale activation and success all tested
- Active assignments retain captured policy
- Material actions have minimal audit records.

**Contract/schema note:** reviewed admin/content/settings storage and constraints, version-safe key-group graph evolution.

#### BE-22 — Complete analytics and privacy/deletion across features

- **Owner:** Dev 1
- **Reviewer:** Dev 5
- **Estimate:** 3 d
- **Dependencies:** BE-11/18/19/20/21, approved retention policies
- **Requirements:** SYS-9, 33, 44–45, 48, 52.

**Files to work in**

- Implement `server/src/modules/analytics/service.js`
- Extend users/admin/forum/certificate/course repositories and deletion coordination
- Jobs
- Shared analytics DTOs
- Integration deletion/report tests
- Security/development guides.

**Steps**

1. Parameterized reporting with explicit windows, denominators, allowed sort/filter fields and numeric serialization.
2. Coordinate account deletion of tokens/session/skill/course/reward data, authored forum text, certificate identity/PDF/private caches and audit pseudonymization.
3. Preserve anonymous structural placeholders when needed, without deleting others' contributions; use recoverable artifact cleanup outside transactions.

**Done when**

- Accurate known-fixture aggregates
- No private logs in analytics
- Full deleted-user graph/artifacts removed or safely unavailable
- Raw-log expiry keeps retry hash for retained results
- Backup restoration follows agreed deletion catch-up policy.

**Contract/schema note:** deletion relations/tombstones/artifact cleanup claims and retention constraints.

### Evaluation, operations and product acceptance

#### BE-23 — Run reproducible adaptive evaluation and volunteer pilot

- **Owner:** Dev 2
- **Reviewer:** Dev 4
- **Estimate:** 4 d
- **Dependencies:** BE-06/07/08/13/15, trained-model rubric decision
- **Requirements:** SRS 15.

**Files to work in**

- Implement `server/src/scripts/simulate/typists.js`, `server/src/scripts/simulate/policies.js`, `server/src/scripts/simulate/assessment.js`
- Add a runner only when needed
- Add actual root `simulate` command
- Write sanitized evaluation results/method in `docs/evaluation.md` (new).

**Steps**

1. Adaptive vs fixed policy, identical initial conditions/equal budgets/common held-out assessment, multiple seeds, separate tuning/reporting profiles and variability.
2. Include novice/slow-accurate/fast-inaccurate/uneven profiles and separate course progress.
3. Organize a consented small usability pilot where feasible, recording sample/duration/limits and safe data handling.

**Done when**

- Another developer can reproduce tables from seeds/config versions
- Simulation assumptions do not inherently favor adaptation
- Report uncertainty and avoid claiming simulated human learning gains.

**Contract/schema note:** no production learner model changes without a separate approved design.

#### BE-24 — Verify performance, dependencies, jobs, deployment and recovery

- **Owner:** Dev 5
- **Reviewer:** Dev 1
- **Estimate:** 4 d; support Dev 3 on jobs/performance
- **Dependencies:** implemented core/support APIs, hosting/retention/reference-environment decisions
- **Requirements:** SRS 10.

**Files to work in**

- `.github/workflows/ci.yml`, actual host configuration only after selection, env samples/validation as required, new `server/tests/performance/` scripts if useful, `docs/development.md`, `docs/security.md`, `docs/testing.md`.

**Steps**

1. Review reported dependency findings against actual locked versions/reachability and verify a narrow remediation; no blind forced upgrade.
2. Measure SRS workload and warm/cold timing separately; record device/browser/server/network/dataset.
3. Document provider migration step, HTTPS/cookies/origins/email/LLM-off fallback, backups, restore, deletion catch-up, operational ownership and rollback.
4. Local database guard scripts remain local-only; do not bypass them for production deployment.

**Done when**

- Load report includes throughput/errors/p95, durable jobs survive downtime, one backup restore is evidenced, staged smoke checks work and remaining release risks have owners. Actual push/deploy/data reset requires task authorization
- This plan authorizes none.

**Contract/schema note:** approved release migration runbook and compatibility/rollback evidence.

#### BE-25 — Complete full-product acceptance and academic handoff

- **Owner:** Dev 5
- **Reviewer:** Dev 4
- **Estimate:** 3 d; all five developers resolve their own defects
- **Dependencies:** BE-01–24 and frontend/backend reconnection.
- **Requirements:** SYS-1–64 and SRS non-functional/evaluation requirements.

**Files to work in**

- Extend frontend browser tests and server integration tests for real services
- `docs/testing.md`, `docs/api-contract.md`, `docs/development.md`, `docs/evaluation.md`, root README and this plan's task/evidence record. Preserve protected teammate docs until separately authorized integration.

**Steps**

1. Replace fixture demonstrations with real API/database proof for every claimed implemented workflow.
2. Re-run cross-user/role/CSRF/revocation/deletion, concurrent result/course/reward updates, certificate privacy and content outage/versioning cases.
3. Complete requirement matrix, demo script, setup walkthrough, measured limits and academic deliverables.
4. Review translated UI and desktop browsers/mobile non-typing behavior.

**Done when**

- No required feature is silently dropped
- Every SYS ID has specific passing evidence or an explicitly unresolved release blocker
- All five reviewers can run the core demo
- Only genuinely verified endpoints are labelled verified.

**Contract/schema note:** final fresh/upgrade checks and retained-history compatibility; no unreviewed last-minute redesign.

## 8. Schema-change plan

### Candidate model work, subject to review

This table is a design worklist, **not a final schema or instruction to generate migrations now**. The existing schema contains account/session/key-stat/basic reward/certificate/forum/content records, but concept names in architecture do not prove matching runtime tables exist.

| Area | Existing starting point | Candidate evolution / questions | Owner / first task |
| --- | --- | --- | --- |
| Identity | User, AuthSession, EmailToken | Preserve auth contracts/revocation; review first-admin creation and privacy metadata | Dev 1 / BE-02, 09 |
| Keyboard curriculum | KeyGroup with one `prerequisiteId` and string keys | Decide how multiple prerequisites/stable skill IDs are represented; preserve old progress and unique membership | Dev 2 + Dev 1 / BE-02, 06 |
| Shared skill | KeyStat; no PairStat model | Separate evidence counts, contributing sessions, review scheduling and tracked pair stats; accuracy units stay explicit | Dev 2 / BE-06, 08 |
| Session record | TypingSession with text/rules/settingsId/result/hash | Preserve exact assignment and retry result; review explicit scoring/config/content references and optional course context; `settingsId` currently is not a Prisma relation | Dev 1 + Dev 2 / BE-02, 04 |
| Adaptive state | Some logic exists, no dedicated adaptive-event model | Explainable decisions, effective versions, difficulty/review state and safe reason parameters | Dev 2 / BE-06 |
| Courses | Comment-only files; no course models | Stable Course, immutable published Version, ordered Unit/Lesson, same-version DAG prerequisites, Enrollment, lesson progress/exemption/evidence | Dev 4 / BE-11–14 |
| Enrollment uniqueness | No existing constraint | Define one active enrollment per user/course or reviewed alternative; version/reenrollment/retry behavior before choosing a unique key | Dev 4 + Dev 1 / BE-01, 11 |
| Evidence transfer | Existing user-key aggregates | One shared skill profile, distinct enrollment objectives/provenance; no per-course copies or reward duplication | Dev 2 + Dev 4 / BE-13 |
| Generation | Theme/Word/BlockedWord; no full cache/attempt pipeline | PracticeText/GenerationAttempt or equivalent, spec/content/validation compatibility, limits and cleanup | Dev 3 / BE-05, 16 |
| Settings | Immutable SettingVersion values; hardcoded prototype ID used at start | Validated active-version selection, retained references and expected-version changes | Dev 1 / BE-09 |
| Rewards | User totals, DailyActivity, Badge/UserBadge | Unique session reward event ledger and policy provenance; do not invent historical events from aggregate XP without an explicit migration rule | Dev 3 / BE-18 |
| Certificates | Code/session uniqueness and basic metrics | Captured policy/consented identity/duration/revocation and PDF cleanup; account deletion removes identity and availability | Dev 5 / BE-20 |
| Forum | Thread/Post/Report; accepted-answer SQL partial index | Ownership, safe moderation/read filtering, anonymous structural placeholder and retained replies on author deletion | Dev 5 / BE-19, 22 |
| Audit/operations | AdminAuditLog; purge scans expiry | Minimal audit retention/pseudonymization; durable job claims/checkpoints/artifact cleanup only as needed | Dev 1 + Dev 3 / BE-17, 22 |

### Invariants that survive schema revisions

- One official result and accepted hash per session; identical retry returns saved effects even after raw-log expiry.
- A transaction and database uniqueness/concurrency strategy protect result, shared skill, course progress and qualifying rewards together. Keep the current database-backed student lock/serializable retry approach unless a reviewed replacement proves equivalent behavior across processes.
- One user-level compatible key/pair/review profile; independent version-owned enrollment progress. Placement exemption, exercise completion, mastery, lesson completion and course completion remain separate.
- Server resolves enrollment/version/lesson ownership and constraints; optional context preserves standalone practice/tests and legacy session rows.
- Referenced published versions/settings/results remain stable. Editing a published course produces a successor; archival preserves existing access/history by default.
- No locked-character expansion through course transfer, LLM text or fallback. Timed/certified results do not update curriculum mastery.
- One badge award per user/badge, deduplicated qualifying reward events, unique unguessable certificate code and at most one certificate per qualifying session.
- Raw logs have expiring retention independent of results/hash. Privacy deletion still removes personal course/learning/reward/artifact data; append-only records are not a privacy exemption.

### Required change workflow

1. Open a schema-change issue linked to the affected task; list old/new model/DTO, why it changes, data already present and impacted consumers. Dev 1 plus the domain reviewer reviews it.
2. Update the affected contract/fixtures first or in the same reviewed PR. An internal Prisma rename should not force a public JSON rename; DTO mapping isolates persistence changes.
3. If public fields change, publish an additive/compatible transition where practical. Agree temporary optional/default/null behavior, error versions and deprecation with both frontend/backend owners. Do not silently change `source` to `textSource`, `name` to `displayName`, or `finishTimeMs` to another unit/name because a draft example differs.
4. Expand schema first with additive fields/tables/indexes. For a required new relationship, add it nullable, backfill deterministically under an explicit policy, verify, then consider enforcing it in a later migration. Never infer old lesson completion/mastery from insufficient prototype data.
   For the current punctuation-containing starter groups, review the transition to the agreed introductory curriculum explicitly. Do not delete historical key statistics or alter already-assigned text to make new content rules fit.
5. Create the migration through the documented local workflow; inspect SQL for data loss, uniqueness failures, long locks and the existing partial index. Preserve committed migrations and database volumes.
6. Test empty-schema migration plus upgrade from realistic old rows. Include legacy completed sessions, retained hashes without raw logs, enrollment/version references and mixed concurrent writes. Prove new integration files actually ran.
7. Generate Prisma, run relevant checks, coordinate frontend adapter changes and merge consumers in compatible order. Retest old/current payloads and active assignments/settings versions.
8. Document rollout/backfill verification and recovery. Prefer forward fixes and compatible application rollback; a destructive down migration is not the default. Production migration/deployment is a separate authorized release action.

Current local commands, run from root only when intentionally implementing an approved schema change:

```powershell
npm run db:migration:create -- --name descriptive_change
npm run db:generate
npm run db:migrate
npm run db:seed
npm run lint
npm test
npm run test:integration
npm run build
```

`db:migration:create` creates/applies a local development migration; `db:migrate` applies committed migrations. Seeding is needed when reviewed starter content changes, not to overwrite accounts/content after every edit. Existing guarded commands refuse production/non-local targets. No reset, `db push`, old SQL bootstrap or volume deletion belongs in routine migration work. These commands were inspected for planning; they were not executed as application checks in this documentation task.

## 9. Decisions, risks and blockers

Policy choices belong in the [single decision log](decisions.md#open-decisions). This plan tracks gates without copying numerical learning formulas or marking unreviewed choices Accepted.

| Gate | Who obtains the decision | Needed before | Independent work that can continue |
| --- | --- | --- | --- |
| Working hours and actual developer assignments; 23 October due date is confirmed | Owner + Dev 1 | Capacity commitment and named owners | Existing-screen audit, task preparation and contract review |
| Incoming teammate frontend commits and design ownership | Dev 1 + frontend teammate | FE-01 shared-file integration | Read-only inventory and proposed interfaces |
| Actual deadline/rubric, trained-model requirement | Owner + Dev 2 | Backend engine/evaluation commitment | Frontend against explicit draft contracts; existing behavior regression |
| Default target/range/curriculum, reward/integrity settings | Owner + Dev 1, Dev 2 and Dev 3 | BE-04/06/18 acceptance | Pure test harnesses and current-policy compatibility |
| Concrete course objectives/final checkpoint, freshness/reattempt, enrollment uniqueness/edit conflicts and initial outlines | Owner + Dev 4 | Course contracts/model/publication/completion | Draft UI states and reviewed candidate graph validator design |
| Certification duration/thresholds/attempts/name/consent | Owner + Dev 5 | Real certificate issuance | UI states, PDF layout proposal and privacy contract |
| Public forum reading/limits, blocked-content normalization | Owner + Dev 5 and Dev 3 | Forum/content activation | Authenticated UI fixtures and safe rendering |
| Provider/model/budget/timeout, hosting/email | Owner + Dev 3 and Dev 5 | Live generation/deployment | Validated fallback, SMTP-local tests and deployment-neutral runbook |
| Operational/audit/backup retention, restore/deletion ownership, performance environment | Owner + Dev 1 and Dev 5 | Production data/release acceptance | Local synthetic acceptance/evaluation |

The main delivery risks and responses are:

- **Unconfirmed availability:** the frontend forecast assumes five focused working days per person. Confirm hours and re-estimate after the first demo.
- **Shared-file conflicts:** coordinate routing, providers, contracts, Prisma and session submission through the named owners.
- **Missing APIs or changing course rules:** distinguish reviewed development fixtures from live integration, and settle objectives/contracts before connecting pages.
- **Placeholder imports or duplicated screens:** inspect existing implementations and reuse them; keep reserved files unwired until they work.
- **Unsafe schema/content changes:** test upgrades with existing learner records and preserve assigned text, old settings and published versions.
- **Incomplete verification:** prove new test files run, verify a fresh clone and remote CI separately, and record browser/security/performance evidence.

## 10. Completion and evidence

**A frontend task is complete when:**

- Its owner and reviewer demonstrate the required behavior and loading/empty/error/retry states.
- Its use of real APIs or development fixtures is explicit.
- Relevant English/Arabic, appearance, viewport and accessibility checks pass.
- Active typing state survives presentation changes, and official values come from the server.
- No placeholder imports, duplicate screens or second styling entry point are introduced.
- Meaningful checks have actually run and unresolved defects are recorded.

**A backend task is complete when:**

- Requests, responses, permissions, ownership, revocation and CSRF are checked.
- Captured policy, retry, concurrency and transaction behavior meet the feature's contract.
- Relevant fresh/upgrade migrations and behavioral tests pass, including new test discovery.
- Related guides/contracts and actual verification evidence are updated.
- No secrets, private logs or unexplained dependency changes are added.

Release acceptance needs real backend/browser evidence. A successful build or fixture demo alone is insufficient.

Requirement allocation for issue/evidence tracking (each ID still needs a specific scenario/result):

| Requirements | Main tasks |
| --- | --- |
| SYS-1–9 | FE-04/09/14/29; BE-09/22 |
| SYS-10–15 | FE-05/10/15/20/25/30/34; BE-03/04 |
| SYS-16–23 | FE-06/11/12/17; BE-06/07/08/13 |
| SYS-24–29, 51 | FE-23/27 contract states; BE-05/16/17 |
| SYS-30–32, 46–47, 50 | FE-05/10/25/34; BE-03/04/10/14/18/20 |
| SYS-33–35 | FE-06/11/16/31; BE-18/22 |
| SYS-36–38 | FE-13/20/24/25/33; BE-04/20 |
| SYS-39–40 | FE-08/28/33; BE-19 |
| SYS-41–45 | FE-18/21/23/28/33; BE-09/12/21/22 |
| SYS-48–49 | FE-02/04/14/29; BE-04/09/10/21/22 |
| SYS-52 | BE-17/22/24 |
| SYS-53–56 | FE-03/19/24/29/30/31/32/33/34/35; BE-09/25 |
| SYS-57–64 | FE-07/12/17/22/27/32/35; BE-11/12/13/14/15 |
| SRS 10/15 non-functional/evaluation | FE-29/30/31/32/33/34/35; BE-10/22/23/24/25 |

### Final demonstration

1. Open the public site; register, verify email and sign in.
2. Browse a published course, enroll, and take or skip the first-entry placement.
3. Start a valid lesson/practice assignment, submit recorded typing, and see the official result and applicable rewards.
4. Resume the saved course path and show a second course sharing skills while retaining separate progress.
5. Complete a due review and show the correct insufficient-evidence/pass/fail behavior.
6. Take a timed/certified test; verify eligible certificate issuance, privacy-safe public verification and PDF retrieval.
7. Use the forum and protected admin authoring, publication, settings and moderation flows.
8. Sign out and prove revocation; demonstrate account deletion through its linked records/artifacts.

Also demonstrate lost-response retry, a rejected invalid submission, an LLM outage and publication of a successor course version. Check phone access to non-typing functions and guidance that prevents a scored touch session.
