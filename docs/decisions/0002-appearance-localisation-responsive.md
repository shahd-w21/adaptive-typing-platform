# 0002 — Appearance, interface language and desktop/mobile presentation

- Status: Accepted scope for this documentation task; visual values and API shapes remain Proposed
- Date: 2026-10-14
- Authority: project owner's explicit request for Light/Dark, interface-only language switching and desktop/mobile design; owner confirmed English and Arabic
- Implementation/design reviewers: TBD
- Affected requirements/contracts: SRS v1.2 SYS-53–56, section 2.2 and section 10.5; DESIGN.md; draft account-preference contract

## Context

The previous design brief specified Light only. SRS v1.1's phrase “languages other than English” did not distinguish interface language from exercise language. The owner now requires both appearance modes and English/Arabic website controls, while preserving content language, and asks for explicit desktop/mobile layouts.

## Decision

Require Light/Dark appearance and English/Arabic interface localisation on public, Student and Admin pages. Arabic has an RTL shell; assigned typing text, English curriculum and the physical QWERTY guide stay English/LTR. Authored/user content and certificate PDFs are not automatically translated. Require desktop/mobile layouts for non-typing pages and their edge states. Mobile typing/touch keyboards remain out of scope; phone typing entry points show desktop guidance.

Document labeled appearance/language controls, persistence and failure recovery. The design defaults are System appearance (resolving Light/Dark, Light fallback) and English interface; signed-in account preferences take precedence over guest choices. These defaults are design choices made within this task, not evidence of a separate team approval. They must not affect session timing, scoring, content generation, learning progress, timezone or authorisation.

## Why

Layered navy Dark colours preserve the educational identity without a bright study canvas. Interface-only localisation makes the site usable in Arabic while preserving a single English curriculum and scoring contract. Responsive non-typing pages support phone access without silently adding a new typing/input model.

## Consequences and follow-up

- [SRS](../srs.md) owns the required behaviour and defaults; [DESIGN.md](../../DESIGN.md) owns proposed Light/Dark tokens, Arabic typography/RTL rules and responsive screen matrix.
- [Architecture](../architecture.md) and [API contract](../api-contract.md) describe presentation state and proposed owner-only preference fields. Exact schemas and reason-code translation payloads still need phase agreement.
- [Testing](../testing.md) covers mode/locale/viewport combinations, unchanged English assignments and preference persistence. Token contrast calculations do not verify rendered UI or an implemented feature.
- No application code, packages, database migrations or Figma artifacts are changed by this decision. Native Arabic review, complete translation coverage, Figma review and browser/accessibility verification remain pending.
- This replaces the former Light-only visual restriction and clarifies the English-only content boundary. [0001](0001-documentation-organisation.md) remains the historical documentation-organisation decision; its template status described that earlier date.
