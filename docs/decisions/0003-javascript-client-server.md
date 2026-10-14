# 0003 — Use JavaScript and root-level client/server folders

- Status: Accepted
- Date: 2026-10-15
- Decision authority: project owner reporting the team's decision in this chat
- Affected areas: SRS, architecture, setup, agent instructions and teammate guides

## Decision

Use JavaScript throughout the application/shared package, `.jsx` for React components and `.js` for other modules, scripts, tests and configuration examples. Use ES modules. Retain Tailwind CSS and the rest of the agreed stack.

Place the frontend in root-level `client/` and the backend in root-level `server/`. Keep shared runtime Zod schemas, constants and pure metric functions in `packages/shared/`. Planned npm workspaces reference these locations.

## Why

The team chose JavaScript and these folder names. Teammates and agents need a consistent target. This replaces the previous TypeScript and apps/web/apps/api proposal.

## Consequences

Use runtime validation, documented JSON contracts, optional JSDoc, linting, tests and builds. Static-type compilation/type-check scripts are not required. Preserve scoring, auth, privacy, localisation, responsive-layout and design requirements.

Only Markdown changed for this decision. Application code, package manifests, configuration and actual folders were not migrated or validated. Setup commands and API examples retain their unverified/draft status. Reconcile relevant code with this target during a later implementation task.
