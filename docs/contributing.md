# Team and AI contribution workflow

**Status: working workflow for the documented target project.** Implementation commands remain unverified until recorded in [setup](../README.md#quick-start).

## Before a task

Read [current state](context/current-state.md) and the relevant guide/SRS sections. State the requested outcome, affected requirements, dependencies and a concrete completion check. For phase work, agree shared contracts before teammates implement independently. Do not turn every small fix into a planning exercise.

Five people work in parallel within each phase; owners/reviewers are assigned at the phase meeting. Shared schema/contracts need a coordinating reviewer, not exclusive editing rights.

The [project plan](project-plan.md) turns this workflow into a frontend-first backlog for five developers, followed by backend delivery. It lists file-level tasks, reviewers, dependencies, acceptance checks and schema-change coordination. Dates, actual assignees and draft contracts still need their recorded agreement; the plan does not authorize implementation or establish feature readiness.

## Branches and reviews

Use a short feature branch and focused PR; do not push directly to `main`. Preserve teammates' changes and review diffs before committing. Record schema changes through committed migrations. Coordinate edits to shared schemas, routing, providers and environment examples early. Integrate frequently and end each phase with an end-to-end demo.

For AI-assisted work, give the agent the task, scope, relevant contract and completion check. The author remains responsible for reviewing generated changes and evidence. Do not run two agents editing the same files without explicit coordination. Never paste secrets into prompts.

The [AI section below](#using-ai-agents) contains a task prompt and Figma handoff. Use [development](development.md#database-workflow) for schema changes rather than guessing commands from the proposed folder tree.

### Markdown merge-conflict prevention

These additional rules apply only to `*.md` files and reduce conflicts during parallel documentation work:

- Edit only the sections required by the task. Preserve surrounding wording, heading order, line wrapping, whitespace and line endings; avoid whole-file formatting or table alignment changes unrelated to the task.
- Coordinate edits to the same Markdown section with its current author before changing it in parallel. Keep documentation diffs small and review them against current teammate changes before committing.
- Preserve existing Markdown paths and headings unless the task requires a coordinated rename, deletion or restructure. Respect the teammate-owned documentation paths listed in [AGENTS.md](../AGENTS.md); change them only when explicitly authorized.
- When a Markdown conflict occurs, reconcile the affected sections manually and retain valid contributions from both branches. Do not overwrite a whole document or select one side for every conflict. Check links and examples after reconciliation.

## Phase boundaries and parallel work

At phase start, agree the routes/shared schemas, pure function inputs/outputs, needed schema changes and shared UI props. Assign owners/reviewers and define the end-to-end demo. Each task should depend on earlier deliverables, a current agreed contract or an explicitly named development fixture; record external blockers early.

Use a mid-phase sync to compare actual payloads and function outputs against those contracts. Keep fixtures schema-valid and replace the demonstrated path with real services before the integration demo. End the phase by running the complete user journey and its relevant failure/retry case; individual screenshots are not integration evidence.

Keep shared-file edits small and coordinated, including `server/prisma/schema.prisma`, server routes, `client/src/app/router.jsx`, providers, query keys, shared exports and environment examples. Prefer a quick reviewed PR rather than waiting for an entire ownership area to finish. Track allocation stays with the team; the reference material's fixed tracks are not adopted here.

## Phase goals

Suggested phase goals, retained from the earlier handoff:

| Phase | End-to-end goal |
| --- | --- |
| Foundations | Agreed contracts, setup/scripts, schema plan, shared design foundations and typing/scoring spike |
| Core loop | Register/login → assigned text → typing → official result → saved history |
| Adaptation | Placement, keyboard map, weaknesses, mastery, unlocking and reviews |
| AI and motivation | Validated generation/fallback, rewards and initial admin analytics |
| Supporting features | Forum, certificates, settings and complete required administration |
| Release/evaluation | Simulation, volunteer pilot, accessibility/performance checks, deployment and report |

Put the strongest relevant developers on typing capture and scoring/adaptation. Preserve time for evaluation and integration; confirm the real deadline/rubric before allocating days. A phase finishes when its demo runs, not when individual branches look complete.

## Course-expansion phases

The course model is approved in [decision 0008](decisions.md#0008), and frontend/backend/shared comment-only placeholders are created at the architecture's paths. These phases guide later work; they do not authorize runtime implementation now. Preserve existing accounts, practice and supporting features during integration.

| Phase | Reviewable outcome / gate |
| --- | --- |
| Course agreement | Refine approved SYS-57–64 into concrete course objectives/checkpoints, schema/JSON contracts, numerical policies and Figma page briefs |
| Course foundation | Reviewed additive data model and publication/enrollment rules; one manually authored foundational course with a validated path |
| First course loop | Catalog → enroll → entry recommendation → lesson assignment → official result → saved/resumable course progress, using existing session/scoring behavior |
| Adaptive course learning | Shared key/pair evidence, placement/targeted checks, mastery, difficulty, reviews and explanations; weak and experienced profiles behave differently |
| Generation and authoring | Validated cache/LLM/fallback with course constraints; admin draft/preview/validate/publish/archive and version compatibility demonstrated |
| Integration/evaluation | Second course proves evidence transfer with separate progress; retry/concurrency, rewards, privacy, certificates distinction, accessibility and simulation checks |

Within each approved phase, the team can work in parallel on course/admin APIs, pure adaptive/generation logic, student/admin UI and acceptance/content tasks against agreed shared contracts. Coordinate Prisma/shared schemas, session submission and routing changes explicitly. Figma comes after the course flow is agreed and before page implementation; recheck the existing design rather than discarding teammate work. Keep live LLM integration behind validated fallback, and agree objectives before bulk-authoring courses.

## Definition of done

- Requested behaviour is implemented or the requested document is complete.
- Relevant contracts/guides reflect the change; proposals are not relabelled as accepted without a team decision.
- Relevant checks were actually run, with failures/unavailable checks disclosed.
- Code changes include meaningful tests for behavioural risks; documentation changes need link/example/consistency checks instead of app builds.
- No unrelated edits, secrets, generated noise or unexplained dependency changes.
- Reviewer can understand the problem, resulting behaviour and remaining limitations.

## PR/task template

```text
Outcome:
Relevant SYS requirements:
Dependencies / agreed contract:
Files or areas changed:
Validation performed and result:
Remaining decisions / risks:
Reviewer:
Done when:
```

Record major scope, architecture, policy or contract choices in [decisions](decisions.md). Update [current state](context/current-state.md) only for meaningful phase/status changes; avoid per-task chat logs.

For Codex, start the task in this repository so its root instructions can be discovered. Other tools should be given AGENTS.md explicitly if they do not read it automatically. Reference: [official OpenAI guidance for AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

## Using AI agents

**Status: team workflow guidance; no design-to-code run or application check is verified.** Follow [AGENTS.md](../AGENTS.md), the task's scope and relevant agreed contracts. Humans own the changes they submit and must be able to explain the diff.

### Give an agent a bounded task

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

### Figma to the planned architecture

Design foundations first, then keep screen design about one phase ahead of implementation. Use [DESIGN.md](../DESIGN.md) for current tokens, component states, Light/Dark, English/Arabic and responsive coverage; do not replace it with the older reference template.

1. Identify the approved frame/node, appearance, language and viewport, plus its primary and edge states. Record a stable design link and destination feature.
2. Map Figma variable/style names to the project's semantic styling tokens. Map existing Figma components to reusable UI components before generating another copy. Code Connect may be used where available and useful; it is not a new baseline dependency.
3. Implement one screen or bounded section at a time in `client/src/features/<feature>/`. Reuse `client/src/components/ui/` and layout components.
4. Keep visual components driven by props. Connect pages through feature hooks, request functions in `client/src/api/`, and the shared client. Reuse existing Context providers and TanStack Query conventions.
5. Use the agreed runtime schemas and fixtures while backend work proceeds. Sample policy values in a frame are examples, not approved reward, mastery or certificate thresholds.
6. Review the rendered result against Figma, including loading/error states, keyboard focus, Arabic RTL shell with LTR typing content, both appearance modes and the relevant viewport. Record what was actually checked.

Figma describes presentation and interactions. It cannot determine scoring, event timestamps, authentication, API contracts or learning rules. Implement these through their existing architecture and tests, even when an agent assists with the code. Do not replace the typing engine or create duplicate contexts/request layers to make generated markup work. Keep JavaScript/JSX and Tailwind CSS.

### Review generated changes

- Does the diff fulfil the task without unrelated rewrites or unexplained dependencies?
- Do runtime validation, ownership and role checks cover the boundary?
- Are pure functions independent of I/O, hidden clocks and unseeded randomness?
- Are retries/concurrent updates safe, and secrets/private input absent from logs and UI?
- Does the UI reuse shared components, query keys, tokens and required states?
- Do meaningful tests or visual checks support the claims, with unrun checks disclosed?
- Are affected contracts/guides updated without treating a proposal as an approved decision?

Keep agent prompts and review evidence concise. Do not copy full chat histories, secrets or real learner logs into project context. A focused handoff states the outcome, affected area, evidence, unresolved issue and next step.
