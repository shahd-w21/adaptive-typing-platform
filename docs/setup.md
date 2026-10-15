# Development setup

**Status: planned onboarding, not verified against the current code.** Do not run guessed commands or restructure the application to make this guide true during a documentation task.

[Environment](environment.md) · [Architecture](architecture.md) · [Contributing](contributing.md)

## Intended prerequisites

Git, the team's pinned Node.js/npm versions, Docker with Compose for local PostgreSQL/Mailpit, and an editor. Version pins, supported operating-system instructions and service ports are TBD until the implementation setup is reviewed. LLM credentials should not be necessary for basic practice: fallback must work independently.

## First implementation setup

The target is JavaScript ES modules, React `.jsx` components and Tailwind CSS. Frontend/backend folders are root-level `client/` and `server/`, with shared JavaScript schemas/formulas in `packages/shared/`. Workspace scripts coordinate them once verified. Use ESLint, runtime Zod validation, tests and builds; a static-type compiler/check script is not required. See [decision 0003](decisions/0003-javascript-client-server.md).

1. Inspect the actual package manifests and existing structure after implementation is authorised. Compare them with the target architecture; agree the smallest migration needed.
2. Pin compatible tool/dependency versions and commit the package lockfile.
3. Provide safe environment examples and copy them to the agreed ignored local environment files. Obtain secrets through the team's private channel.
4. Start local database/email services, apply committed migrations and seed development content using verified scripts.
5. Start the client/server processes; record actual URLs and ports.
6. Verify registration/email, login, fallback practice, submission and saved results. Confirm the dedicated test database is separate. Then verify Light/Dark/System, English/Arabic UI, desktop/mobile non-typing layouts and preference persistence using the matrix in [testing](testing.md); English exercise content and mode timing stay unchanged.

## Command register

The following are desired script names, **not currently verified commands**. Replace or confirm them from the implementation and record evidence.

| Purpose | Proposed command | Verified |
| --- | --- | --- |
| Install locked dependencies | `npm ci` after a valid lockfile exists | No |
| Local database/email services | `npm run db:up` | No |
| Apply development migrations | `npm run db:migrate` | No |
| Seed development content | `npm run db:seed` | No |
| Run applications | `npm run dev` | No |
| JavaScript linting | `npm run lint` | No |
| Tests/build | `npm test`, `npm run build` | No |
| Content checks/simulation | `npm run content:validate`, `npm run simulate` | No |

Record the OS, versions, working directory, command, expected result and last successful date when verification happens. Do not use database resets or `db push` against shared data. Migration creation and production migration application need separate documented procedures.

## Troubleshooting and deployment handoff

Check missing variables and occupied ports without printing secrets. For authentication failures, compare actual origins/cookies with the agreed auth configuration. For practice generation failures, check local fallback/content validation before blaming the LLM.

Before deployment, add the verified host/release steps here: migration owner, health URLs, HTTPS/origins, secret provisioning, backup/restore evidence, job catch-up, rollback procedure and cold-start limits. These remain TBD; no deployment is implied by this guide.

Use the [database guide](database.md) when diagnosing migration drift or seed problems. Do not reset a database or delete a Docker volume as routine troubleshooting; identify the affected environment and data before an explicitly authorised disposable-data reset.
