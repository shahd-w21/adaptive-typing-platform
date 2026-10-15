# Team and AI contribution workflow

**Status: working workflow for the documented target project.** Implementation commands remain unverified until recorded in [setup](setup.md).

## Before a task

Read [current state](context/current-state.md) and the relevant guide/SRS sections. State the requested outcome, affected requirements, dependencies and a concrete completion check. For phase work, agree shared contracts before teammates implement independently. Do not turn every small fix into a planning exercise.

Use the existing five-person phase plan in [handoff](context/handoff.md); no teammate assignments are invented here. Task owners and reviewers: TBD. Shared schema/contracts need a coordinating reviewer, not exclusive editing rights.

## Branches and reviews

Use a short feature branch and focused PR; do not push directly to `main`. Preserve teammates' changes and review diffs before committing. Record schema changes through committed migrations. Coordinate edits to shared schemas, routing, providers and environment examples early. Integrate frequently and end each phase with an end-to-end demo.

For AI-assisted work, give the agent the task, scope, relevant contract and completion check. The author remains responsible for reviewing generated changes and evidence. Do not run two agents editing the same files without explicit coordination. Never paste secrets into prompts.

Use [ai-workflow.md](ai-workflow.md) for a bounded task prompt and the Figma-to-feature handoff. Use [database.md](database.md) for schema changes rather than guessing commands from the proposed folder tree.

## Phase boundaries and parallel work

At phase start, agree the routes/shared schemas, pure function inputs/outputs, needed schema changes and shared UI props. Assign owners/reviewers and define the end-to-end demo. Each task should depend on earlier deliverables, a current agreed contract or an explicitly named development fixture; record external blockers early.

Use a mid-phase sync to compare actual payloads and function outputs against those contracts. Keep fixtures schema-valid and replace the demonstrated path with real services before the integration demo. End the phase by running the complete user journey and its relevant failure/retry case; individual screenshots are not integration evidence.

Keep shared-file edits small and coordinated, including `server/prisma/schema.prisma`, server routes, `client/src/app/router.jsx`, providers, query keys, shared exports and environment examples. Prefer a quick reviewed PR rather than waiting for an entire ownership area to finish. Track allocation stays with the team; the reference material's fixed tracks are not adopted here.

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

Record major scope, architecture, policy or contract choices in [decisions](decisions/README.md). Update [current state](context/current-state.md) only for meaningful phase/status changes; avoid per-task chat logs.

For Codex, start the task in this repository so its root instructions can be discovered. Other tools should be given AGENTS.md explicitly if they do not read it automatically. Reference: [official OpenAI guidance for AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
