# API contract

**Status: target contract remains DRAFT; migrated endpoint details below describe current code.** Implemented does not imply team approval of every draft field or completion of every SRS requirement. Required behaviour comes from the [SRS](srs.md). The teammate's backend migration and its explicit differences are recorded below; other examples remain proposals.

## Teammate backend migration

Source: teammate work in commit `68d311f`. CommonJS/pg code has been relocated and adapted to ES-module feature services, Prisma persistence, shared validation/formulas, injected dependencies and a single `/api/v1` router. No frontend files are changed. Integration tests live in `server/tests/integration/features.test.js`; logic tests replace the old manual scripts with hardcoded demo credentials.

| Previous route under `/api` | Current route under `/api/v1` | Implementation |
| --- | --- | --- |
| `POST /auth/signup` | `POST /auth/register` (`/auth/signup` alias) | `modules/auth/routes.js` and `service.js` |
| `/auth/verify-email`, `/resend-verification`, `/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password` | Same suffixes under `/auth` | Auth service, hashed one-use email tokens, revocable sessions, SMTP integration |
| `GET/PATCH/DELETE /profile` | `GET/PATCH/DELETE /users/me` | `modules/users/` |
| `POST /profile/password` | `POST /users/me/password` | Password check/update and session revocation |
| `POST /sessions/start` | `POST /sessions` (`/sessions/start` alias) | Practice assignment, captured policy and owned session |
| `POST /sessions/:id/submit` | Same suffix | Shared event schemas, replay, atomic persistence and safe retries |
| `GET /keyboard` | `GET /path` or `/path/keyboard` | Groups, per-key statistics/status and recommendation |
| `GET /dashboard` | `GET /dashboard` | Profile summary, XP/level/streak, daily goal, recommendation and recent sessions |
| `GET /progress` | `GET /progress` | Completed practice history and per-key data |
| `GET /admin/ping` | `GET /admin/ping` | Live server-side Admin check |

Additional supporting routes: `GET /sessions`, `GET /sessions/:id`, `POST /sessions/:id/abandon`, `GET /gamification`. The old `/api` prefix is not mounted. IDs are now opaque UUID strings. Old SQL data is not automatically imported; account hashes remain bcrypt-compatible for a future reviewed data import if needed.

Implemented request details:

- Register/login/resend/forgot use `email` and password fields shown below; register and reset accept optional matching `confirmPassword`. Registration ignores a submitted role and creates Student.
- Verification uses `{token}`. Reset uses `{token,password,confirmPassword?}`. Password change uses `{currentPassword,newPassword,confirmPassword}`. Deletion uses `{password}`.
- Profiles use camelCase: `name`, `timezone`, `targetWpm`, `dailyGoalMinutes`, `largeText`, `reducedPressure`, and partial `preferences` (`themePreference`, `uiLocale`). Replies contain `{user}`; login/me include only allowlisted public user fields. Roles in public DTOs are `student`/`admin`.
- Login sets the httpOnly `token` cookie and returns `{user,csrfToken}`; `GET /auth/me` returns a fresh representation of the same session's CSRF token. Send cookies and `X-CSRF-Token` on authenticated POST/PATCH/DELETE calls. Logout revokes the server record; password reset/change revoke all sessions. Explicitly different browser Origins are rejected.
- Start accepts `{mode:"practice"}` (or `{}`) and returns `{sessionId,mode,text,source,issuedAt,expiresAt,rules}`. Only practice was implemented in the teammate's server; other modes are not silently mapped to it.
- Submit uses the canonical `events`/`finishTimeMs` shape below. The old `{keystrokes:[{typed_char,t_ms}]}` wire shape is replaced, not accepted as authoritative scores. Practice must finish on its last completing insert; pause/resume are supported. Maximum 5000 events and 512 KiB JSON body.
- Results contain `sessionId,status,metrics,passed,rewards,xpEarned,xp,level,leveledUp,streak,masteredKeys,unlockedKeys,problemKeys,certificate`. `certificate` is null. Metrics use SRS formulas; accuracy gating uses unrounded raw accuracy. Identical retries return the saved JSON; different payloads conflict. Current history returns at most 100 sessions; pagination/filter contracts remain draft.

Preserved intent with deliberate corrections: no destructive schema bootstrap; pure generation/replay; all official scores derived server-side; current SRS formulas and mastery evidence replace old placeholders; raw accuracy gates mastery/unlocks; user row locks and bounded serialization retries protect concurrent updates; result/log/stat/reward writes share one transaction. Raw logs expire separately from results and retry hashes. Last-active-admin deletion remains protected. Email calls are outside transactions and tokens are not logged.

The recovered key groups, 40 WPM target, 10–250 profile bounds and versioned reward/integrity defaults are prototype migration policy, pending the open team decisions. Full pair statistics, placement/review/timed/certified modes, difficulty progression, AI text generation, badges, certificates, forum and full admin APIs remain unimplemented. Their existing schema concepts are retained, including the one-accepted-answer-per-thread index. This migration does not certify the entire SRS or approve the remaining draft contract.

## Conventions to agree

Implement shared schemas as JavaScript ES modules in `packages/shared/`, consumed by root-level `client/` and `server/`. Validate payloads at runtime. The language/folder change does not change these JSON contracts or the `/api/v1` URL prefix.

Proposed base path: `/api/v1`. JSON bodies and responses; UTC ISO-8601 strings for server dates, milliseconds for event times, WPM as numbers and accuracy percentages in `[0,100]`. Unknown metrics are `null`, not zero or 100. IDs are opaque strings. Authentication uses a cookie, not a JSON bearer token. Apply the selected CSRF mechanism to state-changing authenticated routes.

The team must agree pagination, body limits, identifier format, CSRF transport, expiry/timing tolerances, rounding for display, canonical submission hashing and complete schemas before the relevant phase. Shared Zod schemas will enforce the agreed shapes; these examples are not substitutes for schemas.

Proposed error envelope:

```json
{
  "error": {
    "code": "SESSION_CONFLICT",
    "message": "This session already has a different submitted result.",
    "requestId": "example-request-id",
    "retryable": false
  }
}
```

Proposed statuses: 400 malformed input, 401 unauthenticated, 403 forbidden/CSRF failure, 404 unavailable resource, 409 conflicting state, 422 invalid exercise submission, 429 rate limit, 503 temporary dependency failure. Never expose stack traces or another user's resource details. Agree whether inaccessible owned resources uniformly return 404 to limit disclosure.

## Route inventory

All names are proposed; freeze routes and full shapes per phase, not all at once.

| Method/path (under base path) | Access | Input/output intent |
| --- | --- | --- |
| `POST /auth/register` | Public, rate-limited | Email/password → verification-needed acknowledgement |
| `POST /auth/verify-email` | Public, rate-limited | One-time token → acknowledgement |
| `POST /auth/resend-verification` | Public, rate-limited | Email → safe acknowledgement |
| `POST /auth/login` | Public, rate-limited | Email/password → public user DTO + cookie |
| `POST /auth/logout` | Authenticated | Revoke current session, clear cookie |
| `GET /auth/me` | Authenticated | Public user DTO including own presentation preferences |
| `POST /auth/forgot-password` | Public, rate-limited | Email → same acknowledgement whether account exists or not |
| `POST /auth/reset-password` | Public, rate-limited | Token/new password → acknowledgement; revoke sessions |
| `PATCH /users/me` | Owner (Student or Admin) | Allowlisted profile/preferences fields → updated DTO; partial preference merge |
| `DELETE /users/me` | Owner | Deletion confirmation contract TBD → completion/status |
| `POST /sessions` | Student | Mode/options → server assignment |
| `POST /sessions/:id/submit` | Owner | Events/finish time → official result |
| `POST /sessions/:id/abandon` | Owner | Mark abandoned; no rewards |
| `GET /sessions/:id` | Owner | Status or saved official result |
| `GET /sessions` | Owner | Paginated history; filters TBD |
| `GET /path` | Student | Keyboard state, due reviews and next activity/reason |
| `GET /progress` | Student | Mode-aware trends and key heat map |
| `GET /gamification` | Student | XP, level, goals, streak and badges |
| `GET /certificates` | Owner | Certificate list |
| `GET /certificates/:id/pdf` | Owner | Downloadable PDF |
| `GET /certificates/verify/:code` | Public | Approved public fields/status only |
| `/forum/*` | Student; public reading TBD | Threads, posts, accepted answer and reports; exact routes TBD |
| `/admin/*` | Admin | Users, content, settings, analytics, moderation, certificates and audit; exact routes TBD |

Outside the base path: proposed `GET /health/live` and `GET /health/ready`. Placement, review and both test types share `/sessions`; mode selects behaviour. No Google-login endpoint.

## Presentation-preference draft

Required behaviour is recorded in [decision 0002](decisions.md#0002); field names/shapes remain **proposed**, to agree with shared schemas before implementation. Use existing account routes; no language-switch, dark-mode or mobile API is needed.

- Proposed `preferences.themePreference`: `light`, `dark` or `system`; default `system`. Return the stored choice, not a device-specific resolved mode.
- Proposed `preferences.uiLocale`: `en` or `ar`; default `en`. Interface language never becomes a generation/content-language parameter. JSON numbers/UTC timestamps, IDs, codes, raw events and assignment text keep canonical representations.
- `GET /auth/me` and the login user DTO include these owner-only fields. Absent account preferences resolve the SRS defaults. Visitor choices are local allowlisted values, not unauthenticated account updates; account values win at login. SRS section 10.5 owns logout and save-failure rules.
- `PATCH /users/me` validates enums and merges only provided nested keys with current stored preferences. Omitted profile/preference fields remain unchanged; do not replace the whole preferences object from a stale read. Apply owner/active-account/CSRF checks for Students and Admins. Unsupported locales fail validation instead of reaching a dictionary/file path unchecked.

Illustrative request:

```json
{"preferences":{"themePreference":"dark","uiLocale":"ar"}}
```

Illustrative preference fragment in the updated user DTO (not a complete response):

```json
{"preferences":{"themePreference":"dark","uiLocale":"ar"}}
```

Partial update example:

```json
{"preferences":{"uiLocale":"en"}}
```

After that request, the previously stored dark appearance remains. Identical retries of these set-value preferences are harmless. Confirm complete schemas, partial-update conflict semantics and mocks during phase agreement; these examples do not approve an entire public user DTO.

Localise UI messages through stable codes and reviewed dictionaries. Existing `error.code` identifies a translation; retain a safe English fallback. Adaptive explanations need an agreed reason code plus safe parameters alongside an English fallback reason; exact fields remain **Contract to agree**, not implemented fields. Never translate/modify assignment text, forum/user content or certificate PDFs to satisfy `uiLocale`. Desktop/mobile and theme use the same APIs and role checks.

## Initial JSON examples

### Login

Request to `POST /auth/login`:

```json
{"email":"student@example.com","password":"example-only-not-a-real-password"}
```

Proposed 200 response (authentication cookie is set separately):

```json
{"user":{"id":"example-user","displayName":"Layla","role":"student","emailVerified":true,"preferences":{"themePreference":"system","uiLocale":"en"}}}
```

### Start

Request to `POST /sessions`:

```json
{"mode":"practice"}
```

Proposed mode values: `placement`, `lesson`, `practice`, `review`, `timed`, `certified`. Timed mode requests `durationSeconds` from the allowed set. Certified duration comes from approved server policy; the client cannot choose certificate thresholds. Theme options, restart replacement and start-request retry behaviour must be agreed before integration.

Illustrative 201 assignment response:

```json
{
  "sessionId": "example-session",
  "mode": "practice",
  "text": "asdf asdf asdf",
  "textSource": "fallback",
  "issuedAt": "2026-10-13T10:00:00Z",
  "expiresAt": "2026-10-13T10:30:00Z",
  "versions": {"scoring":"example-v1","engine":"example-v1","settings":"example-settings"},
  "rules": {"canPause":true,"focusLoss":"pause","durationSeconds":null}
}
```

The example's expiry and short text are illustrative, not adopted policy or production content. The server stores the effective target, exact text and complete scoring settings regardless of which fields the client needs to display.

### Submit

Illustrative **event-shape fragment**, not a complete valid session submission:

```json
{
  "events": [
    {"seq":0,"type":"insert","t":0,"char":"a"},
    {"seq":1,"type":"insert","t":210,"char":"x"},
    {"seq":2,"type":"backspace","t":400},
    {"seq":3,"type":"insert","t":610,"char":"s"},
    {"seq":4,"type":"pause","t":800},
    {"seq":5,"type":"resume","t":1800}
  ],
  "finishTimeMs": 2400
}
```

Only insert carries `char`; pause/resume are valid only in allowed modes. The actual submitted log must meet the assignment's completion rules. `finishTimeMs` measures elapsed time from the first insert; server replay derives active time using permitted pause spans. Do not send an authoritative score, expected key or correctness flag.

Illustrative result shape, independent of the short assignment and event fragment above:

```json
{
  "sessionId": "example-completed-session",
  "status": "completed",
  "metrics": {"grossWpm":20,"netWpm":20,"rawAccuracy":100,"finalAccuracy":100,"activeDurationMs":60000},
  "rewards": [],
  "nextActivity": {"mode":"practice","reason":"More evidence is needed before mastery."},
  "certificate": null
}
```

An identical accepted retry returns the same saved result without side effects; differing resubmission returns a conflict. Agree concrete key-breakdown, reward-event IDs, next-activity payload and certificate DTOs before integration. Clients must deduplicate already-presented reward events.

## Phase agreement record

Track status per endpoint, not only for the whole document: **Draft → Agreed → Implemented → Verified**. Agreed identifies a dated team-reviewed contract; Implemented links code; Verified links passing acceptance evidence. A mock response or a successful happy path alone does not make a route Verified. Unreviewed draft examples remain proposals.

Use this compact record when an endpoint enters a phase:

```text
Method/path and status:
Phase / contract version / agreement date:
Request schema export and response schema export:
Authentication, role and ownership:
Body/param/query fields, units, optional/null rules:
Success example and validation/permission/error examples:
Rate/body limits, expiry and retry/concurrency behaviour:
Pagination/filter/sort rules where applicable:
Frontend/backend owners and compatibility plan:
Implementation and verification evidence:
```

Use the same shared JavaScript Zod schema names in the contract, server validation and development fixtures. Coordinate a changed schema with both consumers. Keep draft exploration possible, but agree the shared boundary before dependent feature integration.

Fill this for each phase and retain previous agreements when evolving the contract:

| Field | Value |
| --- | --- |
| Phase / contract version | TBD |
| Status | Draft |
| Scope and SYS IDs | TBD |
| Endpoint schemas and positive/error examples | TBD |
| Auth/ownership, limits and retry rules | TBD |
| Frontend/backend owners and reviewers | TBD |
| Agreement date / decision link | TBD |
| Compatibility/migration plan | TBD |
| Verification evidence | Not run |

Before marking agreed, settle required/optional/null fields, time units, permission checks, error codes, pagination, duplicate/concurrent behaviour and matching mocks. A breaking change needs coordination and an updated decision/contract, not a silent field rename.
