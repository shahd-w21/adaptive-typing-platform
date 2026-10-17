# TypeFlow: Architecture and Project Structure

Version 1.3 — 15 October 2026

This is the target structure aligned with [the SRS](srs.md) and [decisions](decisions.md). Application code is outside this documentation revision. Paths below are relative to the repository root. For first-clone instructions and daily commands, use the [README](../README.md#quick-start); open this reference when working on module boundaries.

## 1. Repository layout

Use JavaScript ES modules (`import`/`export`), `.jsx` for React components and `.js` for other modules. Tailwind CSS remains the styling choice. `client/` and `server/` sit directly at the repository root; shared code remains in `packages/shared/`. See [decision 0003](decisions.md#0003). Planned npm workspaces reference `client`, `server` and `packages/shared`; exact package names, exports and scripts will be verified during implementation.

```text
typeflow/
├── client/                         # React frontend (JavaScript/JSX)
├── server/                         # Express backend (JavaScript)
├── packages/
│   └── shared/
├── docs/
│   ├── srs.md
│   ├── context/current-state.md    # short phase/task handoff
│   ├── architecture.md
│   ├── development.md              # PostgreSQL, environment and migrations
│   ├── api-contract.md              # draft; agreed at phase boundaries
│   ├── testing.md                   # verification and evaluation guide
│   ├── content-guide.md
│   ├── security.md
│   ├── contributing.md
│   ├── project-plan.md             # frontend-first five-developer delivery backlog
│   ├── jira-backlog.json            # generated planning manifest; no issue creation implied
│   └── decisions.md                # history, open questions and record template
├── AGENTS.md                       # concise repository-wide agent guidance
├── DESIGN.md                       # proposed visual system and Figma brief
├── .github/
│   ├── workflows/ci.yml
│   ├── pull_request_template.md
│   └── CODEOWNERS
├── docker-compose.yml              # PostgreSQL + Mailpit for development
├── .env.example
├── .gitignore
├── .editorconfig
├── .nvmrc
├── .prettierrc
├── eslint.config.js
├── package.json                    # npm workspaces and root scripts
└── README.md
```

The [README](../README.md#every-day) defines the target root-script contract. Foundations must implement and verify those scripts, workspace resolution, environment examples and Docker services. The [development guide](development.md) defines local service/connection conventions. Do not create empty application files just to match this tree during documentation work.

## 2. Backend layout

The tree below includes future implementation files. Reserved JavaScript files contain only `Coming soon` comments describing their responsibility; they have no exports, implementation or runtime wiring. Existing implementations remain in place. Some planned extractions already have working behavior in other files, so extend/refactor that behavior rather than building a second implementation. Empty `.gitkeep` markers only preserve directories in Git.

Content placeholders (`keygroups.json`, `themes.json` and `wordlists/example.json`) are empty JSON arrays; `blocked-words.txt` is empty. They are not approved curriculum, a working filter or inputs to the current seed. The existing seed continues using `modules/settings/starter.js`. Replace these placeholders with reviewed content and agreed schemas when implementing the importer. JavaScript test/fixture placeholders contain no assertions and do not count as test coverage.

The active session module is `src/modules/sessions/`, matching the migrated API implementation. Use it for the single lifecycle across all modes; the earlier `typing/` name refers to the same responsibility, not a second module. Tokens stay in `modules/auth/tokens.js`; auth/role/CSRF checks share `middleware/auth.js`, `HttpError` lives in `middleware/validate.js`, and HTTP error/not-found handling lives in `app.js`. Do not add duplicate placeholders for these responsibilities. Session lifecycle operations stay in the existing `service.js` until a concrete refactor requires splitting. Tests use Node's built-in runner, not Vitest; dedicated database setup/guards already live in root scripts and integration tests.

```text
server/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.js
│   └── content/
│       ├── courses/                # reserved course outlines; not seeded/imported yet
│       ├── keygroups.json
│       ├── wordlists/
│       │   └── example.json        # empty placeholder, not active curriculum
│       ├── themes.json
│       └── blocked-words.txt
├── src/
│   ├── server.js                   # startup and graceful shutdown
│   ├── app.js                      # Express application assembly
│   ├── routes.js                   # mounts /api/v1 modules
│   ├── config/env.js               # validated environment values
│   ├── db/
│   │   ├── prisma.js
│   │   └── transaction.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT, revocation, active account, role and CSRF
│   │   ├── validate.js             # request parsing and HttpError
│   │   └── rateLimit.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── time.js
│   ├── modules/
│   │   ├── auth/                   # register, verify, login, reset, revocation
│   │   │   ├── routes.js
│   │   │   ├── service.js
│   │   │   └── tokens.js
│   │   ├── users/                  # profile, settings, coordinated deletion
│   │   │   ├── routes.js
│   │   │   ├── service.js
│   │   │   └── dto.js
│   │   ├── courses/                # approved course scope; comment-only placeholders
│   │   │   ├── routes.js           # catalog, enrollments and owned paths
│   │   │   ├── adminRoutes.js      # draft authoring, preview, publish, archive
│   │   │   ├── service.js
│   │   │   ├── repository.js       # transaction-scoped course persistence
│   │   │   ├── publication.js
│   │   │   ├── validator.js
│   │   │   ├── path.js             # PURE prerequisite/next-action evaluation
│   │   │   ├── placement.js        # PURE evidence reuse / entry-check policy
│   │   │   └── progress.js         # PURE objectives, completion, exemptions
│   │   ├── scoring/                # PURE
│   │   │   ├── replay.js
│   │   │   ├── logValidator.js
│   │   │   ├── evidence.js         # eligible key/pair samples
│   │   │   └── scoreSession.js     # uses shared metric functions
│   │   ├── adaptive/               # PURE; settings passed as arguments
│   │   │   ├── defaults.js
│   │   │   ├── statsUpdate.js
│   │   │   ├── weakness.js
│   │   │   ├── focusSelection.js
│   │   │   ├── difficulty.js
│   │   │   ├── mastery.js
│   │   │   ├── spacedReview.js
│   │   │   ├── placement.js
│   │   │   └── buildSpec.js
│   │   ├── sessions/               # ONE session lifecycle for all modes
│   │   │   ├── routes.js
│   │   │   └── service.js          # existing start/submit/abandon/history/result
│   │   ├── stats/                  # reads and transaction-scoped writes
│   │   │   └── service.js
│   │   ├── path/                   # keyboard map and recommended activity
│   │   │   ├── service.js
│   │   │   └── recommend.js
│   │   ├── generation/
│   │   │   ├── service.js
│   │   │   ├── feasibility.js
│   │   │   ├── validator.js
│   │   │   ├── fallbackGenerator.js
│   │   │   └── cache.js
│   │   ├── gamification/           # pure reward rules + persistence helpers
│   │   │   ├── rules.js
│   │   │   └── service.js          # placeholder: reward persistence / badges
│   │   ├── certificates/           # eligibility, records, revoke, verify, PDF
│   │   │   ├── routes.js
│   │   │   ├── service.js
│   │   │   └── eligibility.js      # placeholder: PURE captured-policy checks
│   │   ├── forum/                  # threads, replies, accepted answer, reports
│   │   │   ├── routes.js
│   │   │   └── service.js
│   │   ├── settings/               # validated immutable settings versions
│   │   │   ├── starter.js
│   │   │   └── service.js
│   │   ├── analytics/              # defined aggregates and parameterised SQL
│   │   │   └── service.js
│   │   └── admin/                  # protected management workflows/audit
│   │       ├── routes.js
│   │       └── service.js
│   ├── integrations/
│   │   ├── llm/                    # client, prompts, response schemas
│   │   │   ├── client.js
│   │   │   ├── prompts.js
│   │   │   └── schemas.js
│   │   ├── mailer/                 # SMTP client and templates
│   │   │   ├── index.js
│   │   │   └── templates.js
│   │   └── pdf/                    # certificate document rendering
│   │       └── certificate.js
│   ├── jobs/
│   │   ├── runner.js               # scheduled execution and restart catch-up
│   │   ├── pregenerateTexts.js
│   │   └── purgeKeystrokeLogs.js
│   └── scripts/
│       ├── simulate/              # typists, policies, common assessment
│       │   ├── typists.js
│       │   ├── policies.js
│       │   └── assessment.js
│       ├── generate-texts.js
│       └── validate-content.js
├── tests/
│   ├── fixtures/
│   │   ├── courses.js              # placeholder; no test coverage claimed
│   │   └── sessions.js             # placeholder; no test coverage claimed
│   ├── unit/                      # Node test runner; existing tests retained
│   └── integration/
├── .env.example
├── prisma.config.mjs
└── package.json
```

Feature folders may use routes, controller, service, repository and local schemas as needed. A controller translates HTTP; a service coordinates behaviour. Database access belongs in explicit repository/query functions where that makes the boundary useful. Do not add empty layers for a trivial operation.

### Dependency rules

1. Scoring/adaptive functions import only pure shared code and their own pure helpers.
2. Integrations do not import feature modules. Feature services call integrations.
3. Shared code cannot import either application, Prisma, Express, secrets or server-only integrations.
4. The typing submission service coordinates authoritative results for placement, practice, reviews and tests. Separate routes must not create separate scoring implementations.
5. Database helpers accept the current transaction client when participating in a submission.
6. Runtime settings are loaded by services and passed into functions. Pure modules never query settings themselves.
7. LLM, email and PDF calls never run inside a result-saving transaction.
8. Pure modules do not read `process.env`, `Date.now()` or global random generators. Pass the effective time and random source/seed in where required, so simulations/tests can reproduce behaviour. Browser event capture remains responsible for reading its monotonic clock outside pure replay functions.

Persistence practices are in [development](development.md#database-workflow); Figma-to-feature handoff is in [contributing](contributing.md#using-ai-agents).

## 3. Frontend layout

The tree below reflects the actual frontend scaffold. Existing teammate screens, styles, preferences, translations, icons and typing engine remain unchanged. Newly reserved JavaScript/JSX files contain only `Coming soon` comments and have no exports or route/provider wiring. `App.jsx` remains the running application until a separately authorized integration; do not import placeholders as usable components. `tests/e2e/` is reserved by `.gitkeep`, not executable browser tests.

Reuse existing screens in place instead of creating competing page copies. Auth account-recovery pages extend `AuthPages.jsx`; course pages reuse the existing learning-path/typing UI, including its keyboard map; gamification reuses `AchievementsView.jsx`; admin panels extend the existing `AdminView.jsx`. `src/index.css` remains the single Tailwind/theme stylesheet. No duplicate `styles/index.css`, generic utility/mock stubs or component-library config is required. Use shared formulas/contracts rather than browser copies. Add formatting helpers, schema-valid development fixtures or browser-only schemas when concrete implementation needs them, not as empty parallel layers.

```text
client/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── admin.js
│   │   ├── adminCourses.js
│   │   ├── auth.js
│   │   ├── certificates.js
│   │   ├── client.js
│   │   ├── courses.js
│   │   ├── forum.js
│   │   ├── gamification.js
│   │   ├── path.js
│   │   ├── progress.js
│   │   ├── sessions.js
│   │   └── users.js
│   ├── app/
│   │   ├── ErrorBoundary.jsx
│   │   ├── providers.jsx
│   │   ├── queryClient.js
│   │   └── router.jsx
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── controls/
│   │   │   ├── AppearanceSelector.jsx
│   │   │   └── LanguageSelector.jsx
│   │   ├── layout/
│   │   │   ├── AdminShell.jsx
│   │   │   ├── DeviceGuidance.jsx
│   │   │   ├── PublicHeader.jsx
│   │   │   └── StudentShell.jsx
│   │   ├── ui/
│   │   │   └── Icons.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── Loading.jsx
│   │   ├── RequireAuth.jsx
│   │   └── RequireRole.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── preferences.js
│   │   ├── PreferencesContext.jsx
│   │   └── RewardsContext.jsx
│   ├── features/
│   │   ├── achievements/
│   │   │   └── AchievementsView.jsx
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AnalyticsPanel.jsx
│   │   │   │   ├── CertificateManagement.jsx
│   │   │   │   ├── ContentManagement.jsx
│   │   │   │   ├── ForumModeration.jsx
│   │   │   │   ├── SettingsManagement.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── courses/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CourseMetadataForm.jsx
│   │   │   │   │   ├── LessonEditor.jsx
│   │   │   │   │   ├── PublishCourseDialog.jsx
│   │   │   │   │   └── UnitEditor.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAdminCourses.js
│   │   │   │   └── pages/
│   │   │   │       ├── AdminCoursesPage.jsx
│   │   │   │       ├── CourseEditorPage.jsx
│   │   │   │       └── CoursePreviewPage.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAdmin.js
│   │   │   └── AdminView.jsx
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   ├── ResetPasswordPage.jsx
│   │   │   │   └── VerifyEmailPage.jsx
│   │   │   └── AuthPages.jsx
│   │   ├── certificates/
│   │   │   ├── hooks/
│   │   │   │   └── useCertificates.js
│   │   │   └── CertificatesView.jsx
│   │   ├── courses/
│   │   │   ├── components/
│   │   │   │   ├── CourseCard.jsx
│   │   │   │   ├── CourseEntryCheck.jsx
│   │   │   │   ├── CourseFilters.jsx
│   │   │   │   ├── CoursePath.jsx
│   │   │   │   └── LessonNode.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCoursePath.js
│   │   │   │   └── useCourses.js
│   │   │   └── pages/
│   │   │       ├── CourseDetailPage.jsx
│   │   │       ├── CourseLibraryPage.jsx
│   │   │       ├── CoursePathPage.jsx
│   │   │       └── MyCoursesPage.jsx
│   │   ├── dashboard/
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.js
│   │   │   └── Dashboard.jsx
│   │   ├── forum/
│   │   │   ├── hooks/
│   │   │   │   └── useForum.js
│   │   │   └── ForumView.jsx
│   │   ├── gamification/
│   │   │   ├── components/
│   │   │   │   └── RewardNotifications.jsx
│   │   │   └── hooks/
│   │   │       └── useGamification.js
│   │   ├── learning-path/
│   │   │   └── LearningPath.jsx
│   │   ├── placement/
│   │   │   ├── hooks/
│   │   │   │   └── usePlacement.js
│   │   │   └── PlacementPage.jsx
│   │   ├── profile/
│   │   │   ├── hooks/
│   │   │   │   └── useProfile.js
│   │   │   └── ProfileView.jsx
│   │   ├── progress/
│   │   │   ├── hooks/
│   │   │   │   └── useProgress.js
│   │   │   └── ProgressView.jsx
│   │   ├── result/
│   │   │   └── OfficialResult.jsx
│   │   ├── review/
│   │   │   ├── hooks/
│   │   │   │   └── useReviews.js
│   │   │   └── ReviewPage.jsx
│   │   ├── tests/
│   │   │   ├── hooks/
│   │   │   │   └── useTests.js
│   │   │   └── TestsView.jsx
│   │   └── typing/
│   │       ├── components/
│   │       │   ├── KeyboardGuide.jsx
│   │       │   └── TypingStage.jsx
│   │       ├── engine/
│   │       │   ├── keystrokeRecorder.js
│   │       │   ├── liveMetrics.js
│   │       │   └── typingReducer.js
│   │       ├── hooks/
│   │       │   ├── useSubmitSession.js
│   │       │   ├── useTypingRecorder.js
│   │       │   └── useTypingSession.js
│   │       └── pages/
│   │           └── TypingSessionPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useRewards.js
│   ├── i18n/
│   │   ├── dictionaries/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   └── useTranslation.js
│   ├── lib/
│   │   └── queryKeys.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/
│   └── e2e/
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js
```

Target flow: page → feature hook → API function → shared HTTP client. Components render state; API files only send requests and handle transport shapes. TanStack Query is the target owner of remote data; Context handles the few cross-page UI concerns. The new query client, providers, hooks and transport are placeholders, not installed/configured integrations. API authentication/ownership checks remain mandatory even when frontend route guards exist. Keep the existing root workspace install/commands; this scaffold changes no dependencies or build configuration.

The recorder emits ordered monotonic events. The reducer replays allowed end-of-buffer operations and mode transitions. Live metrics use shared formulas and are labelled provisional until submission succeeds. The frontend must retain the same submission payload during a network retry, and must not replay reward toasts as new awards when recovering an already-saved result.

Do not let polling or dashboard rendering interfere with typing. Large-text and reduced-pressure settings affect presentation, not official elapsed time. Defer optional sounds until required behaviour is working.

### Presentation, interface language and responsive layouts

SRS SYS-53–56 and [decision 0002](decisions.md#0002) require Light/Dark appearance, English/Arabic UI and desktop/mobile non-typing pages. [DESIGN.md](../DESIGN.md) owns the proposed palette, fonts and layout matrix. This extends the target architecture only; no existing application file or dependency was assessed or created.

PreferencesContext coordinates stored appearance, resolved Light/Dark, UI locale/direction and accessibility preferences; TanStack Query still owns the account DTO. Shared user schemas validate the draft `themePreference`/`uiLocale` fields. Account persistence uses owner-only `/users/me` partial updates without overwriting unrelated keys. Apply SRS section 10.5 defaults, visitor/account precedence, logout cleanup and failure recovery. These preferences are not immutable engine settings and do not enter scoring/generation.

Keep reviewed static dictionaries and locale/direction helpers in the proposed frontend `i18n/` area. Use stable error/reason codes with parameters for translated system explanations; the detailed shared shape is still to agree in the [API contract](api-contract.md). No LLM/network translation service is required. Do not select a new localisation dependency or scaffold files during documentation work.

Apply semantic Light/Dark variables before normal rendering; explicit choices override the device, System resolves it. Locale uses `lang`/`dir` and logical layout properties. Arabic shells mirror navigation, while exercise input/text, key/pair strings, physical QWERTY layout and canonical codes remain English/LTR and isolated. Presentation changes cannot remount the recorder or replace text; focus loss retains mode rules. Datasets, raw events, scoring, content caching and certificates stay independent of presentation.

Public/student/admin shells use the same protected services and routes on desktop/mobile. Phone typing entry points show device guidance without creating a scored touch session. Resizing preserves an active attempt and its mode timing/pause behaviour. Non-typing forms, progress, certificates, forum and authorised admin actions remain usable on phones; follow the design matrix rather than inventing a second mobile application.

## 4. Shared package

```text
packages/shared/
├── src/
│   ├── index.js
│   ├── enums.js                    # runtime constants/Zod enums: Role, SessionMode, status, source
│   ├── auth.js
│   ├── user.js
│   ├── courses.js                  # course catalog/authoring runtime contracts
│   ├── enrollments.js              # enrollment/path/progress/session context
│   ├── keystroke.js                # discriminated event schemas
│   ├── spec.js
│   ├── session.js                  # assignment, submission, official result
│   ├── modeRules.js                # common rule shapes, no database reads
│   ├── settings.js                 # versioned configuration schemas
│   ├── metrics.js                  # one implementation of four formulas
│   ├── path.js
│   ├── stats.js
│   ├── gamification.js
│   ├── certificates.js
│   ├── forum.js
│   ├── admin.js
│   └── errors.js
└── package.json
```

Use shared Zod schemas for runtime validation and documented JSON contracts. Optional JSDoc can explain function inputs and outputs; generated or inferred static types are not required. Separate public DTOs from database records; never export token hashes, internal moderation data or private profile fields by accident. Sharing formulas does not make a client score authoritative: the server derives all formula inputs independently.

Use runtime constants or Zod enums in `enums.js`. The shared package exposes JavaScript modules through agreed package exports without a static-type compilation step. Validate requests, external responses and configuration at their boundaries; keep fixtures aligned with those schemas.

## 5. Data model and persistence invariants

The exact Prisma schema is a phase-zero deliverable. Expected concepts:

| Area | Records and responsibilities |
| --- | --- |
| Accounts | User, AuthSession/revocation state, EmailToken |
| Curriculum | KeyGroup and explicit ordered prerequisites |
| Courses | Course, immutable CourseVersion, Unit, Lesson/prerequisites, Enrollment and LessonProgress/exemption evidence; exact schema pending |
| Learning | KeyStat, PairStat, AdaptiveEvent |
| Sessions | TypingSession, KeystrokeLog, PracticeText |
| Generation | GenerationAttempt, content/validation version |
| Rewards | XpEvent, DailyActivity, Badge, UserBadge |
| Certificates | Certificate with issued/revoked status and captured policy |
| Content | Theme, WordList, blocked-content configuration |
| Forum | ForumThread, ForumPost, ForumReport |
| Administration | AdminAuditLog, immutable SettingVersion |
| Operations | JobRun/checkpoint state where needed for catch-up |

Key constraints: one official result per session, one key/pair statistic per user and item, unique badge awards, deduplicated reward events, unique certificate codes and one certificate per qualifying session. Store accepted payload hashes separately from expiring raw logs. Session status distinguishes created, completed, abandoned and expired.

Completed results and settings versions are immutable during normal operation. Privacy deletion and retention remain allowed; “append-only” is not an exception to those requirements. Store the text actually assigned, not just a mutable content reference. Keep referenced settings versions available for retained results.

Protect updates from separate simultaneous sessions for the same student. Choose a database-backed per-user lock or optimistic version check with bounded retries during implementation. Do not rely on a process-local mutex, which fails across multiple server processes. Re-read current learning state under the chosen concurrency protection before applying the update.

## 6. Main flows

### Start a session

1. Authenticate, validate requested mode/options and check rate/attempt limits.
2. Read current learning state and active settings; derive a feasible spec.
3. Obtain validated cached, generated or fallback text outside a database transaction.
4. Persist an owned assignment with the exact text, captured rules/versions and expiry.
5. Return the assignment. The server controls certified-test text; the client cannot substitute it.

### Submit a session

1. Authenticate, validate shape/size and load the owned assignment.
2. Canonicalise and hash the submission. If already completed, return its result for an identical hash or reject a conflict.
3. Replay and validate against the captured assignment; calculate official metrics and eligible evidence.
4. Begin a transaction, acquire concurrency protection and recheck submission status.
5. Load current student statistics; run applicable pure adaptive/reward functions using the captured rules.
6. Save the result, hash, expiring raw log, applicable statistics, decision, rewards and certificate record once.
7. Commit and return the saved result, reward events and next recommendation.
8. Render a requested certificate PDF outside the transaction. PDF failure must not erase a completed test or cause duplicate issuance.

Any recommendation requiring new text is fulfilled by a later start request. Do not keep a submit request open while waiting for the LLM.

### Maintenance

Use database records/checkpoints to find overdue purge and pre-generation work at startup and scheduled intervals. A scheduling library may wake the runner, but in-process scheduling alone is not the guarantee. Use locking or claims to avoid duplicate work across instances. Purging and catch-up must be retry-safe. Review dates can be computed when reading the path; email reminders are not required.

## 7. API groups

All application routes use `/api/v1`. Define complete request/response schemas and error codes in the later API contract; the examples below are proposed names.

| Group | Examples |
| --- | --- |
| `/auth` | register, verify-email, resend-verification, login, logout, me, forgot-password, reset-password |
| `/users/me` | profile/preferences update and account deletion |
| `/courses`, `/enrollments` | published catalog, enrollment and owned paths; draft contracts, not mounted |
| `/sessions` | start with mode, submit, abandon, owned result, history |
| `/path` | keyboard map, next activity, due reviews |
| `/progress` | comparable trends and key heat map |
| `/gamification` | XP, level, streak, goals and badges |
| `/certificates` | owned list/PDF; public verification by code |
| `/forum` | threads, replies, accept, reports |
| `/admin` | users, content, settings, analytics, moderation, certificate revocation, audit |

Placement, practice and tests use the same session lifecycle with distinct mode rules. Avoid duplicate `/placement/submit` and `/tests/submit` implementations. If separate convenience routes are introduced, delegate them to the same service. There is no Google-auth route in the baseline.

Use `/health/live` for process liveness and `/health/ready` for readiness including database connectivity; a database outage should not imply the process itself has stopped running.

## 8. Environment, development and delivery

Development Docker runs PostgreSQL and Mailpit with a named database volume and health checks. The API and web app run locally. Select and pin supported versions when setup is implemented. A production Dockerfile is optional depending on the host; it is not required to develop the application.

Example API configuration groups: environment/port, database URL, allowed client origins, JWT signing/session lifetimes, cookie/CSRF settings, SMTP credentials/from address, LLM base URL/key/model/timeout and job/retention settings. Use safe sample values in `.env.example`; validate required values at startup. Shared business settings belong in validated versioned settings, not dozens of untracked environment overrides.

Web environment: `VITE_API_URL` and an explicitly development-only mock toggle if needed. Values prefixed `VITE_` are public. There are no Google client-ID variables in this baseline. Real backend authentication must never accept a development fake-user header in production.

CI: reproducible install → JavaScript linting → dedicated PostgreSQL test service → migrations → relevant unit/integration checks and content validation → build. Add browser smoke checks for the typing flow. Test setup must verify the dedicated test database before destructive resets; never reuse a development or production connection. Protect `main` with passing checks and review.

Deployment: run committed migrations in a controlled release step, configure HTTPS/cookies/origins, verify email and fallback behaviour, and document rollback/recovery. Back up the database and verify a restore. Show measured free-host cold-start and capacity limits rather than assuming the performance targets were met.

## 9. Verification priorities

- Shared metrics: corrections, spaces, unfinished timed text, pauses and zero denominators.
- Replay: sequence, backspace boundaries, repeat handling, deadline and mode restrictions.
- Adaptation: accuracy gate, unknown evidence, multi-session mastery, target changes, review failure and preserved unlocks.
- Generation: tiny alphabets, impossible pairs, blocked content, versioned cache and validated fallback.
- Persistence: lost response retry, conflicting retry, concurrent sessions, rollback and reward uniqueness.
- Accounts: ownership, deactivation/reset revocation, CSRF and deletion through linked artifacts.
- Certificates: captured eligibility policy, unproctored label, safe public fields, revoke and PDF retry.
- Evaluation: equal budgets, multiple seeds and common held-out assessment.

Tests should establish behaviour rather than mirror file structure. Record requirement coverage and evidence using [testing.md](testing.md).

## Course expansion architecture — approved, placeholders only

[SRS section 9.6](srs.md#course-proposal) and [decision 0008](decisions.md#0008) define the approved course behavior. The owner authorized folders and comment-only files for frontend, backend and shared contracts; no runtime implementation is authorized in this task. The trees above show their canonical paths. Course files have no exports and must not be imported until implemented. No Prisma models/migrations, package exports, routes, navigation, dependencies or seed behavior were changed.

Use `modules/courses/` for catalog, authoring, publication, enrollment and progress; retain one `sessions/` lifecycle, adaptive/scoring/generation engine and existing integrations. Student course pages live in `features/courses/`; admin course pages live in `features/admin/courses/`. Existing `features/learning-path/LearningPath.jsx`, `features/admin/AdminView.jsx`, typing components, dictionaries and preferences are preserved; reuse/refactor them only in a later authorized implementation. Catalog/enrollment state belongs in remote-data hooks, not another course Context. Agree exact shared schemas before wiring APIs, hooks and pages. Content under `prisma/content/courses/` remains unseeded until its format/importer is reviewed.

Concepts to review before writing the Prisma schema:

| Concept | Responsibility |
| --- | --- |
| Course | Stable identity, catalog metadata and archival state |
| CourseVersion | Immutable published curriculum snapshot; editable draft successor |
| Unit / Lesson / LessonPrerequisite | Version-owned order, objectives, permitted activity rules and acyclic dependencies |
| Enrollment | User, captured course version, start/completion and resume state |
| LessonProgress / exemption evidence | Enrollment-owned status, objective evaluation, provenance and contributing sessions |
| Shared KeyStat / PairStat and reviews | Existing user-level evidence; not copied into each enrollment |

Course-linked assignments capture enrollment/version/lesson identity and effective constraints alongside the existing text, settings and engine/scoring versions. Generic practice and standalone tests remain possible without enrollment. The server derives valid relationships from the owned enrollment; never trust a client-supplied course/version/lesson combination. Course eligibility and shared skill state are read under the existing submission concurrency strategy; result, learning evidence, lesson progress and qualifying rewards commit atomically and replay safely. Changing or selecting another course cannot alter a running assignment. Email, LLM and PDF work stay outside that transaction.

Publishing validates graph/content/feasibility and immutable policy references before activation. Retain referenced versions and assigned text independently of later edits. Explicit enrollment migrations need a progress-mapping policy; no automatic remapping is assumed. Reusing evidence must not issue a second session reward. Account deletion/retention covers enrollments and progress without deleting shared course definitions. Exact uniqueness constraints, completion evidence storage and version-transition transactions are design gates, not already accepted models.

## 10. What may be deferred

Defer optional sound effects, reminder emails, charts beyond the required evaluation table and a production Dockerfile when unnecessary. Keep the required accessibility options, public verification, audit records and core admin capabilities. Google sign-in, leaderboards and coaching notes are already outside scope. Dropping forum, certificates or required administration needs an explicit SRS change.

This structure intentionally avoids a separate scoring implementation per mode, LLM calls inside transactions, runtime settings hidden in pure modules and a scheduler that silently loses work while the host sleeps.
