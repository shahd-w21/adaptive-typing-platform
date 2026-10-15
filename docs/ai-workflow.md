# Working with AI agents and Figma output

**Status: team workflow guidance; no design-to-code run or application check is verified.** Follow [AGENTS.md](../AGENTS.md), the task's scope and relevant agreed contracts. Humans own the changes they submit and must be able to explain the diff.

## Give an agent a bounded task

```text
Task: <one observable outcome>
Phase / relevant SYS IDs: <references>
Read first: AGENTS.md and <specific guide sections>
Contract: <agreed endpoint/schema/function, or explicitly ask for a proposal>
Scope: <owned feature and any coordinated shared-file edits>
Dependencies: <available service/contract or named development fixture>
Done when: <behaviour and meaningful checks>
Constraints: preserve JavaScript/JSX, client/server structure and existing changes
Verification: run relevant available checks; report results and missing checks
```

Name the shared boundary before two teammates implement opposite sides. Avoid simultaneously assigning agents to the same routing, provider, export or schema files. Request small coordinated changes when shared edits are necessary; ownership should not stall a whole feature.

Contract-valid development mocks and synthetic fixtures remain allowed for parallel work. Label and validate them against shared schemas. Cover failure/empty states as well as success. Do not fake authentication in production or substitute mocked screenshots for integration evidence. The phase demo must use the real API and database for the flow it claims to complete.

## Figma to the planned architecture

Design foundations first, then keep screen design about one phase ahead of implementation. Use [DESIGN.md](../DESIGN.md) for current tokens, component states, Light/Dark, English/Arabic and responsive coverage; do not replace it with the older reference template.

1. Identify the approved frame/node, appearance, language and viewport, plus its primary and edge states. Record a stable design link and destination feature.
2. Map Figma variable/style names to the project's semantic styling tokens. Map existing Figma components to reusable UI components before generating another copy. Code Connect may be used where available and useful; it is not a new baseline dependency.
3. Implement one screen or bounded section at a time in `client/src/features/<feature>/`. Reuse `client/src/components/ui/` and layout components.
4. Keep visual components driven by props. Connect pages through feature hooks, request functions in `client/src/api/`, and the shared client. Reuse existing Context providers and TanStack Query conventions.
5. Use the agreed runtime schemas and fixtures while backend work proceeds. Sample policy values in a frame are examples, not approved reward, mastery or certificate thresholds.
6. Review the rendered result against Figma, including loading/error states, keyboard focus, Arabic RTL shell with LTR typing content, both appearance modes and the relevant viewport. Record what was actually checked.

Figma describes presentation and interactions. It cannot determine scoring, event timestamps, authentication, API contracts or learning rules. Implement these through their existing architecture and tests, even when an agent assists with the code. Do not replace the typing engine or create duplicate contexts/request layers to make generated markup work. Keep JavaScript/JSX and Tailwind CSS.

## Review generated changes

- Does the diff fulfil the task without unrelated rewrites or unexplained dependencies?
- Do runtime validation, ownership and role checks cover the boundary?
- Are pure functions independent of I/O, hidden clocks and unseeded randomness?
- Are retries/concurrent updates safe, and secrets/private input absent from logs and UI?
- Does the UI reuse shared components, query keys, tokens and required states?
- Do meaningful tests or visual checks support the claims, with unrun checks disclosed?
- Are affected contracts/guides updated without treating a proposal as an approved decision?

Keep agent prompts and review evidence concise. Do not copy full chat histories, secrets or real learner logs into project context. A focused handoff states the outcome, affected area, evidence, unresolved issue and next step.
