# TypeFlow — agent instructions

## Scope and current phase

This file governs this repository. Respect the user's current task and any applicable nested instructions.

The current phase is documentation and planning. Existing application code does not match the planned documentation and has not been assessed. For documentation tasks, do not inspect, restructure, install dependencies for, or modify application code. A later explicit implementation request authorises inspection and changes within that task; it does not authorise a wholesale rewrite. Reconcile the relevant code with the plan before changing it.

## Read only what the task needs

Start with [current state](docs/context/current-state.md), then use [the documentation index](docs/README.md). Read relevant sections rather than loading every document.

| Task | Read |
| --- | --- |
| Requirements or scoring | Relevant sections of [SRS](docs/srs.md) |
| Structure or service boundaries | [Architecture](docs/architecture.md) |
| Routes or shared DTOs | [API contract](docs/api-contract.md) |
| Setup/configuration | [Setup](docs/setup.md), [environment](docs/environment.md) |
| Accounts or private data | [Auth](docs/auth.md), [security](docs/security.md) |
| Curriculum or generated text | [Content guide](docs/content-guide.md) |
| UI | [DESIGN.md](DESIGN.md) and relevant SRS accessibility requirements |
| Tests or evaluation | [Testing](docs/testing.md) |
| Team workflow or major decisions | [Contributing](docs/contributing.md), [decisions](docs/decisions/README.md) |
| Phase planning or rationale | [Handoff](docs/context/handoff.md) |

The SRS owns product requirements. Accepted decisions explain changes; update the SRS when behaviour changes. Draft API examples, proposed architecture and design placeholders are not implemented facts or team approvals. If sources conflict, identify the conflict and resolve only what the task authorises. Do not invent an answer to a blocking TBD; continue independent work and ask a focused question.

## Engineering rules

- Preserve Student/Admin scope, desktop English QWERTY and the agreed TypeScript stack.
- Support Light/Dark appearance, English/Arabic interface and desktop/mobile non-typing layouts per SRS SYS-53–56. Interface language never changes English exercise content; Arabic shells keep the passage/input/QWERTY guide LTR. Mobile typing remains out of scope.
- Keep scoring and adaptation pure. Pass settings in; keep database/network code outside.
- The server replays assigned-text events and computes official scores. Use raw accuracy for progression. Do not treat plausible browser logs as proof of human input.
- Reuse shared schemas/formulas. Keep one authoritative session lifecycle across modes.
- Make submissions atomic, identical retries safe, and concurrent updates lossless. Keep LLM/email/PDF calls outside database transactions.
- Validate every text source, including fallback; never silently introduce locked characters.
- Enforce server-side ownership, roles, revocation and input validation. Never expose secrets or raw logs in public DTOs.
- Preserve existing teammate changes. Keep edits focused; no unrelated refactors, dependency additions or infrastructure.

## Workflow and evidence

Follow [contributing.md](docs/contributing.md). Before implementation, inspect only the relevant files and verified scripts. [Setup](docs/setup.md) currently contains planned commands, not confirmed runnable instructions. Do not create app scaffolding or run migrations merely because a document lists them.

For code changes, run relevant available checks and report exact results and missing checks. For documentation-only work, check local links, code fences, example syntax and consistency; app builds are unnecessary. Never claim something works, is deployed or passed tests without evidence.

Update the affected contract/guide in the same change. Update current state only when phase, blockers or verified status changes; do not append transcripts. Record a decision for a meaningful change in scope, security policy, architecture or public contract. Keep numerical engine rules in the SRS rather than duplicating them across guides.

Human teammates may work in parallel. Do not spawn AI subagents solely because the project has five people. Do not push, deploy or reset shared data without task authorisation. End with a concise summary of changes, verification and unresolved issues.
