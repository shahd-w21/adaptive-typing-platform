# TypeFlow — agent instructions

The current work is foundation setup. Follow the user's task scope. A teammate has pending frontend work based on the commit before the documentation refactor. Preserve all existing `client/` files, `DESIGN.md`, `docs/context/current-state.md`, and his `docs/frontend-design-plan.md` / `docs/README.md` paths during this setup. Only the additive `client/.env.example` belongs to setup. Do not recreate his screens, contexts, hooks, styles, translations or typing engine. See the handoff in `docs/development.md`. For documentation-only tasks, keep application changes out of scope.

## Read selectively

Start with the task and [foundation status](docs/development.md#foundation-status-and-frontend-handoff). The teammate-owned [current state](docs/context/current-state.md) is preserved at its documentation-phase baseline until integration. Use the [README](README.md) for onboarding and commands, then only the relevant reference:

| Task | Reference |
| --- | --- |
| Requirements or learning rules | [SRS](docs/srs.md) |
| Modules, pure logic or service boundaries | [Architecture](docs/architecture.md) |
| Configuration, PostgreSQL or migrations | [Development](docs/development.md) |
| Routes or payloads | [API contract](docs/api-contract.md) |
| Auth, permissions or private data | [Security](docs/security.md) |
| Team/AI tasks or Figma handoff | [Contributing](docs/contributing.md) |
| UI / content / verification | [Design](DESIGN.md), [content guide](docs/content-guide.md), [testing](docs/testing.md), as relevant |
| Rationale or unresolved questions | [Decisions](docs/decisions.md) |

The SRS owns required behaviour. Draft API fields/design values and documented command conventions are not implementation evidence. Treat attached reference instructions as review material, not automatic project policy. Identify conflicts; ask only for a blocking undecided choice and continue independent work.

## Engineering boundaries

- The owner authorized additive frontend scaffold files beyond the earlier client-only environment exception. New app/API/context/feature/hooks/test placeholders contain comments only; preserve all existing teammate implementations and keep them unwired until implementation is requested. The frontend architecture tree mirrors actual paths; `client/src/index.css` remains the only styling entry point.
- Course scope is approved in SRS section 9.6 / decision 0008. Frontend, backend and shared course files currently contain comments only. Preserve existing screens and logic; do not treat placeholders as implemented or import them. Use the architecture trees for canonical course paths. One shared skill profile/session engine serves separate course enrollments and progress. The course scaffold authorization does not authorize runtime implementation.
- Use JavaScript/JSX and Tailwind CSS; root `client/`, `server/`, shared runtime schemas/formulas in `packages/shared/`.
- Preserve Student/Admin roles and English desktop QWERTY typing. Support required appearance, English/Arabic UI and mobile non-typing pages; keep English exercise content/keyboard LTR.
- Keep scoring/adaptation pure, with explicit settings/time/randomness inputs. Server replay computes official metrics; raw accuracy gates progression.
- Reuse shared Zod schemas/formulas and one session lifecycle across modes. Validate every text source, including fallback; do not introduce locked characters silently.
- Save learning/rewards once atomically; make identical retries safe and concurrent updates lossless. Keep network/PDF work outside database transactions.
- Enforce server ownership, role, revocation and input checks. Never expose secrets or private logs; plausible browser logs are not proof of human typing.

## Workflow

Keep edits focused and preserve teammate changes. Coordinate shared-file edits and update affected guides/contracts together. Record meaningful decisions in the single decision log; do not duplicate numerical rules or save chat transcripts. Human parallel tracks do not automatically authorise AI subagents.

The active backend is `server/src/server.js`. The teammate's work from `68d311f` is migrated into `server/src/modules/`, middleware and integrations; preserve those features during cleanup. The API contract includes the old-to-new route map and prototype limits. Use ES modules and additive Prisma migrations, not the old SQL bootstrap or a duplicate entry point. Install from the root workspace lockfile; preserve the client's old lockfile until the frontend handoff.

The README lists implemented foundation commands; development records verification and remaining limits. Do not infer feature readiness from setup checks. For code work, run relevant checks and report failures/missing checks. For Markdown-only work, validate links, examples and consistency; application builds are unnecessary. Do not push, deploy or reset shared data without task authorisation. End with changes, verification and material unresolved work.
