# Development guide

Start with the [README quick start](../README.md#quick-start). Root workspace commands now target the new foundation in `server/src/`; old backend modules remain preserved and unmounted. The teammate's frontend implementation is still pending integration. See the status and handoff below.

## Foundation status and frontend handoff

Setup changes are confined to root tooling/CI, new server foundation and Prisma files, shared validation, environment examples, and selected existing documentation. All existing client files, `DESIGN.md`, `docs/context/current-state.md`, `docs/README.md` and `docs/frontend-design-plan.md` are reserved for the teammate. The only new tracked client file from setup is `.env.example`; local `.env` creation never replaces existing values. No Figma screen, Context, hook, translation, style or typing implementation is recreated here. Tailwind integration and client API wiring should be verified together with his actual implementation after it arrives.

The initial database migration contains only the account foundation (`User` and Student/Admin roles). Auth sessions/tokens, curriculum, learning and rewards arrive in their feature phases. No seed command exists yet. Prisma 7 uses the PostgreSQL driver adapter and the JavaScript client generator; generated output is ignored. See [Prisma's upgrade documentation](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

New server source and tests have local ES-module boundaries. The old server package remains CommonJS to preserve old files; new code uses ES modules. Root scripts start only `server/src/server.js`. Do not run the old SQL bootstrap against the new databases.

Root `package-lock.json` is authoritative for workspace installs. Nested lockfiles remain untouched during the handoff and should not be independently regenerated. CI installs from the root. Do not run a repository-wide formatter over the teammate's incoming files.

**Verification:** checks are recorded here after execution; a running health endpoint does not establish authentication or frontend feature correctness. CI is configured but a remote CI run requires the changes to be committed/pushed by the team.

To integrate the teammate's older-base work safely:

1. He should create a feature branch and commit his local design work there before pulling or merging; inspect `git diff --cached` before committing and exclude `.env`, dependencies and generated output.
2. Once the setup changes are committed and shared, fetch and merge the team's setup branch into his feature branch. Use the actual branch name agreed by the team. Keep a normal merge history; there is no need to force-push.
3. Frontend files in the screenshots have no setup edits. The earlier documentation refactor can still cause conflicts, especially `docs/README.md` (deleted by the refactor) and `docs/context/current-state.md`. Review these manually. Move useful old-index notes to root README/development/contributing, retain the consolidated layout, and reconcile status to include both setup and design. Do not select “ours” or “theirs” for every conflict.
4. Preserve his design changes to `DESIGN.md` while retaining corrected links from the refactor. Review his new frontend-design-plan for unique information before deciding whether it belongs in DESIGN/contributing.
5. Run root `npm install` if his dependency manifests changed; resolve manifests first and regenerate the root lockfile rather than hand-merging lockfile contents. Then run lint, tests and build, and inspect the design in the browser. A clean Git merge alone does not prove runtime integration.

No merge or commit is performed automatically by setup. Screenshots identify the protected paths, but cannot guarantee the contents of a future commit or guarantee zero conflicts with the earlier refactor.

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

Foundation startup validates NODE_ENV, PORT, CLIENT_URL and DATABASE_URL without exposing their values. JWT and SMTP values are reserved for authentication/email implementation; future phases must validate them before enabling those features. Keep local/test/production credentials separate.

## Database workflow

Prisma owns schema and migrations in `server/prisma/`. Root scripts resolve the server config and schema automatically. Run `npm run db:generate` after install or schema changes. Database wrappers refuse production mode, non-loopback hosts and databases other than the expected `typeflow_dev` or `typeflow_test`; deployment tooling is a future task.

| Situation | Documented action |
| --- | --- |
| First clone or pulling committed schema changes | `npm run db:migrate` applies existing migrations to the development database only |
| You intentionally change the schema | Coordinate with schema reviewer; `npm run db:migration:create -- --name short-description` creates a development migration |
| Development content needs loading | Deferred to the content phase; future `db:seed` must reconcile stable IDs/upserts without erasing progress |
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
