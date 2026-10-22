# Development guide

Start with the [README quick start](../README.md#quick-start). Root workspace commands target `server/src/`. The teammate's backend from commit `68d311f` is migrated into that structure; its old CommonJS paths are replaced by feature modules, not a second running server. The Figma frontend is still pending integration.

## Docker setup for teammates (Windows)

Use this section if Docker is not installed yet. Each teammate running the backend/database or integration tests needs the local services. Docker runs PostgreSQL and Mailpit; React and Express run on your computer through npm. Each teammate has their own database and inbox: local accounts/results are not shared through Git. Committed migrations provide the same database structure, and seeds provide starter content.

### 1. Install and check the tools — once

Install Git, VS Code, Node.js 24.14.0 (matching `.nvmrc`) with npm 11, and [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/). Use the WSL 2 backend and follow the installer's prompts; restart Windows if requested. If WSL is missing or outdated, follow Docker's [WSL setup instructions](https://docs.docker.com/desktop/features/wsl/). PostgreSQL, Mailpit and Docker Compose do not need separate installations when using Docker Desktop.

Reopen the VS Code terminal after installation and check:

```powershell
node --version
npm --version
docker --version
docker compose version
```

Open Docker Desktop and wait until its engine is running. This project needs Linux containers. Check engine access with:

```powershell
docker info
```

An installed Docker command does not mean the engine is running. If this reports a connection or `dockerDesktopLinuxEngine` named-pipe error, open/wait for Docker Desktop; restart it if necessary before continuing.

### 2. Set up the repository — once per clone

Follow the [README quick start](../README.md#quick-start) for cloning and environment values. All commands run from the repository root containing the main `package.json`, not from `client/` or `server/`. Do not use another teammate's absolute folder path.

Run the following commands **one at a time**; stop and resolve any error before continuing:

```powershell
npm ci
npm run setup:env
npm run db:generate
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

`npm ci` installs all workspaces from the root lockfile. Environment setup creates missing local files and a signing secret; existing files remain unchanged. Prisma generation creates the backend database client. Docker downloads the pinned service images on the first `db:up`, which may take longer, then waits for readiness. Migrations create/update the development tables; seeding adds starter curriculum without creating accounts. `dev` starts the website and API; keep its terminal open. Do not commit actual `.env` files.

Check the website at http://localhost:5173 and API readiness at http://localhost:5000/health/ready, which should return `{"status":"ready"}`. Open http://localhost:8025 for verification/reset emails captured by Mailpit; these are not delivered to real recipients. To inspect registered accounts and other records, run `npm run db:studio` in another root terminal and open the address it prints.

The database host port defaults to 5432; teammates do not automatically need this checkout's 55432 override. If 5432 is unavailable, follow [troubleshooting](#troubleshooting): set `TYPEFLOW_DB_PORT=55432` in the root `.env` and update both database URLs in an existing `server/.env`. Container-internal PostgreSQL stays on 5432. Preserve existing environment values and database volumes.

### 3. Every development session

Open Docker Desktop, wait for its engine, then run:

```powershell
npm run db:up
npm run dev
```

If the services are already running, `npm run dev` alone is sufficient. Run only one copy of the apps; see [development ports](#development-ports) for occupied-port errors. After pulling teammates' changes, use the [README daily commands](../README.md#every-day) and [database workflow](#database-workflow): install changed dependencies, regenerate Prisma after schema/client changes, apply newly committed migrations and seed changed starter content as needed. Do not repeat every initial-setup command daily.

For checks, use another root terminal: `npm run lint`, `npm test`, `npm run test:integration` and `npm run build`. Database integration tests need the running PostgreSQL service and use the separate `typeflow_test` database, not your development records. If that database is missing, see [database workflow](#database-workflow).

When finished, press `Ctrl+C` in the development terminal. Optionally run `npm run db:stop` to stop PostgreSQL/Mailpit while keeping PostgreSQL data. Normal stops/restarts preserve the database; deleting Docker volumes is not routine cleanup.

For frontend-only work that does not call real backend APIs, use `npm run dev:client`; Docker is needed once you test local database-backed features such as login. Existing screens may still call the backend, so frontend-only startup does not imply every feature will work.

## Foundation status and frontend handoff

Setup changes are confined to root tooling/CI, new server foundation and Prisma files, shared validation, environment examples, and selected existing documentation. All existing client files, `DESIGN.md`, `docs/context/current-state.md`, `docs/README.md` and `docs/frontend-design-plan.md` are reserved for the teammate. The only new tracked client file from setup is `.env.example`; local `.env` creation never replaces existing values. No Figma screen, Context, hook, translation, style or typing implementation is recreated by that setup. This foundation-only boundary predates the separately authorised [Tailwind styling migration](#frontend-styling); client API wiring remains unverified.

The original account migration is unchanged. Additive migrations extend it with the teammate's account/profile, curriculum, session/log, reward and supporting schema concepts, plus revocable auth sessions and one-use email tokens. The old destructive SQL bootstrap is not executed. Existing legacy-database rows are not automatically imported or converted; this task migrates implementation and schema into the current Prisma databases. Prisma 7 uses the PostgreSQL adapter and JavaScript client generator; generated output is ignored.

The server and its tests use ES modules. HTTP routes delegate to feature services; scoring, recommendations, fallback generation and reward calculations stay pure with explicit inputs. Database work uses Prisma/transaction-scoped helpers; email stays outside transactions. See the [API migration map](api-contract.md#teammate-backend-migration) for old-to-new paths and retained features.

Root `package-lock.json` is authoritative for workspace installs. The server lockfile was removed. The client lockfile is temporarily preserved for the teammate's handoff; do not independently regenerate it. CI installs from the root. Do not run a repository-wide formatter over the teammate's incoming files.

**Migration verification (15 October 2026):** lint, 13 unit tests and five PostgreSQL integration tests pass. Coverage includes registration and one-use verification, CSRF and role/owner denial, logout/reset/password-change revocation, partial preferences, last-admin protection, practice replay, concurrent submissions without lost XP, identical/conflicting retries, retention with retained retry hashes, account cascades and mastery/prerequisite unlocking. Prisma generation and client production build/server entry syntax are checked separately. Real local Mailpit SMTP accepted a synthetic message; account integration tests use an injected mail sink. Remote CI, Figma UI integration and production acceptance are not verified here.

This checkout uses the existing ignored root `.env` port override 55432 and matching server database URLs because Windows refused 5432. New clones default to 5432; see troubleshooting for overrides. No environment file was replaced and no database volume was reset during cleanup.

**Remaining dependency limitation:** the last audit reports four high-severity findings in Prisma tooling (`prisma`, `@prisma/config`, `deepmerge-ts`, `mysql2`). No forced major-version change or unverified override was applied. Review remediation before release.

**Prototype limits:** the recovered default target of 40 WPM/range 10–250, starter groups, 500 XP per level, minimum activity, expiry and speed/clock tolerances are development migration defaults, not newly accepted product policies. Session-start captures the immutable `teammate-migration-v1` policy. Current SRS formulas, raw-accuracy gate and evidence thresholds replace the old placeholders. Full placement/review/timed/certified modes, pair statistics, difficulty-level engine, AI generation, badges, certificate/forum/admin feature endpoints and deployment acceptance remain outstanding. Their placeholder schema concepts are preserved without claiming their workflows exist. Raw logs expire after the captured 30-day default and startup/hourly cleanup removes overdue logs while retaining results/retry hashes.

To integrate the teammate's older-base work safely:

1. He should create a feature branch and commit his local design work there before pulling or merging; inspect `git diff --cached` before committing and exclude `.env`, dependencies and generated output.
2. Once the setup changes are committed and shared, fetch and merge the team's setup branch into his feature branch. Use the actual branch name agreed by the team. Keep a normal merge history; there is no need to force-push.
3. Frontend files in the screenshots have no setup edits. The earlier documentation refactor can still cause conflicts, especially `docs/README.md` (deleted by the refactor) and `docs/context/current-state.md`. Review these manually. Move useful old-index notes to root README/development/contributing, retain the consolidated layout, and reconcile status to include both setup and design. Do not select “ours” or “theirs” for every conflict.
4. Preserve his design changes to `DESIGN.md` while retaining corrected links from the refactor. Review his new frontend-design-plan for unique information before deciding whether it belongs in DESIGN/contributing.
5. Run root `npm install` if his dependency manifests changed; resolve manifests first and regenerate the root lockfile rather than hand-merging lockfile contents. Then run lint, tests and build, and inspect the design in the browser. A clean Git merge alone does not prove runtime integration.

No merge or commit is performed automatically by setup. Screenshots identify the protected paths, but cannot guarantee the contents of a future commit or guarantee zero conflicts with the earlier refactor.

## Frontend styling

The client uses Tailwind CSS v4 with `@tailwindcss/vite`. Root workspace installs supply both packages; keep the root lockfile authoritative and preserve the historical client lockfile for the frontend handoff.

`client/src/main.jsx` imports only `index.css`. That file imports Tailwind and defines semantic theme utilities such as `bg-surface`, `text-muted`, `border-border-control`, `rounded-card` and `shadow-card`. The theme values follow the existing `data-theme` preference. Components use utilities for layout, typography, responsive rules and conditional states; hover styling uses CSS variants instead of mouse handlers. Arabic interface fonts use `rtl:` variants, while exercise passages and keyboard guides retain explicit LTR direction and monospace text.

Keep CSS limited to shared theme values, document defaults, focus/reduced-motion rules and keyframes. Avoid new screen-specific stylesheets or fixed inline styles. Inline widths remain only for values supplied by data, such as session progress and keyboard key widths. The retired `App.css`, `styles/index.css` and `styles/tokens.css` are consolidated into the single entry point.

The owner's 19 October 2026 appearance update selects a shared Mint palette for Light and Dark modes. Light uses off-white/white surfaces and deep mint actions; Dark uses a black canvas, charcoal surfaces and bright mint actions. Both share green progress, blue links/focus and gold rewards, with shades tuned for contrast. Tokens remain in `client/src/index.css` and match the updated [design colour system](../DESIGN.md#3-proposed-typeflow-colour-system). The existing Light/Dark/System preference resolves to the same two themes; native controls follow the resolved colour scheme. Client lint, production build and 94 opaque contrast checks across both modes pass; this colour change does not verify API integration or broader feature readiness.

Migration checks: lint, unit tests and production build pass. Server-rendered screen/state checks cover English/Arabic, both typing text sizes and keyboard states, and verify their utilities exist in the compiled CSS. Browser layout verification remains outstanding because no browser is available in this session. Backend/API integration is outside this styling change.

### FE-03 shared interface handoff

FE-03 keeps the existing FE-01 view names, `onNavigate(view)`, `onLogout` and `user` props. `AdminShell` reuses the authenticated shell with Admin-only destinations; profile and logout remain available at both desktop and mobile widths. Existing Admin section controls stay in `AdminView`, wrap on phones, and retain the same actions. Role guards and server checks remain authoritative.

Public and authenticated layouts expose `#main-content` for skip navigation and route focus. Shared native dialogs make the background inert, cycle Tab/Shift+Tab, support Escape/backdrop dismissal when allowed, and restore the opener. If navigation removes the opener, the destination main region receives focus. Appearance/language menus use menu-button/radio semantics with arrow, Home/End, Escape and Tab behavior; their position is constrained to the viewport. `index.css` remains the only styling entry point.

Additive component props for page-owner/reviewer review:

| Component | Props and ownership |
| --- | --- |
| `Loading` | `label` or `labelKey`, optional `compact`; announces status without fake progress |
| `EmptyState` | Localized `title`, `description`, optional paired `actionLabel`/`onAction` |
| `ErrorMessage` | `error.code` maps to safe interface copy; optional localized `title`/`message`, `onRetry`, `retrying`; never pass raw server text as UI copy |
| `ConfirmDialog` | Controlled `open`, `onCancel`, `onConfirm`; localized title/description/button labels, `pending`, `error`, `destructive`; page closes after success and retains error/retry state after failure |
| `Dialog` | Internal modal boundary in `components/ui/Dialog.jsx`; label or labelled-by ID, optional description ID/initial-focus ref, controlled `open`/`onClose`, `dismissible` |
| `DeviceGuidance` | `onBack`, optional localized `backLabel`; presentation only, no assignment or session effects |

Typing launch now checks the live viewport before either a real assignment request or a sample attempt is created. Resizing an existing attempt shows guidance while retaining its mounted typing page and existing pause/resume rules; Escape on that guidance cannot abandon the attempt. The explicit Back action retains the existing exit behavior. Existing authentication, profile, forum and typing dialogs adopt the shared boundary; screen contents and recording/scoring logic are preserved. Certificate cards only receive reflow fixes.

Data boundaries remain explicit: authentication, session restoration, profile/preferences, dashboard and adaptive-practice start/submit use the real API. Forum, certificate list, Admin management/analytics and sample review/tests remain development fixtures; Admin access probing uses the real API. Shared states/dialogs do not fetch or persist data. FE-03 browser tests intercept all API calls with disposable presentation fixtures and do not use a live database. The suite is restored; previously deleted results remain absent. See [test evidence and remaining review](testing.md#fe-03-shared-interface-browser-checks).

## GitHub CI

[The CI workflow](../.github/workflows/ci.yml) uses Ubuntu 24.04 and the Node.js version in `.nvmrc`. It installs all workspaces from the root lockfile, generates Prisma, runs lint, unit tests and PostgreSQL integration tests, then builds the client and checks server entry syntax. It supplies an ephemeral `typeflow_test` database and CI-only configuration; integration tests inject a mail sink. Failed steps stop later checks.

Frontend lint cleanup retains the existing rules. The preferences context and `usePreferences` hook live in `client/src/context/preferences.js`, while `PreferencesContext.jsx` exports the provider component for React Fast Refresh.

## Local services

The development setup runs Node applications on the host and PostgreSQL/Mailpit in Docker Compose:

| Service | Compose name | Host address | Local settings |
| --- | --- | --- | --- |
| PostgreSQL 16 | `db` | `localhost:5432` | Database `typeflow_dev`, user `typeflow`, password `typeflow_local_only` |
| Mailpit SMTP | `mailpit` | `localhost:1025` | Local mail capture; no real email credentials |
| Mailpit inbox | `mailpit` | `http://localhost:8025` | View verification/reset messages |
| React/Vite | Runs on host | `http://localhost:5173` | Start through the client workspace |
| Express | Runs on host | `http://localhost:5000/api/v1` | Start through the server workspace |

These credentials are disposable local examples, never production values. Bind database/email ports to loopback. Persist PostgreSQL 16 data in a named volume mounted at `/var/lib/postgresql/data`; changing container environment variables later does not rewrite credentials in an existing database volume. See the [official PostgreSQL image documentation](https://hub.docker.com/_/postgres).

`npm run db:up` wraps `docker compose up -d --wait db mailpit`; `npm run db:stop` wraps `docker compose stop db mailpit`. Image versions are pinned in Compose. Ordinary stop/start preserves the database volume.

## Connect to PostgreSQL

With Compose running, check readiness and open SQL from the repository root:

```powershell
docker compose exec db pg_isready -U typeflow -d typeflow_dev
docker compose exec db psql -U typeflow -d typeflow_dev
```

Inside `psql`:

```sql
SELECT current_database(), current_user;
```

Use `\dt` to list tables and `\q` to exit. Seeing no application tables before migrations is expected. These commands check PostgreSQL itself; the application's database connection must also use the environment settings below.

For pgAdmin or DBeaver, register a PostgreSQL connection with host `localhost`, port `5432`, database `typeflow_dev`, username `typeflow`, and the local password above. Test and save the connection. A SQL editor opened from your computer uses `localhost`; the `db` hostname is for containers on the Compose network.

If using an existing native PostgreSQL server instead of Docker, connect as your local administrator and create a dedicated login/database. Run these as separate statements outside a transaction:

```sql
CREATE ROLE typeflow LOGIN PASSWORD 'typeflow_local_only';
CREATE DATABASE typeflow_dev OWNER typeflow;
CREATE DATABASE typeflow_test OWNER typeflow;
```

Skip creation for objects that already exist. Use the same connection fields in the GUI and `.env`; use your actual credentials if different. Native PostgreSQL users still need the local email service if testing verification/reset through Mailpit.

PostgreSQL CLI reference: [psql documentation](https://www.postgresql.org/docs/16/app-psql.html).

## Environment variables

Run `npm run setup:env` to create local files from the tracked `server/.env.example` and `client/.env.example` without replacing existing files. It checks for an existing destination before reading its template and generates a random local JWT secret for a newly created server environment. If you have set `TYPEFLOW_DB_PORT` in your shell or ignored root `.env`, newly created server database URLs use that port. Existing server files still require manual updates when changing the Compose port. Restart the affected process after changing its environment.

Documented `server/.env` example:

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://typeflow:typeflow_local_only@localhost:5432/typeflow_dev?schema=public
TEST_DATABASE_URL=postgresql://typeflow:typeflow_local_only@localhost:5432/typeflow_test?schema=public
JWT_SECRET=replace-with-a-generated-local-secret
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=TypeFlow <no-reply@typeflow.local>
```

Generate a local signing secret and paste the output into `JWT_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Documented `client/.env` example:

```dotenv
VITE_API_URL=http://localhost:5000/api/v1
```

| Setting | Where it belongs | Notes |
| --- | --- | --- |
| Database/SMTP/JWT secrets | Server environment only | Never browser variables or committed real values |
| Session lifetime, cookie Secure/SameSite policy | Validated server configuration | Final names/defaults agreed during auth implementation |
| `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_TIMEOUT_MS` | Server environment only | Optional fallback-only development mode must work without credentials |
| Optional development mock toggle | Client development configuration | Disabled for production and integration demos |
| Accuracy/mastery/reward/certificate thresholds | Versioned business settings | Not untracked environment overrides |
| Appearance/UI locale | Account/visitor preferences | Not environment variables or exercise-content language |

Startup validates NODE_ENV, PORT, CLIENT_URL, DATABASE_URL, a non-placeholder JWT_SECRET of at least 32 characters and SMTP configuration without exposing their values. Empty SMTP authentication is supported for Mailpit. The former SMTP_PASS name is replaced by the documented SMTP_PASSWORD. Keep local/test/production credentials separate.

## Database workflow

Prisma owns schema and migrations in `server/prisma/`. Root scripts resolve the server config and schema automatically. Run `npm run db:generate` after install or schema changes. Database wrappers refuse production mode, non-loopback hosts and databases other than the expected `typeflow_dev` or `typeflow_test`; deployment tooling is a future task.

| Situation | Documented action |
| --- | --- |
| First clone or pulling committed schema changes | `npm run db:migrate` applies existing migrations to the development database only |
| You intentionally change the schema | Coordinate with schema reviewer; `npm run db:migration:create -- --name short-description` creates a development migration |
| Starter content needs loading | `npm run db:seed` adds missing key groups and prototype settings version without replacing content/accounts |
| Inspect data in a browser | `npm run db:studio` opens Prisma Studio for the development database |
| Integration tests | `npm run test:integration` explicitly targets `TEST_DATABASE_URL`, with an identity check before resets |
| Deployment | Controlled release applies committed migrations; production procedure reviewed before release |

Fresh Compose volumes create the separate test database automatically. For an existing volume or native PostgreSQL, create it once if missing:

```powershell
docker compose exec db createdb -U typeflow typeflow_test
```

An “already exists” message means it is already created. The integration wrapper validates TEST_DATABASE_URL, passes it explicitly as DATABASE_URL to migrations/tests, applies committed migrations, and checks database identity. Current integration checks read the test database without resetting it.

Never edit an applied shared migration or use `db push` on shared data. Review generated SQL for dropped data, backfills, defaults and compatibility; test both a fresh database and an upgrade. Do not reset the database or delete volumes as a routine fix for drift. Seeded demo accounts must be synthetic and local-only; do not commit real passwords or silently reset existing roles/passwords.

Use Prisma for ordinary access and parameterised SQL where it makes complex reporting clearer. Validate returned shapes; handle BigInt/numeric serialisation without unsafe casts. Ownership filters, timezone/report windows and dynamic sort allowlists remain required. Pass the transaction client through every participating helper; global-client calls escape that transaction. Keep external service calls outside it and test duplicate/concurrent submissions. See [architecture](architecture.md) for the result-saving flow.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Docker cannot connect | Start Docker Desktop/the Docker engine, then retry `npm run db:up` |
| Raw-log cleanup failed | The startup/hourly job could not delete expired keystroke logs. Check Docker, run `npm run db:up` and `npm run db:migrate`, then restart the apps. If it persists, report it; this generic message alone does not identify the database error. |
| Port 5432 is occupied | Check whether local PostgreSQL already owns it; use that instance or change the documented port and connection URL together |
| Windows forbids binding port 5432 | Put `TYPEFLOW_DB_PORT=55432` in an ignored root `.env`; change both database URLs in `server/.env` to port 55432, then rerun `npm run db:up`. pgAdmin uses the same host port; container-internal commands still use 5432. Preserve any existing root `.env` values. |
| Database connection refused | Check readiness, host/port and whether Node runs on host or in a container |
| Password authentication fails | Match the stored database credentials; container environment changes do not reset an existing volume's password |
| Database exists but tables are missing | Apply committed migrations to the correct development database |
| Verification email missing | Open Mailpit's inbox, check SMTP host/port, then retry the flow |
| Login cookie missing | Match the exact client origin, credentials option and local cookie policy; retain production protections |
| Client/server port occupied | Root `npm run dev` checks availability before starting either app; follow the process-identification steps below. Vite uses strict port 5173 to keep the documented browser origin stable. |
| Missing environment template | Restore the tracked `client/.env.example` / `server/.env.example` from the repository, then rerun `npm run setup:env`; preserve actual local `.env` files. |
| A documented script is missing | Foundations have not supplied that part of the target workflow; implement it in the setup task rather than inventing a successful run |

Before deployment, add verified provider/release commands, secret owners, backup/restore evidence, maintenance catch-up and rollback steps here. Hosting, operational/audit/backup retention and final performance environment remain open decisions.

### Development ports

Run only one copy of the applications. If another terminal is already running them, keep using it or press `Ctrl+C` there before starting again. The port check never stops existing processes or silently moves the website to another origin. Availability can change after the check, so the applications still handle binding failures themselves.

To identify listeners in PowerShell:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 5173,5000 -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess
```

Inspect a reported PID with `Get-Process -Id <PID>` (replace `<PID>` with its number). Stop it only after identifying it as your old development process, preferably through its original terminal. If server `PORT` differs from 5000, inspect that port instead. To intentionally change server `PORT`, update `client/.env`'s `VITE_API_URL` too and restart both apps. Changing a database host port requires updating both server database URLs; it does not change the client/API ports.
