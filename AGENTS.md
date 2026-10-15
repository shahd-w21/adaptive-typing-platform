# TypeFlow — agent instructions

The current work is documentation/planning. Follow the user's task scope. For documentation tasks, keep application code/configuration out of scope unless the user explicitly authorises inspection or implementation. Do not scaffold the target structure, install dependencies or run migrations to make a document appear correct.

## Read selectively

Start with [current state](docs/context/current-state.md) and the task. Use the [README](README.md) for onboarding and commands, then only the relevant reference:

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

- Use JavaScript/JSX and Tailwind CSS; root `client/`, `server/`, shared runtime schemas/formulas in `packages/shared/`.
- Preserve Student/Admin roles and English desktop QWERTY typing. Support required appearance, English/Arabic UI and mobile non-typing pages; keep English exercise content/keyboard LTR.
- Keep scoring/adaptation pure, with explicit settings/time/randomness inputs. Server replay computes official metrics; raw accuracy gates progression.
- Reuse shared Zod schemas/formulas and one session lifecycle across modes. Validate every text source, including fallback; do not introduce locked characters silently.
- Save learning/rewards once atomically; make identical retries safe and concurrent updates lossless. Keep network/PDF work outside database transactions.
- Enforce server ownership, role, revocation and input checks. Never expose secrets or private logs; plausible browser logs are not proof of human typing.

## Workflow

Keep edits focused and preserve teammate changes. Coordinate shared-file edits and update affected guides/contracts together. Record meaningful decisions in the single decision log; do not duplicate numerical rules or save chat transcripts. Human parallel tracks do not automatically authorise AI subagents.

The README's scripts define the target foundation contract. Do not claim they exist or passed without inspection/execution authorised by the task. For code work, run relevant available checks and report failures/missing checks. For Markdown-only work, validate links, examples and consistency; application builds are unnecessary. Do not push, deploy or reset shared data without task authorisation. End with changes, verification and material unresolved work.
