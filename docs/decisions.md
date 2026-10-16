# Decisions and open questions

This is the single decision log. Preserve dates, rationale and status; update the SRS when a decision changes product behaviour. Historical setup statements describe their date and do not certify implementation. Only a human/team decision may be marked Accepted.

| Record | Status | Subject |
| --- | --- | --- |
| [0001](#0001) | Historical; organisation updated by 0004 | Initial documentation layout |
| [0002](#0002) | Accepted scope; visual values/API shapes proposed | Appearance, English/Arabic interface and responsive non-typing pages |
| [0003](#0003) | Accepted team decision | JavaScript, Tailwind and root client/server folders |
| [0004](#0004) | Accepted documentation task | Developer-first README and consolidated guides |
| [0005](#0005) | Structure retained; feature-removal scope superseded by 0006 | One active backend and workspace setup |
| [0006](#0006) | Accepted migration task | Preserve teammate features in the new architecture |
| [0007](#0007) | Accepted styling task | Migrate existing frontend styles to Tailwind utilities |

<a id="0001"></a>
## 0001 — Organise project and agent documentation

- Status: Accepted for the current documentation task
- Date: 2026-10-13
- Decision authority: project owner's request in this chat
- Scope: documentation organisation only; no new product/API/design approval

### Decision

Keep documentation within `adaptive-typing-platform`. Put concise agent instructions and the unapproved design template at the repository root. Use `docs/README.md` as the guide index, `docs/context/` for current status and long-form handoff, and `docs/decisions/` for dated decisions. Rename the detailed project-structure guide to architecture.md and preserve the SRS requirements.

### Why

Teammates and agents need a shared entry point and task-specific reading paths. Separating requirements, draft contracts, context and design placeholders reduces duplicated rules and prevents proposals being mistaken for implemented features.

### Consequences

Update local links after moving documents. Do not inspect or modify application code during this work: the owner explicitly said it does not match the documentation and should be ignored for now. Setup/API examples remain unverified and DESIGN.md remains a template. Future explicit implementation tasks can inspect and change relevant code within their authorised scope.

<a id="0002"></a>
## 0002 — Appearance, interface language and desktop/mobile presentation

- Status: Accepted scope for this documentation task; visual values and API shapes remain Proposed
- Date: 2026-10-14
- Authority: project owner's explicit request for Light/Dark, interface-only language switching and desktop/mobile design; owner confirmed English and Arabic
- Implementation/design reviewers: TBD
- Affected requirements/contracts: SRS v1.2 SYS-53–56, section 2.2 and section 10.5; DESIGN.md; draft account-preference contract

### Context

The previous design brief specified Light only. SRS v1.1's phrase “languages other than English” did not distinguish interface language from exercise language. The owner now requires both appearance modes and English/Arabic website controls, while preserving content language, and asks for explicit desktop/mobile layouts.

### Decision

Require Light/Dark appearance and English/Arabic interface localisation on public, Student and Admin pages. Arabic has an RTL shell; assigned typing text, English curriculum and the physical QWERTY guide stay English/LTR. Authored/user content and certificate PDFs are not automatically translated. Require desktop/mobile layouts for non-typing pages and their edge states. Mobile typing/touch keyboards remain out of scope; phone typing entry points show desktop guidance.

Document labeled appearance/language controls, persistence and failure recovery. The design defaults are System appearance (resolving Light/Dark, Light fallback) and English interface; signed-in account preferences take precedence over guest choices. These defaults are design choices made within this task, not evidence of a separate team approval. They must not affect session timing, scoring, content generation, learning progress, timezone or authorisation.

### Why

Layered navy Dark colours preserve the educational identity without a bright study canvas. Interface-only localisation makes the site usable in Arabic while preserving a single English curriculum and scoring contract. Responsive non-typing pages support phone access without silently adding a new typing/input model.

### Consequences and follow-up

- [SRS](srs.md) owns the required behaviour and defaults; [DESIGN.md](../DESIGN.md) owns proposed Light/Dark tokens, Arabic typography/RTL rules and responsive screen matrix.
- [Architecture](architecture.md) and [API contract](api-contract.md) describe presentation state and proposed owner-only preference fields. Exact schemas and reason-code translation payloads still need phase agreement.
- [Testing](testing.md) covers mode/locale/viewport combinations, unchanged English assignments and preference persistence. Token contrast calculations do not verify rendered UI or an implemented feature.
- No application code, packages, database migrations or Figma artifacts are changed by this decision. Native Arabic review, complete translation coverage, Figma review and browser/accessibility verification remain pending.
- This replaces the former Light-only visual restriction and clarifies the English-only content boundary. [0001](decisions.md#0001) remains the historical documentation-organisation decision; its template status described that earlier date.

<a id="0003"></a>
## 0003 — Use JavaScript and root-level client/server folders

- Status: Accepted
- Date: 2026-10-15
- Decision authority: project owner reporting the team's decision in this chat
- Affected areas: SRS, architecture, setup, agent instructions and teammate guides

### Decision

Use JavaScript throughout the application/shared package, `.jsx` for React components and `.js` for other modules, scripts, tests and configuration examples. Use ES modules. Retain Tailwind CSS and the rest of the agreed stack.

Place the frontend in root-level `client/` and the backend in root-level `server/`. Keep shared runtime Zod schemas, constants and pure metric functions in `packages/shared/`. Planned npm workspaces reference these locations.

### Why

The team chose JavaScript and these folder names. Teammates and agents need a consistent target. This replaces the previous TypeScript and apps/web/apps/api proposal.

### Consequences

Use runtime validation, documented JSON contracts, optional JSDoc, linting, tests and builds. Static-type compilation/type-check scripts are not required. Preserve scoring, auth, privacy, localisation, responsive-layout and design requirements.

Only Markdown changed for this decision. Application code, package manifests, configuration and actual folders were not migrated or validated. Setup commands and API examples retain their unverified/draft status. Reconcile relevant code with this target during a later implementation task.

<a id="0004"></a>
## 0004 — Consolidate documentation around developer onboarding

- Status: Accepted for this documentation task
- Date: 2026-10-15
- Authority: project owner's request to reduce Markdown fragmentation and guide human developers

The root README owns the first-clone workflow, daily command contract and reading map. Development consolidates setup/environment/database guidance. Contributing includes AI and Figma handoff. Security includes auth/permissions. This file retains the dated decision history and open questions; current-state remains a short handoff.

This replaces the organisational layout in 0001 without changing product decisions 0002/0003 or SRS requirements. Existing code is explicitly out of scope. Local ports/credentials and root scripts are documented development conventions for foundations to implement/verify, not claims about the current source. No application scripts or configuration are created by this task.

<a id="0005"></a>
## 0005 — Consolidate the development foundation

- Status: Accepted cleanup scope
- Date: 2026-10-15
- Authority: project owner approved the keep/remove plan and instructed implementation

Keep one ES-module backend in `server/src/`, Prisma schema/migrations, and a root npm workspace lockfile. Remove the retired CommonJS backend, SQL bootstrap, obsolete tests, redundant package boundaries and unused backend dependencies. Removed files remain recoverable from commit `68d311f`.

Preserve all existing client files and teammate-owned documentation. The client lockfile remains temporarily for that handoff. Preserve local environments and database volumes. Keep the existing account migration unchanged; future auth design extends it through reviewed migrations. This cleanup implements no replacement product features and changes no SRS requirements. Verification belongs in the development guide.

<a id="0006"></a>
## 0006 — Migrate the teammate's work instead of discarding its features

- Status: Accepted implementation task
- Date: 2026-10-15
- Authority: project owner clarified that the removed backend is a teammate's work and requested migration to the current architecture

Recover the implementation from `68d311f` and preserve its account/profile, practice/scoring, key progress/unlocks, dashboard/progress, XP/level/streak and Admin-check flows in ES-module feature modules under `server/src/`. Retain its supporting schema concepts through additive Prisma migrations; do not run the old destructive/invalid SQL bootstrap. Replace its manual scripts with repeatable tests. Credit the source and document the old-to-new API map.

This supersedes 0005's feature-removal outcome while retaining one entry point, root workspace tooling and the protected frontend boundary. Current SRS scoring, revocation, CSRF and retry rules take precedence over old placeholders. Recovered target/curriculum/reward/integrity defaults remain development policy pending the existing open decisions. The migration is not a legacy database import or completion of every SRS feature. Verification and limitations are in development/API contract; no frontend, commit, push or deployment is authorised by this record alone.

<a id="0007"></a>
## 0007 — Migrate the existing frontend styling to Tailwind

- Status: Accepted styling task
- Date: 2026-10-15
- Authority: project owner requested Tailwind in place of unnecessary CSS files

Wire Tailwind into Vite and migrate the existing screens to utility classes. Consolidate theme tokens, document defaults and caret keyframes in one CSS entry point; remove the redundant app/global/token stylesheets. Preserve appearance preferences, English/Arabic UI, English LTR typing and existing application behaviour. Retain inline values only when they come from data.

This authorises edits to the frontend for the styling migration, beyond the earlier foundation-only boundary. It changes no learning policy or API contract. Verification and remaining browser checks are recorded in the development guide.

<a id="0008"></a>
## 0008 — Adaptive course library and admin-authored paths

- Status: Accepted course model; scaffold only, runtime implementation not authorized
- Date: 2026-10-16
- Authority: owner approved the proposed course model and requested frontend/backend/shared folders and comment-only files; no runtime implementation authorized
- Affected baseline: SRS SYS-16–29, SYS-33, SYS-42–45, SYS-50 and section 9.6 / SYS-57–64; architecture, API contract, content guide and testing

Adopt a published course library with versioned Course → Unit → Lesson paths, separate enrollments/progress and one shared skill profile/adaptive/session engine. Offer optional placement at first learning entry; reuse relevant evidence on later enrollments and offer targeted checks for gaps. Preserve the difference between placement exemptions, mastery and course completion. Admins author constraints and objectives; the engine chooses practice and the LLM supplies validated text with fallback. Existing rewards, reviews, assessments, certificates, forum and presentation requirements remain in scope.

Rationale: courses make curriculum discoverable without restarting skill measurement or building a separate adaptive engine for each path. Immutable published versions protect current learners and assigned text. The tradeoff is additional enrollment, curriculum-version and objective-completion complexity. Do not treat course completion as the existing performance certificate or duplicate XP across courses.

The owner approved the initial optional-placement/targeted-check policy, shared evidence with separate progress, objective/checkpoint completion and immutable publication/archival model. Approval authorizes structural placeholders and documentation only; it does not authorize implementing or wiring routes, UI, models or migrations. Exact JSON/Prisma schemas, numerical freshness/reattempt policies, concrete lesson objectives and checkpoint thresholds, the initial course outlines and any future enrollment-migration mapping remain to agree before their implementation. Preserve existing teammate files.

## Open decisions
| Decision | When it must be settled |
| --- | --- |
| Does the course require training a model? | Before committing to the engine implementation |
| Actual deadline, marking rubric, required diagrams/prototypes | Before task allocation |
| Default target WPM, permitted range and final curriculum groups | Before placement/mastery implementation |
| Course details: exact contracts/schema, freshness/reattempt limits, concrete objectives/checkpoints, initial course outlines and any enrollment-migration mapping | Before implementing the corresponding course features; overall model accepted in 0008 |
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
## Record template

Append the next unused numbered entry; keep records short. Use Proposed, Accepted, Rejected or Superseded. Record the real decision date and authority; do not invent approvals.

```text
NNNN — Title
Status:
Date / owner / reviewers:
Affected requirements/contracts:
Context:
Decision and boundaries:
Why / alternative / tradeoff:
Consequences / verification / replacement if superseded:
```
