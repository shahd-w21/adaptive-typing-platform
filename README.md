# TypeFlow

An adaptive typing tutor built by a five-person university team. JavaScript, React, Tailwind CSS, Express and PostgreSQL/Prisma. Student and Admin roles; English typing on physical QWERTY keyboards, with English/Arabic interface and Light/Dark appearance.

**Development status:** foundation tooling is being established. The new server entry point is `server/src/server.js`; existing backend files remain preserved but are not mounted by it. Product endpoints and your teammate's pending Figma frontend are not yet integrated. Product requirements remain in the SRS. See the [setup verification and frontend handoff](docs/development.md#foundation-status-and-frontend-handoff) for the current boundary.

## Quick start

Commands below are for PowerShell, run from the repository root unless stated otherwise. On macOS/Linux, use `cp` instead of `Copy-Item`.

### 1. Prerequisites and clone

Install Git, Node.js 24.14.0 (pinned in `.nvmrc`), npm 11, and Docker Desktop with its Linux engine running. PostgreSQL runs in Docker; you do not need a separate database installation. A native PostgreSQL alternative is in the development guide.

```powershell
git clone https://github.com/shahd-w21/adaptive-typing-platform.git
cd adaptive-typing-platform
npm install
```

The root package uses npm workspaces for `client`, `server` and `packages/shared`. One root install supplies all three. Use `npm ci` for clean reproducible installs from the root lockfile. Existing nested lockfiles are preserved to avoid disrupting the pending frontend work; root commands use the root lockfile.

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

Use `VITE_API_URL=http://localhost:5000/api/v1` in `client/.env`. Existing environment files may need the values from the [environment example](docs/development.md#environment-variables); the helper never replaces them. The username/password above are local development examples. Never commit actual `.env` files or put server secrets in `VITE_` values. Auth and SMTP settings are reserved for the next phase, not proof that those features work.

### 3. Start PostgreSQL and initialise the database

```powershell
npm run db:up
docker compose exec db pg_isready -U typeflow -d typeflow_dev
npm run db:migrate
```

`db:up` starts `db` and `mailpit` and waits for service readiness. `db:migrate` applies committed migrations to local `typeflow_dev`. The initial migration contains an account table only; no users or curriculum are seeded. Fresh Docker volumes also create `typeflow_test`. Never run the legacy `server/schema.sql` as part of this setup.

To open a database terminal:

```powershell
docker compose exec db psql -U typeflow -d typeflow_dev
```

For pgAdmin/DBeaver: **host** `localhost`, **port** `5432`, **database** `typeflow_dev`, **user** `typeflow`, **password** `typeflow_local_only`. Detailed connection, test-database and native PostgreSQL instructions are in the [development guide](docs/development.md#connect-to-postgresql).

### 4. Start development

```powershell
npm run dev
```

The root script starts the client and server together. Keep that terminal open; use another terminal for checks. `Ctrl+C` stops the applications.

| Service | Documented local address |
| --- | --- |
| Website | http://localhost:5173 |
| API base | http://localhost:5000/api/v1 |
| Process health | http://localhost:5000/health/live |
| Database readiness | http://localhost:5000/health/ready |
| Email inbox | http://localhost:8025 |

Verify the existing client page loads and `/health/ready` reports database access. `/health/live` reports whether the process is running. `/api/v1` is reserved for future feature routes and currently returns 404. Mailpit captures local email, but registration/email delivery is a later authentication-phase check. The pending Figma pages are not required for foundation checks.

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
| `npm run build` | Verify production application builds |
| `npm run db:migrate` | Apply committed development migrations |
| `npm run db:generate` | Generate the Prisma JavaScript client after install/schema changes |
| `npm run db:studio` | Inspect development data in Prisma Studio |
| `npm run db:stop` | Stop supporting services while keeping stored data |

Before a PR, run lint, relevant tests and build; report failures or missing checks. `db:seed`, `content:validate` and `simulate` are deferred until their content/engine phases; no success-only placeholder scripts exist. Create migrations only when intentionally changing the schema: see [database workflow](docs/development.md#database-workflow). Do not delete database volumes as an everyday cleanup step. Root checks cover the new foundation and existing client; preserved legacy server modules are not part of the new application or test scope.

## Where to work

```text
client/             React/JSX screens, components, hooks and request functions
server/             Express services, scoring, adaptation, integrations and Prisma
packages/shared/    Shared Zod runtime schemas and pure metric functions
docs/               Developer/reference guides
```

The full target structure and module boundaries are in [architecture](docs/architecture.md). Assign work by feature and agree contracts before parallel implementation; read [contributing](docs/contributing.md) before your first change.

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
