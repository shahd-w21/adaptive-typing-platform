# Content authoring guide

**Status: target workflow and proposed authoring shapes.** Content storage/commands are not verified. See SRS section 9 for authoritative coverage and fallback rules and [architecture](architecture.md) for proposed locations.

## Word lists

Use short, appropriate English words with stable list IDs and a recorded source/licence. Remove duplicates, empty entries and accidental whitespace. Decide case/normalisation in the validator; never silently introduce punctuation or uppercase characters outside the supported alphabet. A theme's words are still filtered against the session's allowed characters.

Illustrative authoring shape, to agree before writing importers:

```json
{"id":"home-row-example","language":"en","words":["ask","sad","dad","fall"],"source":"team-authored"}
```

These are examples, not seeded curriculum. Runtime allowed-character and blocked-content validation still applies.

## Themes

Here **theme** means an exercise topic/content constraint. Light/Dark appearance is a separate interface preference in [DESIGN.md](../DESIGN.md); it must not change this configuration.

A theme supplies a label, content guidance and compatible word-list references. It does not unlock keys, alter scoring or instruct the LLM to ignore validation. Keep prompt instructions separate from editable theme descriptions.

```json
{"id":"everyday-example","label":"Everyday words","wordListIds":["home-row-example"]}
```

Themes may be dropped when a restricted alphabet cannot support them. Tell the learner why the exercise uses drills; do not suggest a fallback error when this is intentional.

## Key groups

Define stable group IDs, unique character membership, an ordered prerequisite graph and at least one feasible drill. Spaces must be explicitly allowed by the generation spec. Uppercase, digits and punctuation need deliberately authored groups and input support.

```json
{"id":"home-row-example","label":"Home row example","keys":["a","s","d","f","j","k","l"],"prerequisiteGroupIds":[]}
```

This example does not settle the final home-row curriculum. Check for missing prerequisites, cycles, duplicate membership and unreachable groups. Changes affecting existing learner progress need an explicit migration decision; changing a label alone should not reset progress.

## Validation and activation

1. Author or edit content using the agreed schema and record the source/licence.
2. Validate references, alphabet, blocked content and all active group prerequisites.
3. Demonstrate feasible word/drill fallback for each active group, including sparse alphabets and requested key/pair coverage.
4. Preview representative beginner and advanced exercises; review readability and suitability.
5. Review the change, assign a new content/validation version and activate it through the agreed process.
6. Invalidate incompatible cached text. Preserve already-assigned text and captured rules for active sessions.

The planned `content:validate` script must fail on invalid content; it is not yet verified. Admin editing and seeded content should use the same validators rather than diverging formats.

All generated and fallback text passes the same applicable checks. Theme and natural prose may relax; locked characters and blocked-content rules may not. Rebuild an impossible focus specification before generation and record the reason. Do not secretly lower coverage requirements to make a validator pass.

Blocked-content matching boundaries, normalisation and false-positive handling remain to be agreed. Test words containing innocent substrings; a substring blacklist is not automatically the intended moderation policy.

## Course authoring — approved model, content schema pending

See [SRS section 9.6](srs.md#course-proposal) for approved policy. This is an authoring checklist; the exact content schema/importer is not agreed or implemented. `server/prisma/content/courses/` reserves a place for reviewed course outlines and is not read by the current seed.

For each course, propose a title/summary, objectives, learner level, entry requirements, supported English QWERTY scope and ordered units. Each lesson references shared key groups/skills, prerequisites, permitted activity modes, difficulty/length bounds, optional theme/word lists and objective/completion rules. Reuse shared skill definitions rather than cloning keys per course. Admins define what to learn; generated exercise text can vary per learner. A themed title never permits locked characters.

Preview both novice and experienced learner paths, plus skipped placement, weak/unknown evidence, due reviews and unavailable LLM service. Validate cycles, unreachable lessons, version-owned references, safe content, attainable objectives and a feasible fallback for every activity before publication. Numeric mastery/scoring thresholds remain versioned policies from the SRS, not unchecked lesson text. Review completion/checkpoint rules and initial course outlines with the team before authoring a large catalog.

Published curriculum changes create a successor draft; retain old versions for existing progress and assignments. Mark empty scaffold JSON as placeholders until the importer and reviewed schema exist. Course metadata and authored exercise content are not automatically translated by the LLM. Interface labels/status explanations follow existing English/Arabic UI rules.

## Interface language versus typing content

English/Arabic interface selection (SRS SYS-54) translates controls, helper copy and system explanations only. Assigned passages, authored lesson text, word lists, focus keys/pairs and QWERTY labels stay English; user/forum content stays as authored. Do not feed `uiLocale` into generation prompts, word-list selection, validation or cache compatibility. An Arabic shell presents the English exercise/input/keyboard in an explicit LTR region without rewriting stored characters or adding direction marks to the assignment. Authored content and certificate PDFs are not automatically translated. Translatable interface labels belong in reviewed UI dictionaries, not mutable exercise prose or LLM output.
