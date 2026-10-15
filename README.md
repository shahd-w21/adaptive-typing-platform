# TypeFlow

An adaptive typing tutor built by a five-person university team. JavaScript, React, Tailwind CSS, Express and PostgreSQL/Prisma. Student and Admin roles; English typing on physical QWERTY keyboards, with English/Arabic interface and Light/Dark appearance.

**Development status:** your teammate's account/profile, practice/scoring, key-progress, dashboard/progress, reward and admin-check work is migrated into the ES-module server in `server/src/`, using Prisma. The pending Figma frontend is not integrated yet. These are migrated prototype features, not completion of every SRS requirement. See [migration and verification](docs/development.md#foundation-status-and-frontend-handoff) and the [API migration map](docs/api-contract.md#teammate-backend-migration).

## Quick start

Run commands from the repository root unless stated otherwise. The npm commands work in PowerShell and macOS/Linux shells.

### 1. Prerequisites and clone

Install Git, Node.js 24.14.0 (pinned in `.nvmrc`), npm 11, and Docker Desktop with its Linux engine running. PostgreSQL runs in Docker; you do not need a separate database installation. A native PostgreSQL alternative is in the development guide.

```powershell
git clone https://github.com/shahd-w21/adaptive-typing-platform.git
cd adaptive-typing-platform
npm install
```

The root package uses npm workspaces for `client`, `server` and `packages/shared`. One root install supplies all three. Use `npm ci` for clean reproducible installs from the root lockfile. The old client lockfile is temporarily preserved for the teammate's handoff; do not run separate installs inside client/server.

### 2. Configure your local environment

Create local environment files and a random signing secret; this helper preserves existing files:

```powershell
npm run setup:env
npm run db:generate
```

Edit `server/.env` so it points to your local database:

```dotenv
DATABASE_URL=postgresql://typeflow:typeflow_local_only@localhost:5432/typeflow_dev?schema=public
TEST_DATABASE_URL=postgresql://typeflow:typeflow_local_only@localhost:5432/typeflow_test?schema=public
PORT=5000
CLIENT_URL=http://localhost:5173
```

Use `VITE_API_URL=http://localhost:5000/api/v1` in `client/.env`. Existing environment files may need the values from the [environment example](docs/development.md#environment-variables); the helper never replaces them. JWT_SECRET must be a generated secret of at least 32 characters. Local email uses Mailpit on SMTP port 1025. Never commit actual `.env` files or put server secrets in `VITE_` values.

### 3. Start PostgreSQL and initialise the database

```powershell
npm run db:up
docker compose exec db pg_isready -U typeflow -d typeflow_dev
npm run db:migrate
npm run db:seed
```

`db:up` starts PostgreSQL and Mailpit and waits for readiness. `db:migrate` applies committed migrations to local `typeflow_dev`. `db:seed` adds missing starter key groups and an immutable development policy without replacing existing content or creating accounts. Fresh Docker volumes also create `typeflow_test`. Prisma migrations are the only schema setup path; existing data is preserved.

To open a database terminal:

```powershell
docker compose exec db psql -U typeflow -d typeflow_dev
```

At the `typeflow_dev=#` prompt, use `\conninfo` to inspect the connection, `\dt` to list tables, and `\q` to return to PowerShell. SQL statements need a semicolon, for example `SELECT current_database();`. `database` and port numbers are not standalone SQL commands. If the prompt changes to `typeflow_dev-#`, press `Ctrl+C` to cancel the unfinished statement. The Docker command already selects your database; the host port belongs in connection settings.

For pgAdmin/DBeaver: **host** `localhost`, **port** `5432`, **database** `typeflow_dev`, **user** `typeflow`, **password** `typeflow_local_only`. If port 5432 is unavailable, follow the [port override instructions](docs/development.md#troubleshooting) and use the override in both database URLs and your database tool. Detailed connection, test-database and native PostgreSQL instructions are in the [development guide](docs/development.md#connect-to-postgresql).

### 4. Start development

```powershell
npm run dev
```

The root script checks client port 5173 and the configured server port (5000 by default), then starts the client and server together. Keep that terminal open; use another terminal for checks. `Ctrl+C` stops the applications. Run one copy at a time. If a port is occupied, the check reports it before starting either app; see [port troubleshooting](docs/development.md#development-ports).

| Service | Documented local address |
| --- | --- |
| Website | http://localhost:5173 |
| API base | http://localhost:5000/api/v1 |
| Process health | http://localhost:5000/health/live |
| Database readiness | http://localhost:5000/health/ready |
| Email inbox | http://localhost:8025 |

Verify the existing client page loads and `/health/ready` reports database access. Account and practice APIs run under `/api/v1`; the base URL itself has no index page. Verification/reset links appear in Mailpit. Login uses an httpOnly cookie and returns a CSRF token required on authenticated writes. Use the [implemented contract](docs/api-contract.md#teammate-backend-migration) when connecting the pending Figma frontend.

## Every day

Pull the latest changes, run `npm install` if dependency manifests changed, apply new committed migrations with `npm run db:migrate`, then start development. Preserve your local environment overrides.

| From repository root | Purpose |
| --- | --- |
| `npm run db:up` | Start local PostgreSQL and Mailpit |
| `npm run dev` | Run both applications |
| `npm run dev:client` / `npm run dev:server` | Run one application separately |
| `npm run lint` | Check JavaScript/React code style and common errors |
| `npm test` | Run unit tests |
| `npm run test:integration` | Run database/API checks against the separate test database |
| `npm run build` | Generate Prisma client, build frontend, check server entry syntax |
| `npm run db:migrate` | Apply committed development migrations |
| `npm run db:generate` | Generate the Prisma JavaScript client after install/schema changes |
| `npm run db:seed` | Add missing migrated starter curriculum/policy; preserve accounts/content |
| `npm run db:studio` | Inspect development data in Prisma Studio |
| `npm run db:stop` | Stop supporting services while keeping stored data |

Before a PR, run lint, relevant tests and build; report failures or missing checks. `content:validate` and `simulate` remain deferred. Create migrations only when intentionally changing the schema: see [database workflow](docs/development.md#database-workflow). Do not delete database volumes as an everyday cleanup step. Current checks cover the migrated backend and existing client, not the pending Figma frontend or all future product features.

## Where to work

```text
client/             React/JSX screens, components, hooks and request functions
server/             Express services, scoring, adaptation, integrations and Prisma
packages/shared/    Shared Zod runtime schemas and pure metric functions
docs/               Developer/reference guides
```

The full target structure and module boundaries are in [architecture](docs/architecture.md). Assign work by feature and agree contracts before parallel implementation; read [contributing](docs/contributing.md) before your first change.

Frontend styling uses Tailwind CSS through the Vite plugin. Put component styles and responsive/state variants in JSX utility classes. `client/src/index.css` is the single CSS entry point for Tailwind, shared light/dark theme tokens, document defaults and the typing caret animation. See [styling conventions](docs/development.md#frontend-styling).

## Read only what you need

| Need | Document |
| --- | --- |
| First clone and everyday commands | This README |
| PostgreSQL, environment, migrations or troubleshooting | [Development](docs/development.md) |
| Team workflow, AI task prompts and Figma handoff | [Contributing](docs/contributing.md) |
| Requirements and learning rules | [SRS](docs/srs.md) |
| Modules and data flow | [Architecture](docs/architecture.md) |
| Routes, JSON and phase agreements | [API contract](docs/api-contract.md) |
| Account permissions, security and privacy | [Security](docs/security.md) |
| Test cases, acceptance and evaluation | [Testing](docs/testing.md) |
| Add words, themes or key groups | [Content guide](docs/content-guide.md) |
| Accepted choices and unresolved questions | [Decisions](docs/decisions.md) |
| Current task/phase handoff | [Current state](docs/context/current-state.md) |
| Visual system and Figma screen brief | [DESIGN.md](DESIGN.md) |

AI agents start with [AGENTS.md](AGENTS.md). Teammates do not need to read every document before contributing. Setup belongs here; numerical learning rules belong in the SRS; design proposals and draft API fields retain their own review status.
