# Current state

Updated: 15 October 2026. Update this short file when status changes; replace stale statements rather than accumulating a diary.

| Area | Status |
| --- | --- |
| Current phase | Documentation and planning |
| Requirements | SRS v1.3 adopts JavaScript/client/server and preserves the v1.2 Light/Dark, English/Arabic UI and responsive scope; learning-policy TBDs remain |
| Language and folders | JavaScript/JSX with Tailwind CSS; root-level `client/` and `server/`; shared runtime schemas/formulas in `packages/shared/` |
| Architecture | Target proposal, not a map of the existing code |
| Application | Known mismatch with docs; implementation intentionally not inspected |
| API | Draft examples; no phase contract agreed yet |
| Setup/tests | Commands and application behaviour unverified |
| Documentation review | Added database/AI handoff guides and route/review checklists from the owner-supplied reference; current SRS and accepted decisions remain authoritative |
| Visual design | DESIGN.md v0.2 proposes 35 paired Light/Dark tokens, Arabic RTL rules and desktop/mobile screen matrix; 62 opaque contrast checks passed; no Figma file or rendered UI verification |
| Presentation scope | Decision 0002 records required appearance/interface/responsive support; preference DTOs and visual values remain proposed; English desktop typing scope preserved |

## Current working boundary

Documentation lives in this repository's `docs/`, with `AGENTS.md`, `README.md` and `DESIGN.md` at its root. During documentation work, leave the application untouched. A future explicit implementation task can inspect and change the relevant code without treating the proposed tree as permission to rewrite everything.

## Next decisions

The language/folder choice is recorded in [decision 0003](../decisions/0003-javascript-client-server.md). Only documentation changed; application files, configurations and dependencies were not migrated or verified.

1. Confirm deadline, course deliverables and whether a trained model is required.
2. Agree the first phase scope, owners and API contracts before parallel implementation.
3. Finalise target WPM/curriculum rules, then reward and certificate policies at their respective phases.
4. Choose provider/hosting and verify setup when implementation is authorised.
5. Review Figma desktop/mobile × Light/Dark × English/Arabic screens, Arabic translations and preference schemas before UI implementation.

The full unresolved list is in the [handoff](handoff.md). Do not mark these decisions complete based on placeholders in a new document.

## Handoff update format

For future updates include only: current task/phase, completed work with evidence, affected files/PR, unresolved blockers, and next concrete step. Avoid copying the SRS or saving private conversations here.
