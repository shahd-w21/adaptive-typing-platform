# Decision records

Keep one short Markdown file per meaningful decision: **what, why and date**, plus status and owner. Use `NNNN-short-title.md`; allocate the next unused number when merging to avoid teammate collisions.

Copy [TEMPLATE.md](TEMPLATE.md). Use Proposed, Accepted, Rejected or Superseded. Only record Accepted when a human/team decision exists; generated suggestions are Proposed. Link the affected SRS sections/contracts, and update them in the same change. A historical record does not silently override the current SRS.

| Record | Status | Subject |
| --- | --- | --- |
| [0001](0001-documentation-organisation.md) | Accepted for this documentation task | Repository documentation layout and code boundary |
| [0002](0002-appearance-localisation-responsive.md) | Accepted scope; visual tokens/API shapes Proposed | Light/Dark, English/Arabic UI and desktop/mobile non-typing presentation |

Earlier product decisions remain in the SRS/handoff; do not invent approval dates or teammate names to backfill records. Add records when those choices are revisited. For a superseded decision, retain its history and link the replacement.
