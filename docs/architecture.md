# TypeFlow: Architecture and Project Structure

Version 1.4 — 22 October 2026

This describes the project structure and data flow aligned with [the SRS](srs.md) and [decisions](decisions.md). Section 6 distinguishes current implementation from planned behavior; folder trees include reserved future modules and are not proof of implementation. Paths below are relative to the repository root. For first-clone instructions and daily commands, use the [README](../README.md#quick-start); open this reference when working on module boundaries.

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

The tree below records the frontend scaffold and includes reserved future modules. App routing/providers, authentication, preferences, the shared Fetch transport and several data hooks now have implementations; other files remain comment-only placeholders. Preserve existing teammate screens, styles, translations, icons and typing behavior. Inspect a module before importing it; a listed filename does not guarantee usable exports. `tests/e2e/` remains a reservation, not evidence of executable browser coverage. Section 6 explains current real-API and fixture flows.

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
│   ├── mocks/                      # unwired synthetic DTOs; see mocks/README.md
│   │   ├── dashboard.js
│   │   ├── errors.js
│   │   ├── gamification.js
│   │   ├── index.js
│   │   ├── path.js
│   │   ├── sessions.js
│   │   ├── users.js
│   │   └── README.md
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

Data flow: page → feature hook → API function → shared Fetch transport → Express middleware/route → service/pure rules → Prisma/PostgreSQL; validated responses return to the query cache and then the screen. TanStack Query manages remote data and request state; Context coordinates identity/presentation. These foundations are implemented, while feature integrations remain mixed real API and explicitly labelled samples. Section 6 explains each step, failures and ownership. Frontend route guards never replace backend authentication/ownership checks.

The recorder emits ordered monotonic events. The target reducer handles allowed end-of-buffer operations and mode transitions; inspect implementation status before importing it. Live metrics must use shared formulas and remain provisional until submission succeeds; current browser formula copies are not authoritative. The frontend must retain the same submission payload during a network retry, and must not replay reward toasts as new awards when recovering an already-saved result. Section 6 separates these requirements from current recovery behavior.

Do not let polling or dashboard rendering interfere with typing. Large-text and reduced-pressure settings affect presentation, not official elapsed time. Defer optional sounds until required behaviour is working.

### Presentation, interface language and responsive layouts

SRS SYS-53–56 and [decision 0002](decisions.md#0002) require Light/Dark appearance, English/Arabic UI and desktop/mobile non-typing pages. [DESIGN.md](../DESIGN.md) owns the proposed palette, fonts and layout matrix. Preference coordination is implemented; complete presentation/browser acceptance remains separate from implementation status.

PreferencesContext coordinates stored appearance, resolved Light/Dark, UI locale/direction and accessibility preferences; TanStack Query owns the account DTO. Shared user schemas validate implemented `themePreference`/`uiLocale` fields. Account persistence uses owner-only `/users/me` partial updates without overwriting unrelated keys. Apply SRS section 10.5 defaults, visitor/account precedence, logout cleanup and failure recovery. These preferences are not immutable engine settings and do not enter scoring/generation.

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

The tree is a target module inventory. Current exports include health/empty-request contracts, auth/user request and response contracts, practice-session contracts and metrics. Course/enrollment and other reserved modules are not automatically implemented or exported. The [API contract](api-contract.md) records field-by-field status; never import a placeholder merely because it appears in this tree. Follow AGENTS.md's required file/function explanations for new or changed code.

Use runtime constants or Zod enums in `enums.js`. The shared package exposes JavaScript modules through agreed package exports without a static-type compilation step. Validate requests, external responses and configuration at their boundaries; keep fixtures aligned with those schemas.

## 5. Data model and persistence invariants

Account/practice persistence already has an implemented Prisma schema and migrations. The table below includes additional target concepts; it does not claim that every listed model exists. Review future model additions per phase without changing the current schema through frontend tasks.

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

Target constraints: one official result per session, one key/pair statistic per user and item, unique badge awards, deduplicated reward events, unique certificate codes and one certificate per qualifying session. Store accepted payload hashes separately from expiring raw logs. Session handling must distinguish created, completed, abandoned and expired; current practice stores the first three statuses and derives expiry from its timestamp, as explained in section 6.

Completed results and settings versions are immutable during normal operation. Privacy deletion and retention remain allowed; “append-only” is not an exception to those requirements. Store the text actually assigned, not just a mutable content reference. Keep referenced settings versions available for retained results.

Protect updates from separate simultaneous sessions for the same student. Current submission uses a database-backed per-user row lock within a Serializable transaction and bounded retries. Future course/evidence writes must participate in that protection. Do not replace it with a process-local mutex, which fails across multiple server processes. Re-read current learning state under concurrency protection before applying the update.

## 6. Main flows

Use this section to follow an action from the screen to storage and back.

- **Current:** implemented code inspected on 22 October 2026. Browser acceptance is still separate.
- **Planned:** approved responsibility, but no working function/API is claimed.
- **Where:** links open source files; names identify the function or method to inspect.
- **Inline handler/effect:** code inside a containing function, not a separately exported function.

Exact JSON fields and verification status remain in the [API contract](api-contract.md#fe-02-current-frontend-boundary--22-october-2026).

### 6.1 System map and data ownership

~~~text
Screen / user action
  → feature hook or action handler
  → feature API function
  → shared Fetch transport
  → Express middleware and route
  → service coordinates rules and database work
  → PostgreSQL through Prisma

Response returns:
  service → route JSON → Fetch validation → query cache/action state → screen
~~~

**Not every action sends a request.** Typing updates the local recorder. A guest theme change updates presentation/local storage.

| Data | Where it lives | Who changes it? |
| --- | --- | --- |
| Saved accounts, learning evidence and results | PostgreSQL | Server services through Prisma |
| Authentication JWT | httpOnly browser cookie | Server sets/clears it; browser sends it |
| Confirmed user + CSRF | Auth query and Context | [AuthContext.jsx](../client/src/context/AuthContext.jsx): AuthProvider |
| Remote summaries | In-memory TanStack cache | Feature queries and invalidation |
| Active buffer, events and timer | React state + recorder | [TypingSessionPage.jsx](../client/src/features/typing/pages/TypingSessionPage.jsx): TypingSessionPage |
| Appearance and language | PreferencesContext; guest storage or account fields | [PreferencesContext.jsx](../client/src/context/PreferencesContext.jsx): PreferencesProvider |
| Shared contracts/formulas | Imported code in each application | [shared/index.js](../packages/shared/src/index.js) exports implemented modules |

**Boundary:** the browser never connects directly to PostgreSQL, SMTP or the LLM. Shared code is a library, not another running service.

### 6.2 Startup and the first browser load — current

~~~text
npm run dev
  → Vite + API process
  → React providers mount
  → restore identity
  → apply preferences
  → choose accessible route
~~~

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Start processes | Check ports, then launch client and server. | [root package.json](../package.json): predev/dev commands; [check-dev-ports.js](../scripts/check-dev-ports.js) |
| 2. Prepare API | Validate environment; create Prisma adapter; assemble Express; start retention; listen. | [server.js](../server/src/server.js): top-level startup; [env.js](../server/src/config/env.js): loadEnvironment(); [prisma.js](../server/src/db/prisma.js): createDatabase() |
| 3. Render React | Apply visitor presentation before render; load the single stylesheet and provider tree. | [main.jsx](../client/src/main.jsx): applyGuestPreferencesBeforeRender(), createRoot().render(); [providers.jsx](../client/src/app/providers.jsx): AppProviders() |
| 4. Restore identity | Request /auth/me; expose loading, authenticated, anonymous or error state. | [AuthContext.jsx](../client/src/context/AuthContext.jsx): AuthProvider(), sessionQuery.queryFn; [api/auth.js](../client/src/api/auth.js): fetchCurrentSession() |
| 5. Apply presentation | Use account preferences when authenticated; otherwise visitor/default values. | [PreferencesContext.jsx](../client/src/context/PreferencesContext.jsx): readGuestPreferences(), preferencesFromUser(), identity-sync effect |
| 6. Select screen | Check signed-in state and role before rendering protected routes. | [router.jsx](../client/src/app/router.jsx): AppRouter(), AppRoutes(); [RequireAuth.jsx](../client/src/components/RequireAuth.jsx): RequireAuth(); [RequireRole.jsx](../client/src/components/RequireRole.jsx): RequireRole() |

**Important limits:**

- Development startup does **not** start Docker, run migrations or seed content.
- A listening API is not proof of a working database.
- [app.js](../server/src/app.js), createApp(): /health/live checks the process; /health/ready probes PostgreSQL.
- Server database/SMTP/signing secrets stay server-side. VITE_API_URL is public frontend configuration.
- [server.js](../server/src/server.js), shutdown signal handlers: stop retention, close HTTP and disconnect Prisma.

### 6.3 Reading data: opening the dashboard — current

~~~text
Dashboard
  → useDashboard()
  → account-scoped query cache
  → fetchDashboard()
  → request('/dashboard')
  → authentication + Student check
  → summary database read
  → cache result → render
~~~

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Subscribe | Ask for data/loading/error/refetch state. Disable fetching without a user. | [Dashboard.jsx](../client/src/features/dashboard/Dashboard.jsx): Dashboard(); [useDashboard.js](../client/src/features/dashboard/hooks/useDashboard.js): useDashboard() |
| 2. Identify cache entry | Build a key containing owner ID and resource name. | [queryKeys.js](../client/src/lib/queryKeys.js): queryKeys.dashboard(), resource(), owner() |
| 3. Fetch when needed | Reuse fresh data, or call the query function. Pass its abort signal onward. | [queryClient.js](../client/src/app/queryClient.js): queryClient defaults; [api/dashboard.js](../client/src/api/dashboard.js): fetchDashboard() |
| 4. Send HTTP | Add API base URL and cookie credentials; handle response/error parsing. | [api/client.js](../client/src/api/client.js): request() |
| 5. Dispatch/check access | Apply middleware, locate /dashboard and require an active authenticated Student. | [app.js](../server/src/app.js): createApp(); [routes.js](../server/src/routes.js): createRoutes(), inline GET handler; [middleware/auth.js](../server/src/middleware/auth.js): createAuthMiddleware(), requireRole() |
| 6. Build summary | Lock the user, initialize missing starter evidence, read saved data and derive daily goal/streak/recommendation. | [path/service.js](../server/src/modules/path/service.js): createPathService() returns the summary function; [stats/service.js](../server/src/modules/stats/service.js): ensureKeyProgress(); [path/recommend.js](../server/src/modules/path/recommend.js): recommendNext() |
| 7. Return/render | Select dashboard JSON; resolve the query; cache it under this owner's key; rerender subscribers. | [routes.js](../server/src/routes.js): inline /dashboard handler → request() → useDashboard() → Dashboard() |

**How the cache behaves:**

- Example key: ['owner', 'student-123', 'dashboard', {}].
- The key names cached data. It does not send a request or grant access.
- Current defaults: 30-second freshness, one query retry, no window-focus refetch.
- Freshness is not a 30-second polling schedule.
- API HTTP responses use no-store; TanStack's in-memory application cache is a separate mechanism.
- Current summary reads can initialize missing key evidence; they are not entirely read-only database operations.

**Other current summaries use the same backend function:**

| UI query | Frontend entry | API returns |
| --- | --- | --- |
| Learning path | [useLearningPath.js](../client/src/features/learning-path/useLearningPath.js): useLearningPath() → [api/path.js](../client/src/api/path.js): fetchLearningPath() | Groups, key evidence and recommendation |
| Progress | [useProgress.js](../client/src/features/progress/hooks/useProgress.js): useProgress() → [api/progress.js](../client/src/api/progress.js): fetchProgress() | Completed sessions and key evidence |
| Rewards | [useGamification.js](../client/src/features/gamification/hooks/useGamification.js): useGamification() → [api/gamification.js](../client/src/api/gamification.js): fetchGamification() | XP, level, streak and daily goal |

**Schema coverage:** current auth/session responses are validated by shared runtime schemas. These summary response schemas still need feature-owner agreement; transport currently returns their JSON without that DTO validation.

### 6.4 Registration, mail, login and logout — current

#### A. Register and verify email

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Submit credentials | Validate form values and call the registration action. | [AuthPages.jsx](../client/src/features/auth/AuthPages.jsx): AuthModal(); [router.jsx](../client/src/app/router.jsx): AuthRoute(), submit(); [AuthContext.jsx](../client/src/context/AuthContext.jsx): signUp() |
| 2. Send/validate | Choose register endpoint; validate again on the server. Unknown role fields cannot create an Admin. | [api/auth.js](../client/src/api/auth.js): register(); [shared/auth.js](../packages/shared/src/auth.js): registerSchema; [auth/routes.js](../server/src/modules/auth/routes.js): authRoutes() |
| 3. Create account | Hash password and store an unverified Student. | [auth/service.js](../server/src/modules/auth/service.js): createAuthService() → register() |
| 4. Send link | Generate token, save only its hash/expiry, then send email outside the token transaction. | Same service: emailLink(); [auth/tokens.js](../server/src/modules/auth/tokens.js): generateToken(), hashToken(); [mailer/index.js](../server/src/integrations/mailer/index.js): createMailer() |
| 5. Verify once | Read link token, send it to API, consume it and mark email verified. | [router.jsx](../client/src/app/router.jsx): EmailVerificationRoute(); [VerifyEmailPage.jsx](../client/src/features/auth/pages/VerifyEmailPage.jsx): VerifyEmailPage(); [api/auth.js](../client/src/api/auth.js): verifyEmail(); auth service: verify(), consumeToken() |

**Mailpit receives development emails. PostgreSQL stores accounts and token hashes.**

If SMTP fails, the account may already exist. Report delivery failure and use resend; do not assume the account transaction rolled back. Verification does not automatically log in.

#### B. Login and restore a session

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Sign in | Send credentials and wait for a server-confirmed identity. | [router.jsx](../client/src/app/router.jsx): AuthRoute(), submit(); [AuthContext.jsx](../client/src/context/AuthContext.jsx): signIn(); [api/auth.js](../client/src/api/auth.js): login() |
| 2. Authenticate | Compare password, recheck account state and create a revocable AuthSession. | [auth/service.js](../server/src/modules/auth/service.js): login() |
| 3. Set credentials | Set JWT cookie; return user DTO + CSRF separately in JSON. | [auth/routes.js](../server/src/modules/auth/routes.js): inline login handler; [auth/tokens.js](../server/src/modules/auth/tokens.js): cookieOptions(), csrfToken(); [users/dto.js](../server/src/modules/users/dto.js): publicUser() |
| 4. Store confirmed state | Validate JSON; cancel/remove old protected queries; update auth query. | [api/client.js](../client/src/api/client.js): request(); [shared/auth.js](../packages/shared/src/auth.js): authResponseSchema; [AuthContext.jsx](../client/src/context/AuthContext.jsx): signIn(), clearProtectedQueries() |
| 5. Restore after reload | Use the cookie to revalidate the server session; return user + CSRF again. | [api/auth.js](../client/src/api/auth.js): fetchCurrentSession(); [auth/routes.js](../server/src/modules/auth/routes.js): /me handler; [middleware/auth.js](../server/src/middleware/auth.js): createAuthMiddleware() |

**Credential separation:**

- JWT: httpOnly cookie, sent by the browser; not readable/persisted by application JavaScript.
- CSRF: returned by real login/me; exposed by AuthProvider to authenticated write callers.
- User DTO: public account fields only; never a password hash or internal auth record.
- Client validation does not replace server JWT, revocation, active-account or ownership checks.

#### C. Logout and other account changes

| Action | What happens | Where it happens |
| --- | --- | --- |
| Leave active practice on logout | Attempt server abandonment; clear local assignment; navigate out. | [router.jsx](../client/src/app/router.jsx): AppRoutes() → handleLogout(); [api/sessions.js](../client/src/api/sessions.js): abandonSession() |
| Revoke login | Send logout with CSRF; revoke AuthSession; clear cookie. | [AuthContext.jsx](../client/src/context/AuthContext.jsx): signOut(); [api/auth.js](../client/src/api/auth.js): logout(); backend auth routes/service: logout handler and logout() |
| Clear browser identity/data | Always cancel queries, remove non-auth cache entries and set auth query to null. | [AuthContext.jsx](../client/src/context/AuthContext.jsx): signOut() finally → clearSession() → clearProtectedQueries() |
| Restore visitor appearance | Reload visitor choices after identity becomes anonymous. | [PreferencesContext.jsx](../client/src/context/PreferencesContext.jsx): identity-sync effect, readGuestPreferences() |
| Reset password | Email a one-use reset link; consume it; change password and revoke sessions. | [api/auth.js](../client/src/api/auth.js): forgotPassword(), resetPassword(); [auth/service.js](../server/src/modules/auth/service.js): forgot(), reset(), consumeToken() |
| Change password / delete account | Require password and CSRF; revoke sessions or remove linked records. Protect the last active Admin. | [api/users.js](../client/src/api/users.js): changeMyPassword(), deleteMyAccount(); [users/service.js](../server/src/modules/users/service.js): changePassword(), remove() |

**Failure limit:** local logout still happens if HTTP logout fails. That does not prove server revocation; a retained cookie may authenticate again after reload. Current cleanup removes all non-auth cache entries, not just one owner prefix.

### 6.5 Saving a profile or changing appearance/language — current

~~~text
User changes a choice
  → immediate presentation update
  → guest localStorage OR authenticated profile PATCH
  → confirmed account DTO
  → update auth data / save status
~~~

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Capture change | Build a small allowed patch. Update presentation immediately for preference changes. | [ProfileView.jsx](../client/src/features/profile/ProfileView.jsx): saveProfile(); [PreferencesContext.jsx](../client/src/context/PreferencesContext.jsx): changePreference(), setThemePreference(), setUiLocale(), setLargeText(), setReducedPressure() |
| 2. Choose persistence | Visitor: save allowed local values. Account: queue a real API save with CSRF. | PreferencesProvider: changePreference(), enqueueAccountSave() |
| 3. Validate and send | Parse strict profile schema; reject extra fields; send only the patch. | [api/users.js](../client/src/api/users.js): updateMyProfile(); [api/client.js](../client/src/api/client.js): request(); [shared/auth.js](../packages/shared/src/auth.js): profileSchema |
| 4. Update owner | Authenticate, check CSRF, update only supplied fields and return public DTO. | [users/routes.js](../server/src/modules/users/routes.js): userRoutes(), PATCH handler; [users/service.js](../server/src/modules/users/service.js): update(); [users/dto.js](../server/src/modules/users/dto.js): publicUser() |
| 5. Confirm or recover | Update confirmed user; on save failure restore affected choices and offer retry. | [AuthContext.jsx](../client/src/context/AuthContext.jsx): updateUser(); PreferencesProvider: enqueueAccountSave(), retryPreferenceSave(); ProfileView: saveProfile() |
| 6. Apply appearance | Resolve System theme; set document language/direction; choose dictionary. | PreferencesProvider: resolvedTheme and DOM effect; [useTranslation.js](../client/src/i18n/useTranslation.js): useTranslation() |

**Rules:** saving locale does not replace an unrelated theme. Rapid account saves are queued. Account-switch/save-response races still need browser acceptance.

**Typing stays independent:** Arabic changes the shell, not English/LTR exercise content. Theme/locale changes must not replace text, reset the recorder or change official timing.

### 6.6 Starting real practice — current

~~~text
Start practice
  → server assignment request
  → load captured policy + eligible keys
  → generate fallback text
  → persist assignment
  → mount typing with server text
~~~

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Launch real mode | Request an assignment, not a locally invented exercise. | [router.jsx](../client/src/app/router.jsx): AppRoutes() → launchTyping({ serverPractice: true }) → useTypingSession().controller.startPractice(); [api/sessions.js](../client/src/api/sessions.js): startPracticeSession() |
| 2. Validate access/input | Require authenticated Student, CSRF and practice request shape. | [sessions/routes.js](../server/src/modules/sessions/routes.js): sessionRoutes(), POST handler; [shared/session.js](../packages/shared/src/session.js): startSessionSchema |
| 3. Read policy/evidence | Load prototype settings; briefly lock user and read initialized eligible keys. | [sessions/service.js](../server/src/modules/sessions/service.js): start(); [stats/service.js](../server/src/modules/stats/service.js): ensureKeyProgress(); [db/transaction.js](../server/src/db/transaction.js): transaction() |
| 4. Produce text | Weight available keys and generate fallback outside the read transaction. | [fallbackGenerator.js](../server/src/modules/generation/fallbackGenerator.js): keyWeight(), generatePracticeText() |
| 5. Capture assignment | Save owner, exact text, rules/target/timezone, settings reference and expiry. | Sessions service: start() → database.typingSession.create() |
| 6. Check response | Validate assignment DTO before the page uses it. | [api/client.js](../client/src/api/client.js): request(); [shared/session.js](../packages/shared/src/session.js): sessionAssignmentSchema |
| 7. Enter typing | Keep the full assignment in the owner-scoped controller; the router navigates to /typing. | [router.jsx](../client/src/app/router.jsx): launchTyping(), AuthenticatedLayout(); [TypingSessionPage.jsx](../client/src/features/typing/pages/TypingSessionPage.jsx): TypingSessionPage() |

**Current limits:**

- Practice is the only server mode implemented.
- Missing settings/unlocked content returns CONTENT_NOT_READY, not an empty exercise.
- No LLM/cache orchestrator is called by current start().
- Router source='server' means API-backed; assignment source='fallback' describes text generation.
- [useTypingSession.js](../client/src/features/typing/hooks/useTypingSession.js) owns one controller above routes. [sessionController.js](../client/src/features/typing/sessionController.js): startPractice() prevents duplicate pending starts; restart() confirms abandonment before replacement.
- Reload stores only owner/session IDs in tab storage. recover() retrieves real owned status; [SessionRecovery.jsx](../client/src/features/typing/components/SessionRecovery.jsx) explains lost typing progress. Completed results recover directly; unfinished attempts require explicit abandon/restart.
- Planned lesson/placement/review/test modes must reuse this lifecycle with reviewed mode rules.

### 6.7 While the student types — current

**No API request is needed for every character.**

| User action | What changes | Where it happens |
| --- | --- | --- |
| Insert a character | Append buffer input; record ordered insert and elapsed timestamp. | [TypingSessionPage.jsx](../client/src/features/typing/pages/TypingSessionPage.jsx): handleCharInput(); [keystrokeRecorder.js](../client/src/features/typing/engine/keystrokeRecorder.js): KeystrokeRecorder.recordInsert() |
| Backspace | Remove the last buffered character; record the edit. | TypingSessionPage: handleBackspace(); KeystrokeRecorder.recordBackspace() |
| Pause/resume | Change local pause state and record transitions. | TypingSessionPage: togglePause(); KeystrokeRecorder.recordPause(), recordResume() |
| Update feedback | Render highlighting and provisional metrics from local state. | TypingSessionPage: live useMemo; [liveMetrics.js](../client/src/features/typing/engine/liveMetrics.js): computeLiveMetrics(); [TypingStage.jsx](../client/src/features/typing/components/TypingStage.jsx): TypingStage() |
| Finish | Copy captured events and adapt finishTime to API finishTimeMs. | TypingSessionPage: handleComplete(); KeystrokeRecorder.getSubmissionPayload() |

**Real result:** send events/time; the server derives official metrics. Do not submit trusted XP, WPM, mastery or correctness flags.

**Sample result:** handleComplete() takes its isFixture branch and uses computeOfficialResults() locally with sample:true. Despite that helper's name, this result is not server-authoritative.

**Remaining debt:** browser formula copies and sample views are not completion evidence for real scoring, review/tests, certificates, forum or admin APIs.

### 6.8 Submitting, replaying and committing a real result — current

~~~text
Captured events
  → strict request validation
  → canonical payload hash
  → Serializable transaction + user lock
  → owned assignment + retry/state checks
  → replay → metrics/evidence → mastery/rewards
  → save everything together
  → committed official result
~~~

| Step | What happens | Where it happens |
| --- | --- | --- |
| 1. Send submission | Send events/finish time with cookie and CSRF. Reject extra fields and invalid shapes. | [TypingSessionPage.jsx](../client/src/features/typing/pages/TypingSessionPage.jsx): handleComplete(); [api/sessions.js](../client/src/api/sessions.js): submitSession(); [shared/session.js](../packages/shared/src/session.js): submissionSchema, eventSchema |
| 2. Enter service | Authenticate, enforce role/CSRF/body limits and parse request. | [app.js](../server/src/app.js): createApp(); [sessions/routes.js](../server/src/modules/sessions/routes.js): submit handler; [validate.js](../server/src/middleware/validate.js): parse() |
| 3. Identify payload | Canonicalize events/time and calculate accepted-payload hash. | [sessions/service.js](../server/src/modules/sessions/service.js): submit(), canonical/payloadHash |
| 4. Protect consistency | Open Serializable transaction, lock user and load by session ID + owner ID. | Sessions service: submit(); [db/transaction.js](../server/src/db/transaction.js): transaction() |
| 5. Check retry/state | Same accepted hash: return saved result. Different hash: conflict. Expired/abandoned: unavailable. | Sessions service: submit() completed/status/expiry checks |
| 6. Replay official attempt | Rebuild buffer; check edits, timing, pauses and completion; derive metrics/evidence from stored text. | [scoring/replay.js](../server/src/modules/scoring/replay.js): replay(); [shared/metrics.js](../packages/shared/src/metrics.js): calculateMetrics() |
| 7. Apply learning/rewards | Gate on raw accuracy; update key evidence/mastery/unlocks and calculate XP/streak. | [stats/service.js](../server/src/modules/stats/service.js): updateKeyProgress(); [adaptive/mastery.js](../server/src/modules/adaptive/mastery.js): updateKeyEvidence(), eligibleUnlocks(); [gamification/rules.js](../server/src/modules/gamification/rules.js): rewards() |
| 8. Commit saved state | Save result/hash/raw log and account/activity/evidence changes atomically. | Sessions service: submit(), transaction-scoped Prisma updates |
| 9. Render confirmed result | Validate response, then render returned metrics/reward values. | [api/client.js](../client/src/api/client.js): request(); [shared/session.js](../packages/shared/src/session.js): sessionResultSchema; TypingSessionPage: handleComplete(); [OfficialResult.jsx](../client/src/features/result/OfficialResult.jsx): OfficialResult() |

**Transaction facts:**

- Replay currently runs **inside** the result transaction.
- Failure rolls back that transaction's result/evidence/reward changes together.
- Recognized serialization/deadlock errors can retry database work up to three additional times.
- No LLM, SMTP or PDF work runs inside this transaction.
- Expiry is checked from a timestamp; no persisted expired-status transition currently exists.
- Current result has certificate:null. Full course progress/pair evidence/badge/certificate effects remain planned.
- The hash supports identical retries. It is not proof of human typing.

### 6.9 Refreshing other screens and recovering uncertain writes

| Event | What happens | Where it happens |
| --- | --- | --- |
| Confirmed submission or recovered result | Cache the owned result and refresh dashboard/path/progress/rewards/history plus the shell's identity summary. | [useTypingSession.js](../client/src/features/typing/hooks/useTypingSession.js): onResult callback; [sessionController.js](../client/src/features/typing/sessionController.js): acceptResult() |
| Confirmed profile save | Refresh affected dashboard/reward summaries. | [ProfileView.jsx](../client/src/features/profile/ProfileView.jsx): saveProfile() |
| Active stale query | TanStack normally refetches it; subscribers render updated data. | Existing useDashboard(), useLearningPath(), useProgress(), useGamification() hooks |
| Cancel owner reads | AbortSignal reaches Fetch; cancelled query data cannot populate its cache. | Query functions in [client/src/api](../client/src/api); [api/client.js](../client/src/api/client.js): request() |
| Logout/account cleanup | Cancel requests, remove cached protected data and reset identity. | [AuthContext.jsx](../client/src/context/AuthContext.jsx): clearProtectedQueries(), clearSession() |

**Invalidate vs remove:** invalidation marks data stale; removal discards cached entries. Neither operation writes results to PostgreSQL.

**If submit loses its response:**

1. The server may already have committed.
2. Keep the same events/time payload.
3. Retrieve the owned saved result or retry that identical payload under the agreed session UX.
4. Do not invent a local official result or create a replacement assignment to hide uncertainty.

**Where support exists:** [api/sessions.js](../client/src/api/sessions.js), fetchSession()/submitSession(); [sessions/service.js](../server/src/modules/sessions/service.js), get()/submit().

**Current retry/reload boundary:** [useSubmitSession.js](../client/src/features/typing/hooks/useSubmitSession.js) delegates to sessionController.submit()/retry(). The first payload is copied once; explicit retry retrieves owned status before resending the identical body. Recovered results refresh owner summaries without new reward notifications. Late responses are invalidated on logout/account change. request() never automatically retries writes.

**Still pending:** human/browser acceptance recorded in testing, backend start idempotency, and future FE-16 notification UI. Notifications must consume the controller's deduplicated newRewards, not replay saved rewards.

### 6.10 Adaptive decisions, future courses and LLMs

#### Current adaptive loop

| Input → output | What decides it? | Where it happens |
| --- | --- | --- |
| Replayed events → per-key evidence | Attempts, errors and eligible latency samples | [scoring/replay.js](../server/src/modules/scoring/replay.js): replay() |
| New evidence + old statistics → mastery/unlocks | Captured policy and raw-accuracy gate | [stats/service.js](../server/src/modules/stats/service.js): updateKeyProgress(); [adaptive/mastery.js](../server/src/modules/adaptive/mastery.js): updateKeyEvidence(), eligibleUnlocks() |
| Saved evidence → next recommendation | Current prototype recommendation rules | [path/recommend.js](../server/src/modules/path/recommend.js): recommendNext() |
| Eligible keys/evidence → next text | Key weighting and fallback generation | [fallbackGenerator.js](../server/src/modules/generation/fallbackGenerator.js): keyWeight(), generatePracticeText() |

Pure rules receive explicit state/settings/time/randomness. They do not fetch database settings or call integrations themselves.

#### Planned course flow

~~~text
Admin draft → validate/publish immutable version
Student enrollment → pin version → evaluate entry evidence
Lesson request → shared session engine
Official submission → shared skill update + enrollment progress + reward commit
~~~

| Responsibility | What it will do | Reserved location — not implemented |
| --- | --- | --- |
| Author/publish | Validate metadata, lesson graph, objectives and feasible constraints; preserve published versions. | [courses/publication.js](../server/src/modules/courses/publication.js), [courses/validator.js](../server/src/modules/courses/validator.js); future functions not defined |
| Enroll and choose activity | Capture owned course version; evaluate prerequisites and entry evidence. | [courses/service.js](../server/src/modules/courses/service.js), [courses/path.js](../server/src/modules/courses/path.js), [courses/placement.js](../server/src/modules/courses/placement.js); future functions not defined |
| Save course progress | Apply lesson objective/completion/exemption evidence within the common submission transaction. | [courses/progress.js](../server/src/modules/courses/progress.js); future functions not defined |

**Required distinctions:** shared skill evidence vs enrollment progress; placement exemption vs mastery vs completion. Reused evidence must not award XP twice. Existing enrollments stay pinned; archive blocks new enrollments without discarding agreed history/access.

#### Planned text-generation flow

~~~text
Approved learning objective
  → feasible exercise specification
  → matching validated cache / reviewed LLM-and-fallback policy
  → validate alphabet, coverage, length and content
  → persist exact assignment text
~~~

| Boundary | Responsibility | Reserved location — not implemented |
| --- | --- | --- |
| Orchestration | Choose source; enforce feasibility, cache/version and validation rules. | [generation/service.js](../server/src/modules/generation/service.js), [feasibility.js](../server/src/modules/generation/feasibility.js), [validator.js](../server/src/modules/generation/validator.js), [cache.js](../server/src/modules/generation/cache.js) |
| External LLM | Server-only provider call, bounded request and untrusted response handling. | [llm/client.js](../server/src/integrations/llm/client.js), [prompts.js](../server/src/integrations/llm/prompts.js), [schemas.js](../server/src/integrations/llm/schemas.js) |
| Existing fallback | Produce text using eligible keys; integrate with the reviewed source-validation pipeline. | [fallbackGenerator.js](../server/src/modules/generation/fallbackGenerator.js): generatePracticeText() is implemented |

The LLM supplies text only. It cannot award XP, unlock lessons, score sessions or issue certificates. Exact generation/course DTOs and cache policy still require review.

### 6.11 Other feature flows and integration boundaries

| Flow | How data will move | Current location/status |
| --- | --- | --- |
| Admin management | Form → validated role/CSRF-protected write → update + audit → refresh admin queries | [admin/routes.js](../server/src/modules/admin/routes.js), [admin/service.js](../server/src/modules/admin/service.js): reserved. Current real probe is [routes.js](../server/src/routes.js), createRoutes() /admin/ping handler |
| Analytics | Defined database aggregate → protected DTO → query → chart/table | [analytics/service.js](../server/src/modules/analytics/service.js): reserved; definitions/access scope need agreement |
| Forum | Input → permission/content validation → persistence → safe text rendering | [forum/routes.js](../server/src/modules/forum/routes.js), [forum/service.js](../server/src/modules/forum/service.js): reserved; current screen uses samples |
| Certificates | Captured result/policy → eligibility + saved record → PDF outside result transaction → owner download/public verification | [certificates/service.js](../server/src/modules/certificates/service.js), [eligibility.js](../server/src/modules/certificates/eligibility.js), [pdf/certificate.js](../server/src/integrations/pdf/certificate.js): reserved |
| Account email | Persist token hash → SMTP → user follows link → consume token | [auth/service.js](../server/src/modules/auth/service.js): emailLink(), consumeToken(); [mailer/index.js](../server/src/integrations/mailer/index.js): createMailer() — implemented |

Do not invent function names or mounted endpoints for reserved files. Future integration failures must not erase a committed result or duplicate an award on retry.

### 6.12 Failures and retries: where they are handled

| Layer | Where to inspect | Responsibility |
| --- | --- | --- |
| Browser request/response boundary | [api/client.js](../client/src/api/client.js): request(), contractFor(), failure(), ApiError | Validate shapes; preserve cancellation; normalize safe errors |
| Backend request validation | [validate.js](../server/src/middleware/validate.js): parse(), HttpError | Reject invalid fields independently of frontend checks |
| Authentication/CSRF | [middleware/auth.js](../server/src/middleware/auth.js): createAuthMiddleware(), csrf(), requireRole() | Enforce real session, role and security token |
| HTTP error response | [app.js](../server/src/app.js): createApp() final error middleware | Convert known errors; hide internal failures |
| Rate limit | [rateLimit.js](../server/src/middleware/rateLimit.js): authLimiter() | Bound account-route attempts |
| Database concurrency | [transaction.js](../server/src/db/transaction.js): transaction() | Retry recognized serialization/deadlock failures, not all errors |
| UI recovery | Feature query/action caller; [AuthContext.jsx](../client/src/context/AuthContext.jsx): sessionQuery.queryFn | Render error/retry; /auth/me 401 becomes anonymous |

| Result/code | Meaning | Caller response |
| --- | --- | --- |
| Local INVALID_REQUEST / server 400 | Invalid request fields | Correct input; no blind retry |
| CSRF_FAILED / 403 | Missing/invalid security token | Restore real session/token; never fabricate it |
| 401 | Missing/expired/revoked session | Signal auth recovery; global recovery for other protected reads remains pending |
| FORBIDDEN / 403 | Role/origin/access denied | Show permission/security state |
| NOT_FOUND / 404 | Resource unavailable | Do not substitute empty/sample data |
| 409 | Conflicting or unavailable session state | Retrieve/reconcile the saved state |
| INVALID_SUBMISSION / 422 | Replay rejected the attempt | Explain rejection; do not resend known-invalid events |
| RATE_LIMITED / 429 | Too many requests | Respect browser-accessible Retry-After metadata |
| 5xx / NETWORK_ERROR | Service/connectivity failure | Preserve recovery state; a write may have committed |
| CONTRACT_ERROR | Successful response has invalid JSON/DTO | Record a contract defect |
| FEATURE_UNAVAILABLE | Caller explicitly set available:false | Show unconnected-feature state without requesting it |

**Error language:** ApiError.messageKey selects apiErrors.CODE in the bundled [English](../client/src/i18n/dictionaries/en.json)/[Arabic](../client/src/i18n/dictionaries/ar.json) dictionaries. [useTranslation.js](../client/src/i18n/useTranslation.js), useTranslation(), resolves messages. Arabic approval and screen adoption are still pending.

**Do not confuse:** TanStack read retries, database transaction retries and browser submission retries are three different mechanisms. Transport does not automatically retry a write or fall back to fixtures.

### 6.13 Maintenance, retention and operational boundaries

| Event | What happens | Where it happens |
| --- | --- | --- |
| API starts | Run raw-log cleanup immediately; schedule hourly attempts. | [server.js](../server/src/server.js): startup; [purgeKeystrokeLogs.js](../server/src/jobs/purgeKeystrokeLogs.js): startLogRetention() |
| Cleanup runs | Delete expired KeystrokeLog rows; leave saved official results/hash separate. | Same job: purgeKeystrokeLogs() |
| Cleanup fails | Log a bounded message; retry on a later run. | startLogRetention() → run() catch |
| API stops | Stop interval, close HTTP listener, disconnect Prisma. | server.js: signal handlers; stopRetention() returned by startLogRetention() |
| Schema changes | Run guarded migrations through setup/release commands, never a page request. | [scripts/database.js](../scripts/database.js): command dispatcher; [Prisma migrations](../server/prisma/migrations) |
| Future durable jobs | Claim/checkpoint overdue work and coordinate multiple instances. | [jobs/runner.js](../server/src/jobs/runner.js), [pregenerateTexts.js](../server/src/jobs/pregenerateTexts.js): reserved |

**Current limitation:** the retention timer is process-local. It does not guarantee work while the host sleeps or provide durable cross-instance scheduling.

**Persistence limit:** query cache, active typing state and guest preferences are different from saved learning results. Reload recovery checks the stored owner/session pointer against the API; raw typing events are not persisted, so unfinished typing progress cannot resume.

Use [development](development.md#database-workflow) for database commands and [testing](testing.md) for acceptance evidence. Test execution must use the guarded dedicated test database.

## 7. API groups

All application routes use `/api/v1`. The [API contract](api-contract.md) distinguishes current routes/shared schemas from proposals. The groups below mix implemented subsets and future scope; see section 6 for execution flow and do not assume every example is mounted.

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
