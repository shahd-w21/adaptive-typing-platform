# Documentation index

Last organised: 14 October 2026. The documentation describes the target platform, not the existing implementation.

## Reading map

| Document | Purpose and status |
| --- | --- |
| [SRS](srs.md) | Requirements baseline; numerical defaults and TBDs are labelled |
| [Architecture](architecture.md) | Proposed structure, module boundaries and data flows |
| [API contract](api-contract.md) | Draft route inventory, JSON examples and phase agreement template |
| [Setup](setup.md) | Onboarding plan; executable commands not yet verified |
| [Environment](environment.md) | Planned variable inventory, ownership and secret handling |
| [Auth](auth.md) | Required account/session behaviour and unresolved implementation choices |
| [Security](security.md) | Security/privacy implementation and review checklist |
| [Content guide](content-guide.md) | Authoring words, themes, groups and fallback coverage |
| [Contributing](contributing.md) | Human/agent task workflow, reviews and definition of done |
| [Testing](testing.md) | Acceptance evidence, scoring examples and evaluation plan |
| [Decisions](decisions/README.md) | Short dated records; proposed and accepted are distinguished |
| [Current state](context/current-state.md) | Small, maintained handoff of status and next decisions |
| [Long-form handoff](context/handoff.md) | Project background, rationale and risks |
| [Design brief](../DESIGN.md) | Proposed edclub-inspired tokens and Duolingo-inspired learning patterns; Figma screen/component brief, pending team approval |
| [Agent instructions](../AGENTS.md) | Concise repository-wide instructions for coding agents |

## Where information belongs

- Required behaviour and numerical learning rules → SRS.
- Routes, field names, errors and agreed examples → API contract.
- What was decided, why, when and by whom → decisions.
- What is currently verified or blocked → context/current-state.md.
- Visual proposals and approved choices → DESIGN.md, with their status explicit.
- Setup commands and configuration → setup/environment, only marked verified after execution.

Use **Baseline**, **Proposed**, **TBD**, and **Verified** precisely. A document or generated example existing does not make it approved or implemented. Keep a single authoritative definition and link to it instead of copying it into every guide.

The `context/` directory contains human-readable project context, not hidden agent memory. Maintain it in version control without secrets, private transcripts or individual chat histories.
