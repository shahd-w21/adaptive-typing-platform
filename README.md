# TypeFlow

An adaptive typing learning platform for a five-person university project. Student and Admin roles; English typing on desktop physical QWERTY keyboards. The target website supports Light/Dark appearance, English/Arabic interface language and desktop/mobile non-typing pages.

[Documentation](docs/README.md) · [Current state](docs/context/current-state.md) · [Requirements](docs/srs.md) · [Design](DESIGN.md)

## Current status

The team uses JavaScript/JSX with Tailwind CSS: root-level `client/` for React, `server/` for Express, and `packages/shared/` for runtime Zod schemas/formulas. See [decision 0003](docs/decisions/0003-javascript-client-server.md).

Documentation and planning. Existing application code is known to differ from the target plan and was intentionally not inspected during documentation work. No setup command, endpoint or feature is claimed to be implemented. See [current state](docs/context/current-state.md).

## Start here

- Teammates: read the [documentation index](docs/README.md), relevant SRS sections and [contribution workflow](docs/contributing.md).
- AI agents: follow [AGENTS.md](AGENTS.md), then load only task-relevant guides. Teammates assigning agent tasks can use the prompt and review checklist in [AI workflow](docs/ai-workflow.md).
- Before Figma/UI work: use [DESIGN.md](DESIGN.md) for the proposed visual system and [AI workflow](docs/ai-workflow.md) for the Figma-to-feature handoff; visual approval is still pending.

## Working guides

| Working on | Read |
| --- | --- |
| Local development and configuration | [Setup](docs/setup.md), [environment](docs/environment.md) |
| Structure and service boundaries | [Architecture](docs/architecture.md) |
| Routes, JSON shapes and phase agreements | [API contract](docs/api-contract.md) |
| Schema, migrations, seeds and transactions | [Database](docs/database.md) |
| Accounts, access and private data | [Auth](docs/auth.md), [security](docs/security.md) |
| Curriculum and generated practice | [Content guide](docs/content-guide.md) |
| Checks, scoring examples and evaluation | [Testing](docs/testing.md) |
| Parallel tasks, reviews and decisions | [Contributing](docs/contributing.md), [decision records](docs/decisions/README.md) |

The setup guide distinguishes proposed commands from verified ones. Do not assume a script or endpoint exists because it appears in the plan.

## Planned repository layout

```text
client/             React frontend, JSX and Tailwind CSS
server/             Express backend and Prisma persistence
packages/shared/    JavaScript runtime schemas and pure shared formulas
docs/               Requirements, contracts, guides, context and decisions
AGENTS.md           Repository instructions for AI agents
DESIGN.md           Proposed visual system and Figma brief
```

This is the target organisation; it does not certify the current application structure or implementation.

## Product and documentation boundaries

The SRS defines requirements; guides explain the planned implementation; draft examples remain proposals until reviewed. The adaptive engine selects learning goals and the LLM only supplies validated text.

Interface language changes website controls and system explanations, not English exercise content or authored posts. Arabic uses an RTL shell with an English/LTR typing region. Phone typing entry points show desktop guidance. See [decision 0002](docs/decisions/0002-appearance-localisation-responsive.md) for the scope update and [DESIGN.md](DESIGN.md) for both appearance modes and responsive layouts.
