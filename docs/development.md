# Development guide

Start with the [README quick start](../README.md#quick-start). Root workspace commands target `server/src/`. The teammate's backend from commit `68d311f` is migrated into that structure; its old CommonJS paths are replaced by feature modules, not a second running server. The Figma frontend is still pending integration.

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

Migration checks: lint, unit tests and production build pass. Server-rendered screen/state checks cover English/Arabic, both typing text sizes and keyboard states, and verify their utilities exist in the compiled CSS. Browser layout verification remains outstanding because no browser is available in this session. Backend/API integration is outside this styling change.

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

Run `npm run setup:env` to create local files from `server/.env.example` and `client/.env.example` without replacing existing files. It generates a random local JWT secret for a newly created server environment. Restart the affected process after changing its environment.

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
| Port 5432 is occupied | Check whether local PostgreSQL already owns it; use that instance or change the documented port and connection URL together |
| Windows forbids binding port 5432 | Put `TYPEFLOW_DB_PORT=55432` in an ignored root `.env`; change both database URLs in `server/.env` to port 55432, then rerun `npm run db:up`. pgAdmin uses the same host port; container-internal commands still use 5432. Preserve any existing root `.env` values. |
| Database connection refused | Check readiness, host/port and whether Node runs on host or in a container |
| Password authentication fails | Match the stored database credentials; container environment changes do not reset an existing volume's password |
| Database exists but tables are missing | Apply committed migrations to the correct development database |
| Verification email missing | Open Mailpit's inbox, check SMTP host/port, then retry the flow |
| Login cookie missing | Match the exact client origin, credentials option and local cookie policy; retain production protections |
| Vite starts on another port | Restore port 5173 or update `CLIENT_URL` to match the actual origin |
| A documented script is missing | Foundations have not supplied that part of the target workflow; implement it in the setup task rather than inventing a successful run |

Before deployment, add verified provider/release commands, secret owners, backup/restore evidence, maintenance catch-up and rollback steps here. Hosting, operational/audit/backup retention and final performance environment remain open decisions.
