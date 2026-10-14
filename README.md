# TypeFlow

An adaptive typing learning platform for a five-person university project. Student and Admin roles; English typing on desktop physical QWERTY keyboards. The target website supports Light/Dark appearance, English/Arabic interface language and desktop/mobile non-typing pages.

[Documentation](docs/README.md) · [Setup](docs/setup.md) · [Architecture](docs/architecture.md) · [Auth](docs/auth.md) · [Environment](docs/environment.md) · [Security](docs/security.md) · [Design](DESIGN.md)

## Current status

The team uses JavaScript/JSX with Tailwind CSS: root-level `client/` for React, `server/` for Express, and `packages/shared/` for runtime Zod schemas/formulas. See [decision 0003](docs/decisions/0003-javascript-client-server.md). This documentation change does not migrate application code.

Documentation and planning. Existing application code is known to differ from the target plan and was intentionally not inspected during documentation work. No setup command, endpoint or feature is claimed to be implemented. See [current state](docs/context/current-state.md).

## Start here

- Teammates: read the [documentation index](docs/README.md), relevant SRS sections and [contribution workflow](docs/contributing.md).
- AI agents: follow [AGENTS.md](AGENTS.md), then load only task-relevant guides.
- Before Figma/UI work: use [DESIGN.md](DESIGN.md) for the proposed reference-based visual system and screen brief; team approval is still pending.

The SRS defines requirements; guides explain the planned implementation; draft examples remain proposals until reviewed. The adaptive engine selects learning goals and the LLM only supplies validated text.

Interface language changes website controls and system explanations, not English exercise content or authored posts. Arabic uses an RTL shell with an English/LTR typing region. Phone typing entry points show desktop guidance. See [decision 0002](docs/decisions/0002-appearance-localisation-responsive.md) for the scope update and [DESIGN.md](DESIGN.md) for both appearance modes and responsive layouts.
