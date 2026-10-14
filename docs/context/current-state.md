# Current state

Updated: 14 October 2026. Update this short file when status changes; replace stale statements rather than accumulating a diary.

| Area | Status |
| --- | --- |
| Current phase | Documentation and planning |
| Requirements | SRS v1.2 includes owner-requested Light/Dark, English/Arabic UI and desktop/mobile non-typing layouts; learning-policy TBDs remain |
| Architecture | Target proposal, not a map of the existing code |
| Application | Known mismatch with docs; implementation intentionally not inspected |
| API | Draft examples; no phase contract agreed yet |
| Setup/tests | Commands and application behaviour unverified |
| Visual design | DESIGN.md v0.2 proposes 35 paired Light/Dark tokens, Arabic RTL rules and desktop/mobile screen matrix; 62 opaque contrast checks passed; no Figma file or rendered UI verification |
| Presentation scope | Decision 0002 records required appearance/interface/responsive support; preference DTOs and visual values remain proposed; English desktop typing scope preserved |

## Current working boundary

Documentation lives in this repository's `docs/`, with `AGENTS.md`, `README.md` and `DESIGN.md` at its root. During documentation work, leave the application untouched. A future explicit implementation task can inspect and change the relevant code without treating the proposed tree as permission to rewrite everything.

## Next decisions

1. Confirm deadline, course deliverables and whether a trained model is required.
2. Agree the first phase scope, owners and API contracts before parallel implementation.
3. Finalise target WPM/curriculum rules, then reward and certificate policies at their respective phases.
4. Choose provider/hosting and verify setup when implementation is authorised.
5. Review Figma desktop/mobile × Light/Dark × English/Arabic screens, Arabic translations and preference schemas before UI implementation.

The full unresolved list is in the [handoff](handoff.md). Do not mark these decisions complete based on placeholders in a new document.

## Handoff update format

For future updates include only: current task/phase, completed work with evidence, affected files/PR, unresolved blockers, and next concrete step. Avoid copying the SRS or saving private conversations here.
