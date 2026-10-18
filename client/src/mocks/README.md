# Frontend mock data

Synthetic, deterministic examples for isolated previews and future frontend integration. These modules are not imported by the running application and do not intercept requests, authenticate users or seed the database. Dates are fixed at 19 October 2026; clone an example before modifying it because exports share references.

```js
import { dashboardResponse, sessionAssignment, errorResponses } from './mocks/index.js';

const preview = structuredClone(dashboardResponse);
const passage = sessionAssignment.text;
const conflictBody = errorResponses.sessionConflict.body;
```

The import above assumes a file directly under `client/src/`.

| File | Data |
| --- | --- |
| `users.js` | Public Student/Admin profiles and an Arabic/dark new-student variant |
| `sessions.js` | Practice start request, assignment, complete event submission, result and history/empty history |
| `path.js` | Starter groups, home-row evidence, unknown metrics and locked keys |
| `dashboard.js` | Dashboard/path, progress and new-student/empty variants |
| `gamification.js` | Current XP, level, streak and daily-goal response shapes |
| `errors.js` | HTTP statuses and error bodies for common failure previews |
| `index.js` | Named exports for all examples |

Shapes follow the current implementation described in the [API contract](../../../docs/api-contract.md#teammate-backend-migration). Shared session schemas validate the example request/submission; metrics use the shared formula. Complete response schemas do not exist yet. The perfect attempt uses only unlocked English home-row keys and can be replayed by the server scoring function. Its XP and level illustrate the current migration policy, not a new product rule. Real results and rewards remain server-owned.

Course, forum, certificate and badge API fixtures are deferred until their draft boundaries are agreed. A placement recommendation mirrors the current server response; it does not imply placement is implemented. Nothing here establishes API integration or feature readiness.
