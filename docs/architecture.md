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

The active session module is `src/modules/sessions/`, matching the migrated API implementation. Use it for the single lifecycle across all modes; the earlier `typing/` name refers to the same responsibility, not a second module. Existing auth tokens stay in `modules/auth/tokens.js`, and combined middleware/helpers need not be split just to match the proposed filenames below. Current test commands use Node's built-in test runner; `vitest.config.js` below is a future option, not a setup prerequisite.

```text
server/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.js
│   └── content/
│       ├── keygroups.json
│       ├── wordlists/
│       ├── themes.json
│       └── blocked-words.txt
├── src/
│   ├── server.js                   # startup and graceful shutdown
│   ├── app.js                      # Express application assembly
│   ├── routes.js                   # mounts /api/v1 modules
│   ├── config/env.js               # validated environment values
│   ├── db/prisma.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT, revocation and active account check
│   │   ├── requireRole.js
│   │   ├── csrf.js
│   │   ├── validate.js
│   │   ├── rateLimit.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── logger.js
│   │   ├── tokens.js               # signed auth and hashed one-time tokens
│   │   └── time.js
│   ├── modules/
│   │   ├── auth/                   # register, verify, login, reset, revocation
│   │   ├── users/                  # profile, settings, coordinated deletion
│   │   ├── scoring/                # PURE
│   │   │   ├── replay.js
│   │   │   ├── logValidator.js
│   │   │   ├── evidence.js         # eligible key/pair samples
│   │   │   ├── scoreSession.js     # uses shared metric functions
│   │   │   └── *.test.js
│   │   ├── adaptive/               # PURE; settings passed as arguments
│   │   │   ├── defaults.js
│   │   │   ├── statsUpdate.js
│   │   │   ├── weakness.js
│   │   │   ├── focusSelection.js
│   │   │   ├── difficulty.js
│   │   │   ├── mastery.js
│   │   │   ├── spacedReview.js
│   │   │   ├── placement.js
│   │   │   ├── buildSpec.js
│   │   │   └── *.test.js
│   │   ├── sessions/               # ONE session lifecycle for all modes
│   │   │   ├── routes.js
│   │   │   ├── controller.js
│   │   │   ├── startSession.js
│   │   │   ├── submitSession.js
│   │   │   ├── abandonSession.js
│   │   │   └── repository.js
│   │   ├── stats/                  # reads and transaction-scoped writes
│   │   ├── path/                   # keyboard map and recommended activity
│   │   ├── generation/
│   │   │   ├── service.js
│   │   │   ├── feasibility.js
│   │   │   ├── validator.js
│   │   │   ├── fallbackGenerator.js
│   │   │   ├── cache.js
│   │   │   └── *.test.js
│   │   ├── gamification/           # pure reward rules + persistence helpers
│   │   ├── certificates/           # eligibility, records, revoke, verify, PDF
│   │   ├── forum/                  # threads, replies, accepted answer, reports
│   │   ├── settings/               # validated immutable settings versions
│   │   ├── analytics/              # defined aggregates and parameterised SQL
│   │   └── admin/                  # protected management workflows/audit
│   ├── integrations/
│   │   ├── llm/                    # client, prompts, response schemas
│   │   ├── mailer/                 # SMTP client and templates
│   │   └── pdf/                    # certificate document rendering
│   ├── jobs/
│   │   ├── runner.js               # scheduled execution and restart catch-up
│   │   ├── pregenerateTexts.js
│   │   └── purgeKeystrokeLogs.js
│   └── scripts/
│       ├── simulate/              # typists, policies, common assessment
│       ├── generate-texts.js
│       └── validate-content.js
├── tests/
│   ├── fixtures/
│   ├── setup.js                    # verifies dedicated typeflow_test database
│   └── integration/
├── package.json
└── vitest.config.js
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

```text
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── app/
│   │   ├── router.jsx
│   │   ├── providers.jsx
│   │   ├── queryClient.js
│   │   └── ErrorBoundary.jsx
│   ├── api/
│   │   ├── client.js               # credentials, base URL, safe 401 handling
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── sessions.js
│   │   ├── path.js
│   │   ├── progress.js
│   │   ├── gamification.js
│   │   ├── certificates.js
│   │   ├── forum.js
│   │   └── admin.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── RewardsContext.jsx
│   │   └── PreferencesContext.jsx
│   ├── hooks/
│   ├── i18n/                       # planned en/ar UI dictionaries and direction helpers
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/                 # student/admin shells and navigation
│   │   ├── RequireAuth.jsx
│   │   ├── RequireRole.jsx
│   │   ├── Loading.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── EmptyState.jsx
│   │   └── ConfirmDialog.jsx
│   ├── features/
│   │   ├── auth/
│   │   ├── placement/
│   │   ├── dashboard/
│   │   ├── keyboard-map/
│   │   ├── typing/
│   │   │   ├── pages/TypingSessionPage.jsx
│   │   │   ├── components/         # display, input, keyboard, controls, stats
│   │   │   ├── engine/
│   │   │   │   ├── keystrokeRecorder.js
│   │   │   │   ├── typingReducer.js
│   │   │   │   ├── liveMetrics.js  # calls shared formulas
│   │   │   │   └── *.test.js
│   │   │   └── hooks/              # start, record, submit, recover result
│   │   ├── result/
│   │   ├── tests/                  # UI for timed/certified session modes
│   │   ├── review/
│   │   ├── progress/
│   │   ├── gamification/
│   │   ├── certificates/
│   │   ├── forum/
│   │   ├── profile/
│   │   └── admin/
│   ├── lib/
│   │   ├── utils.js
│   │   └── queryKeys.js
│   ├── mocks/                      # schema-checked development fixtures
│   ├── styles/index.css
│   └── schemas/                    # browser-only runtime schemas, if needed
├── tests/e2e/
├── index.html
├── vite.config.js
├── components.json
├── .env.example
└── package.json
```

Page → feature hook → API function → shared HTTP client. Components render state; API files only send requests and handle transport shapes. TanStack Query owns remote data; Context handles the few cross-page UI concerns. API authentication/ownership checks remain mandatory even when frontend route guards exist.

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

## 10. What may be deferred

Defer optional sound effects, reminder emails, charts beyond the required evaluation table and a production Dockerfile when unnecessary. Keep the required accessibility options, public verification, audit records and core admin capabilities. Google sign-in, leaderboards and coaching notes are already outside scope. Dropping forum, certificates or required administration needs an explicit SRS change.

This structure intentionally avoids a separate scoring implementation per mode, LLM calls inside transactions, runtime settings hidden in pure modules and a scheduler that silently loses work while the host sleeps.
