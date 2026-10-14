# TypeFlow: Handoff Context

Version 1.2 — 14 October 2026

Read this with [the SRS](../srs.md) and [architecture](../architecture.md). The SRS defines required behaviour. This file explains the reasoning, scope and open decisions. Architecture describes implementation boundaries. For a quick task handoff, start with [current state](current-state.md).

This revision was created from the supplied documents and their review. The existing codebase was deliberately not inspected. Do not assume that nothing has been built, or that the current repository follows this plan.

## 1. Project context

- University software engineering project at Misr International University.
- Five students, primarily AI majors with full-stack experience.
- Planning assumption: 6–8 weeks; actual deadline and assessment deliverables remain to be confirmed.
- Current domain: adaptive touch-typing education. Language learning, instructors and classes belong to superseded drafts.
- Working name: TypeFlow; final branding remains open.
- Only Student and Admin are stored account roles. Guest means unauthenticated access.
- English, physical QWERTY keyboards and desktop typing only.
- English/Arabic interface, Light/Dark appearance and desktop/mobile non-typing layouts are required; Arabic UI never changes the English curriculum. See [decision 0002](../decisions/0002-appearance-localisation-responsive.md) and [DESIGN.md](../../DESIGN.md).

The central loop is: assign text → capture typing → replay and score on the server → update key/pair evidence → select the next focus → supply validated text. Progress, gamification, certificates, forum and admin tools support this loop.

## 2. Source of truth and change control

1. Use the SRS for behaviour and mandatory scope.
2. Use this handoff for rationale and remaining questions.
3. Use the structure proposal for organisation, not as an additional requirements list.
4. Resolve a conflict by updating the documents together; do not silently select the easiest interpretation.
5. Record consequential decisions with the date, reason and affected requirements.

SRS v1.1 applied the review recommendations; v1.2 adds the owner's appearance, English/Arabic interface and responsive-presentation requirements. Initial design defaults are starting policies, not research findings. Items labelled TBD remain unresolved; new documentation is not implementation evidence.

## 3. Core decisions to preserve

### The engine decides; the LLM writes

The adaptive engine chooses unlocked characters, weak keys/pairs, difficulty and reviews. The LLM only proposes text for a validated spec. It does not grade, award mastery or decide progression. Scoring and adaptive logic are pure functions with no network or database imports.

### Accuracy means mistakes made, not just mistakes left

Use **raw accuracy** for progression and certificate eligibility. Final accuracy is displayed separately. Correcting mistakes does not erase the original attempts. Backspace and Shift are not printable attempts. Read SRS section 8 for the exact formulas and replay rules; do not invent another formula in a UI component.

### Server scoring is authoritative, but input is not proof

The server reconstructs input from the assigned text and ordered events, ignoring client scores and correctness claims. Plausibility checks can reject malformed or suspicious submissions. They cannot prove that a human produced a plausible event stream. Certificates are explicitly unproctored TypeFlow performance certificates, not identity verification or fraud-proof credentials.

### Retries must be safe

An identical retry returns the existing result. A conflicting payload for a completed session fails. Rewards and learning updates happen once. Store a canonical submission hash with the result so this remains possible after raw-log retention expires. Use database constraints and per-student update coordination, not just an in-memory flag.

### A fallback must actually be feasible

Every source of text, including fallback, passes validation. Early exercises may be word sequences or labelled key drills. Themes and natural prose may relax; locked-character restrictions and safety rules may not. An impossible focus set is reduced before text is generated, with the change recorded. Never loop forever trying to generate natural prose from a tiny alphabet.

### Preserve progress while responding to weakness

Mastery requires separate accuracy/latency evidence across at least two completed learning sessions. A failed review returns a key to in progress but does not relock later groups. Target changes apply to future sessions and do not retroactively revoke mastery or certificates. Tests are recorded separately and do not alter the curriculum in this baseline.

### Keep transactions short and settings reproducible

The transaction saves a result and its applicable learning/reward/certificate records. LLM requests, email and PDF rendering stay outside it. Pure functions receive effective settings as input. Each session captures scoring/engine versions and an immutable settings version so an admin change cannot alter the rules halfway through an attempt.

## 4. Agreed technology and architecture

| Decision | Reason |
| --- | --- |
| React + Vite + TypeScript | Familiar front end and explicit shared contracts |
| Node + Express + TypeScript | One language across browser, server and shared rules |
| PostgreSQL + Prisma | Relational data, migrations, constraints and transactions |
| TanStack Query | Server-data caching and mutations without an extra global-state library |
| Local state plus limited Context | Auth, rewards and user preferences; do not duplicate server data unnecessarily |
| Tailwind + shadcn/ui; React Hook Form + Zod | Consistent UI and validated forms |
| JWT in an httpOnly cookie | Keeps token contents out of direct JavaScript reads; still requires CSRF/XSS protections and revocation |
| npm workspaces | One repository, two applications, shared schemas and formulas |
| Docker for PostgreSQL and Mailpit in development | Reproducible supporting services while applications run locally |
| GitHub Actions and reviewed PRs | Automated checks and regular integration |

TypeScript is decided, not an open JavaScript-vs-TypeScript question. No Redis, distributed queues, microservices, Kubernetes, Redux or Next.js is required for this scope. Do not change the stack without a concrete project need.

Use Prisma for ordinary data access. Use parameterised SQL where a query is clearer or demonstrably needs it; joins alone are not a reason to bypass the ORM. Keep analytics SQL in dedicated query modules and validate returned shapes. Pin dependency versions when implementation begins; these documents do not claim current setup commands are verified.

Authentication needs a server-side revocation mechanism despite using JWTs. Protected requests must check active account status and token/session validity. Password reset, deactivation and deletion revoke all sessions. Prefer a same-origin `/api` deployment if practical; otherwise explicitly configure credentialed CORS, cookies and CSRF protection for the chosen hosts.

## 5. Behaviour contracts to agree first

The SRS already supplies initial rules. Convert these into shared schemas and fixed examples before separate developers build against them:

- Event log: `{ seq, type, t, char? }`, with insert/backspace/pause/resume events and explicit finish time.
- Session assignment: owner, exact text, mode, issue/expiry times, captured target, scoring/engine/settings versions and rules.
- Generation spec: allowed characters, focus keys/pairs, difficulty, optional theme, length, coverage requirements and validation/configuration versions.
- Submit result: labelled metrics, acceptance/status, relevant key evidence, rewards and next activity with a readable reason.
- Error responses: stable code, useful message and retry guidance without exposing another user's data.

Read the mode table in SRS section 8. Practice/review can pause; timed/certified tests cannot. Restart abandons the previous attempt. Placement establishes provisional evidence; it does not declare mastery from a tiny sample. Timed/certified tests have enough preassigned text for their duration.

Do not copy numerical parameters into this file as another independent source. SRS section 9 contains the initial smoothing, focus, difficulty, mastery and review rules. Runtime settings must be versioned and validated; the code configuration supplies defaults only.

## 6. Scope cleanup from the original documents

- Public certificate verification is mandatory, not an optional enhancement.
- Forum, certificates and basic administration remain required but come after the core loop.
- Google sign-in is deferred. Remove its buttons, routes and environment variables from baseline plans.
- Leaderboards, CSV export, AI coaching notes and review emails are outside the required baseline.
- Large text and reduced-pressure mode remain required; sound effects are optional.
- Appearance and UI language are independent presentation preferences. System resolves Light/Dark; English/Arabic changes the interface shell and system messages only. Persist own-account choices with visitor/account precedence and logout cleanup as specified in SRS section 10.5; do not put locale/theme in generation or scoring.
- Mobile supports non-typing pages, including authorised administration. Typing remains desktop/physical English QWERTY; phone launch shows device guidance. Arabic shell layout is RTL while passages/input/keyboard remain English/LTR.
- The SRS contains renderable Mermaid diagrams. They must be rendered when exporting a final submission.
- The page list is explicitly an inventory. It does not count as a visual prototype.
- Historical claims that no repository/code exists have been removed.

## 7. Decisions still open

| Decision | When it must be settled |
| --- | --- |
| Does the course require training a model? | Before committing to the engine implementation |
| Actual deadline, marking rubric, required diagrams/prototypes | Before task allocation |
| Default target WPM, permitted range and final curriculum groups | Before placement/mastery implementation |
| LLM provider/model, budget, timeout and service limits | Before integration; fallback can be built first |
| Hosting and database/email services | Before deployment design |
| Certified duration, net WPM/raw accuracy thresholds, cooldown/attempt limits and public display name | Before certificate implementation |
| XP/level formulas, daily-goal units, minimum reward activity and timezone-change policy | Before gamification implementation |
| Integrity thresholds, clock tolerance, session expiry and request-size limits | Before scoring acceptance tests are finalised |
| Audit/operational/backup retention and deletion procedure | Before production data is collected |
| Reference device/load environment and production capacity | Before performance acceptance |
| Final project name/branding | Before polished UI and report submission |

The earlier proposal of a 3-minute certificate at 30 net WPM and 95% raw accuracy remains a candidate, not an approved certification standard. Similarly, 250 WPM and 15 ms timing heuristics need calibration before becoming rejection rules.

The engine is a statistical adaptation system with LLM-assisted text. No trained-model component is currently specified. If the rubric requires one, revise the design and evaluation plan rather than presenting an API call as model training.

## 8. Evaluation and major risks

Compare adaptive and fixed practice with equal budgets, matching initial typist profiles and a common held-out assessment. Use multiple seeds and report variation. Tune on profiles separate from the final evaluation. The simulated learning model must not automatically favour the adaptive policy. Simulations show behaviour under assumptions, not proof of faster human learning.

A small volunteer pilot can test usability and provide limited real-user evidence. Report participant count, duration, consent approach and limitations.

Main risks and responses:

- **Typing capture/replay:** build a minimal end-to-end component early; test corrections, pauses and mode boundaries.
- **Small-alphabet generation:** validate curriculum feasibility and implement drill fallback before the LLM.
- **Concurrent/retried submissions:** test persistence failures and multiple tabs, not only happy paths.
- **Browser timing:** distinguish learning-sample filters from integrity rejection and document measurement limitations.
- **Scope:** protect adaptive behaviour and evaluation; formally revise scope before dropping required features.
- **Sleeping hosting:** maintenance jobs catch up after restart; demonstrate warm and cold behaviour honestly.
- **Changing settings:** capture rules per session and maintain immutable versions.
- **Privacy:** minimise raw data, purge on schedule and test deletion through generated PDFs/caches as well as database rows.

## 9. Team organisation requirements

Plan phases with five concurrent human work tracks. Within each phase, tracks depend on prior-phase deliverables, contracts agreed at phase start or explicit mocks. This is a team planning requirement, not an instruction to automatically create AI agents.

Each phase starts with a contract meeting, includes a mid-phase sync and ends with integration and an end-to-end demo. Suggested phase themes:

1. Foundations: contracts, schema, development setup, authentication skeleton and typing/replay spike.
2. Core loop: real account → assigned text → server result → saved history.
3. Adaptive loop: evidence, focus, groups, mastery, reviews and explanations.
4. Validated generation, rewards and initial admin analytics.
5. Forum, certificates, settings and full administration.
6. Hardening, simulation, pilot, performance, deployment and final report/demo.

Assign the strongest relevant developers to typing input and engine/scoring. Use short reviewed PRs, integrate daily and protect `main`. Owners coordinate shared files and review changes; ownership is not a blanket ban on another teammate making a necessary reviewed change. Schema migrations receive a designated owner's review.

Each task should list dependencies, contract, files likely touched, implementation steps and a concrete “done when” check. Do not mark a phase done until its demo works end to end. Run lint, type-check, relevant tests and build in CI. Keep schema, shared contracts and environment examples aligned.

## 10. Working instructions for the next collaborator

Start with [AGENTS.md](../../AGENTS.md) and [current state](current-state.md), then read only the SRS sections and guides relevant to the task. Read this longer handoff when planning a phase or needing decision rationale. Ask about unresolved decisions when they block the next stage; continue independent work where possible. Use direct explanations and honest pushback. Distinguish required scope, proposed implementation details and undecided choices.

Do not assume the repository is empty. Inspect it only when implementation or a code review is requested. Reconcile it with the agreed requirements before changing it. Do not revive old language-learning, teacher/class or Google-auth features because they appear in earlier material.
