# Development guide

Start with the [README quick start](../README.md#quick-start). This guide explains the documented target setup, PostgreSQL connections and database work. Existing application code is outside this documentation revision; commands and scripts must be implemented/verified during foundations before onboarding is declared working.

## Local services

The documented development setup runs Node applications on the host and PostgreSQL/Mailpit in Docker Compose. The foundation owner should configure the following contract:

| Service | Compose name | Host address | Local settings |
| --- | --- | --- | --- |
| PostgreSQL 16 | `db` | `localhost:5432` | Database `typeflow_dev`, user `typeflow`, password `typeflow_local_only` |
| Mailpit SMTP | `mailpit` | `localhost:1025` | Local mail capture; no real email credentials |
| Mailpit inbox | `mailpit` | `http://localhost:8025` | View verification/reset messages |
| React/Vite | Runs on host | `http://localhost:5173` | Start through the client workspace |
| Express | Runs on host | `http://localhost:5000/api/v1` | Start through the server workspace |

These credentials are disposable local examples, never production values. Bind database/email ports to loopback. Persist PostgreSQL 16 data in a named volume mounted at `/var/lib/postgresql/data`; changing container environment variables later does not rewrite credentials in an existing database volume. See the [official PostgreSQL image documentation](https://hub.docker.com/_/postgres).

`npm run db:up` is the documented root wrapper for `docker compose up -d db mailpit`; `npm run db:stop` wraps `docker compose stop db mailpit`. Agree exact image pins and implement the wrappers in foundations. Ordinary stop/start preserves the database volume.

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

PostgreSQL CLI reference: [psql documentation](https://www.postgresql.org/docs/16/app-psql.html). No local database is created or changed by this documentation task.

## Environment variables

The foundation phase supplies `server/.env.example` and `client/.env.example`. Copy them once as shown in the README; preserve local overrides after pulling changes. Restart the affected process after changing its environment.

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

The examples define the target contract, not environment names verified against current source. Validate runtime configuration at startup with errors that name missing variables without disclosing values. Update safe examples and this guide whenever an environment contract changes. Keep local/test/production credentials separate.

## Database workflow

Prisma owns the planned schema and migrations in `server/prisma/`. Root script names are defined in the README; their working directory/schema resolution must be implemented so teammates do not guess paths.

| Situation | Documented action |
| --- | --- |
| First clone or pulling committed schema changes | `npm run db:migrate` applies existing migrations to the development database only |
| You intentionally change the schema | Coordinate with schema reviewer; `npm run db:migration:create -- --name short-description` creates a development migration |
| Development content needs loading | `npm run db:seed` reconciles stable IDs/upserts without erasing learner progress |
| Inspect data in a browser | `npm run db:studio` opens Prisma Studio for the development database |
| Integration tests | `npm run test:integration` explicitly targets `TEST_DATABASE_URL`, with an identity check before resets |
| Deployment | Controlled release applies committed migrations; production procedure reviewed before release |

For the documented Compose database, create the separate test database once:

```powershell
docker compose exec db createdb -U typeflow typeflow_test
```

An “already exists” message means it is already created. Merely defining `TEST_DATABASE_URL` does not redirect a migration/test process; the integration script must explicitly use it, initialise its schema and refuse a development/production target.

Never edit an applied shared migration or use `db push` on shared data. Review generated SQL for dropped data, backfills, defaults and compatibility; test both a fresh database and an upgrade. Do not reset the database or delete volumes as a routine fix for drift. Seeded demo accounts must be synthetic and local-only; do not commit real passwords or silently reset existing roles/passwords.

Use Prisma for ordinary access and parameterised SQL where it makes complex reporting clearer. Validate returned shapes; handle BigInt/numeric serialisation without unsafe casts. Ownership filters, timezone/report windows and dynamic sort allowlists remain required. Pass the transaction client through every participating helper; global-client calls escape that transaction. Keep external service calls outside it and test duplicate/concurrent submissions. See [architecture](architecture.md) for the result-saving flow.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Docker cannot connect | Start Docker Desktop/the Docker engine, then retry `npm run db:up` |
| Port 5432 is occupied | Check whether local PostgreSQL already owns it; use that instance or change the documented port and connection URL together |
| Database connection refused | Check readiness, host/port and whether Node runs on host or in a container |
| Password authentication fails | Match the stored database credentials; container environment changes do not reset an existing volume's password |
| Database exists but tables are missing | Apply committed migrations to the correct development database |
| Verification email missing | Open Mailpit's inbox, check SMTP host/port, then retry the flow |
| Login cookie missing | Match the exact client origin, credentials option and local cookie policy; retain production protections |
| Vite starts on another port | Restore port 5173 or update `CLIENT_URL` to match the actual origin |
| A documented script is missing | Foundations have not supplied that part of the target workflow; implement it in the setup task rather than inventing a successful run |

Before deployment, add verified provider/release commands, secret owners, backup/restore evidence, maintenance catch-up and rollback steps here. Hosting, operational/audit/backup retention and final performance environment remain open decisions.
