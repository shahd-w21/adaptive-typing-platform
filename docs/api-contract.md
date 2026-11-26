# API contract

**Status: current auth/practice API boundary is recorded as Agreed in BE-01 revision 2; BE-04 now implements the shared lifecycle for the six SRS session modes.** Implementation does not imply approval of unrelated future endpoints or completion of every SRS requirement. Required behaviour comes from the [SRS](srs.md). The teammate's backend migration and its explicit differences are recorded below; other examples remain proposals.

## Teammate backend migration

Source: teammate work in commit `68d311f`. CommonJS/pg code has been relocated and adapted to ES-module feature services, Prisma persistence, shared validation/formulas, injected dependencies and a single `/api/v1` router. No frontend files are changed. Integration tests live in `server/tests/integration/features.test.js`; logic tests replace the old manual scripts with hardcoded demo credentials.

| Previous route under `/api` | Current route under `/api/v1` | Implementation |
| --- | --- | --- |
| `POST /auth/signup` | `POST /auth/register` (`/auth/signup` alias) | `modules/auth/routes.js` and `service.js` |
| `/auth/verify-email`, `/resend-verification`, `/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password` | Same suffixes under `/auth` | Auth service, hashed one-use email tokens, revocable sessions, SMTP integration |
| `GET/PATCH/DELETE /profile` | `GET/PATCH/DELETE /users/me` | `modules/users/` |
| `POST /profile/password` | `POST /users/me/password` | Password check/update and session revocation |
| — | `POST /users/me/email` | Password-confirmed email-change request with one-use verification token |
| `POST /sessions/start` | `POST /sessions` (`/sessions/start` alias) | Placement, lesson, practice, review, timed and certified assignment through one owned session service |
| `POST /sessions/:id/submit` | Same suffix | Shared event schemas, replay, atomic persistence and safe retries |
| `GET /keyboard` | `GET /path` or `/path/keyboard` | Groups, per-key statistics/status and recommendation |
| `GET /dashboard` | `GET /dashboard` | Profile summary, XP/level/streak, daily goal, recommendation and recent sessions |
| `GET /progress` | `GET /progress` | Completed practice history and per-key data |
| `GET /admin/ping` | `GET /admin/ping` | Live server-side Admin check |
| — | `GET /courses`, `GET /courses/:courseId`, `POST /courses/:courseId/enrollments` | Published catalog/detail and idempotent enrollment |
| — | `GET /users/me/enrollments`, `GET /enrollments/:enrollmentId/path` | Owned enrollment list and captured course snapshot |

Additional supporting routes: `GET /sessions`, `GET /sessions/:id`, `POST /sessions/:id/abandon`, `GET /gamification`. The old `/api` prefix is not mounted. IDs are now opaque UUID strings. Old SQL data is not automatically imported; account hashes remain bcrypt-compatible for a future reviewed data import if needed.

**Compatibility transition:** clients must move to `/api/v1`; the old `/api` prefix is not supported. `POST /auth/signup` and `POST /sessions/start` remain aliases under `/api/v1`. The legacy `keystrokes: [{typed_char,t_ms}]` submission body is not accepted: callers must send `{events,finishTimeMs}` and use the server result. Existing account passwords are not reset by this route migration; importing legacy account rows/data requires a separately reviewed data migration. Legacy response fields and unversioned endpoints have no compatibility guarantee.

Implemented request details:

- Register/login/resend/forgot use email and password fields as applicable; registration accepts optional matching `confirmPassword` and ignores a submitted role, creating Student. Password reset requires `confirmPassword`.
- Verification requires `{email,token}`; reset requires `{token,password,confirmPassword}`. Password change uses `{currentPassword,newPassword,confirmPassword}`. Email change uses `{currentPassword,newEmail}`. Deletion uses `{password}`.
- Profiles use camelCase: `name`, `timezone`, `targetWpm`, `dailyGoalMinutes`, `largeText`, `reducedPressure`, and partial `preferences` (`themePreference`, `uiLocale`). Replies contain `{user}`; login/me include only allowlisted public user fields. Roles in public DTOs are `student`/`admin`.
- Login sets the httpOnly `token` cookie and returns `{user,csrfToken}`; `GET /auth/me` returns a fresh representation of the same session's CSRF token. Send cookies and `X-CSRF-Token` on authenticated POST/PATCH/DELETE calls. Logout revokes the server record; password reset/change revoke all sessions. Explicitly different browser Origins are rejected.
- Start accepts `{}`/`{mode:"practice"}`, `{mode:"placement"}`, `{mode:"lesson"}`, `{mode:"review"}`, `{mode:"timed",durationSeconds:60|180|300}`, or `{mode:"certified"}` and returns `{sessionId,mode,text,source,issuedAt,expiresAt,rules}`. Lesson currently means the next available shared key-group lesson; course enrollment/lesson linkage is not part of this contract. Review starts only when mastered keys are due (`409 NO_REVIEWS_DUE` otherwise). Timed text is sized for the captured accepted-speed ceiling and margin. Certified test sessions capture the BE-04 operational thresholds but do not issue a certificate. Placement completion stores assessment evidence and may put prerequisite-qualified groups in progress, but does not grant mastery or XP.
- Submit uses the canonical `events`/`finishTimeMs` shape below. The old `{keystrokes:[{typed_char,t_ms}]}` wire shape is replaced, not accepted as authoritative scores. Untimed passages must finish on their last completing insert; permitted pause/resume is mode-specific. Maximum 10,000 events and 1 MiB JSON body.
- Results contain `sessionId,status,metrics,passed,rewards,xpEarned,xp,level,leveledUp,streak,masteredKeys,unlockedKeys,problemKeys,certificate`. `certificate` is null. Metrics use SRS formulas; accuracy gating uses unrounded raw accuracy. Identical retries return the saved JSON; different payloads conflict. Current history returns at most 100 sessions; pagination/filter contracts remain draft.

Preserved intent with deliberate corrections: no destructive schema bootstrap; pure generation/replay; all official scores derived server-side; current SRS formulas and mastery evidence replace old placeholders; raw accuracy gates mastery/unlocks; user row locks and bounded serialization retries protect concurrent updates; result/log/stat/reward writes share one transaction. Raw logs expire separately from results and retry hashes. Last-active-admin deletion remains protected. Email calls are outside transactions and tokens are not logged.

The recovered key groups, 40 WPM target, 10–250 profile bounds and versioned reward/integrity defaults are prototype migration policy, pending the open team decisions. BE-03 computes pair evidence, but persisted pair statistics and difficulty progression remain unimplemented. BE-04 implements placement/review/timed/certified session lifecycles; certificate issuance remains separate. AI text generation, badges, forum and full Admin APIs remain unimplemented. Existing schema concepts are retained, including the one-accepted-answer-per-thread index. This migration does not certify the entire SRS or approve remaining draft contracts.

## FE-02 current frontend boundary — 22 October 2026

**Implementation status: implemented; Dev 1 review and browser acceptance pending.** This section describes current runtime DTOs, not approved future Prisma models. Existing draft examples below do not override these schemas. The transport remains Fetch; Axios is not added. Existing `request(path, options)` callers and `ApiError.status/code` remain supported.

| Boundary | Request schema | Response schema | Field/verification status |
| --- | --- | --- | --- |
| `POST /auth/register` | `registerSchema` | `acknowledgementSchema` | Implemented; extra fields stripped, including role; server always creates Student |
| `POST /auth/login`, `GET /auth/me` | `loginSchema` / no body | `authResponseSchema` | Implemented; real HTTP login/me schema checks passed |
| Verify/resend/forgot/reset | `verifyEmailSchema`, `emailSchema`, `resetPasswordSchema` | `acknowledgementSchema` | Implemented; verification requires both email and token; reset requires confirmation |
| `POST /auth/logout` | `emptyRequestSchema` | `acknowledgementSchema` | Implemented; real HTTP logout/revocation passed |
| `GET/PATCH /users/me` | no body / `profileSchema` | `profileResponseSchema` | Implemented; real HTTP partial update, restoration and unknown-field rejection passed |
| Password change / account deletion | `changePasswordSchema` / `deleteAccountSchema` | `acknowledgementSchema` | Implemented; existing backend acceptance retained |
| `POST /users/me/email` | `emailChangeSchema` | `acknowledgementSchema` | Implemented; current password required; email verification flow follows server service |
| `POST /sessions` (six SRS modes; mode-specific request fields) | `startSessionSchema` | `sessionAssignmentSchema` | Implemented by BE-04; focused authenticated start/submit checks are registered in the integration suite |
| `GET /sessions`, `GET /sessions/:id` | no body; UUID ID | `sessionHistorySchema`, `sessionDetailSchema` | Implemented; real HTTP empty/history and created/completed/abandoned DTO checks split across unit/integration tests |
| Submit / abandon | `submissionSchema` / `emptyRequestSchema` | `sessionResultSchema` / `sessionAbandonmentSchema` | Implemented; real HTTP result/retrieval/abandon checks passed |
| Error envelope | — | `apiErrorResponseSchema` | Current `{error:{code,message?}}`; requestId/retryable are not server fields |
| `GET /dashboard` | — | `dashboardResponseSchema` | Implemented current DTO; server-backed FE-06 boundary; review/acceptance status is recorded below |
| `GET /path` | — | `pathResponseSchema` | Implemented current DTO for key/group progress and recommendation; review/acceptance status is recorded below |
| `GET /progress` | — | `progressResponseSchema` | Implemented bounded snapshot of completed practice sessions and key stats; no pagination/filtering |
| `GET /gamification` | — | `gamificationResponseSchema` | Implemented XP/level/streak/daily-goal snapshot; badges and reward history are not part of this response |
| `GET /admin/ping` | — | `adminPingResponseSchema` | Implemented Admin access probe only; it is not an Admin management contract |
| `GET /certificates/verify/:code` | — | `publicCertificateSchema` | Implemented public verification; issuance/list/PDF contracts are not implemented |
| Forum | — | No runtime schema or routes in this phase | API design and fixture boundaries are deferred to the forum feature task |
| Student course catalog/details, enroll, owned-enrollment list and owned path | Implemented; contract review and acceptance pending | `server/src/modules/courses/` routes/services, Prisma migration `20261126130000_course_catalog_enrollments`, and shared course/enrollment response schemas | Candidate DTOs are now used by the API and client; published versions only are listed, duplicate same-version enrollment is idempotent, and objective/session progress remains unimplemented |
| Course authoring/publication, lesson session integration, objective completion and certificates | Draft / unimplemented | No runtime routes or transactional session linkage | Requires the named BE-12/13/14 work and still-open course objectives/content decisions |

The client validates the listed current response DTOs with shared schemas; certificate verification is also parsed by the server service. Positive and invalid fixture parsing for progress, gamification, Admin access and certificate verification is covered by `server/tests/unit/frontend-contracts.test.js`; this checks DTO shape, not route authorization or database behavior. The current implemented boundary is recorded as Agreed in the BE-01 phase record; implementation evidence alone is not sign-off for future endpoints.

**Status interpretation:** “Implemented” below the current boundary means a matching runtime route/schema exists. It does not mean a team has agreed the complete endpoint contract. Forum, course authoring/progress, certificate issuance and full Admin-management rows remain draft or unimplemented; student catalog/enrollment routes are implemented with contract review pending.

Current fields and units:

- `publicUserSchema`: UUID `id`, `email`, nullable `name`, lowercase `role`, `timezone`, `targetWpm`, `dailyGoalMinutes`, `largeText`, `reducedPressure`, `xp`, `level`, `streak`, and `preferences.{themePreference,uiLocale}`. No `displayName`, `emailVerified`, token, password hash or internal auth record. Login/me add a 64-character hexadecimal `csrfToken`; profile replies do not.
- Assignment fields are `sessionId,mode,text,source,issuedAt,expiresAt,rules`. Source is `fallback`; rules capture `modePolicyVersion,pauseAllowed,eventVersion,scoringVersion,settingsVersion,targetWpm,timezone,maxKeystrokes`, plus `focusKeys` (each repeated at least three times) for practice/lesson, `durationMs` for timed/certified, `lessonGroupId` for standalone lessons, `reviewKeys` for review, and certified thresholds for certified tests. Practice text covers every currently unlocked key and weights its captured focus keys more heavily. Locked keys stay excluded until placement evidence or prerequisite mastery unlocks them. Database rows also capture the settings and engine versions. Dates are UTC ISO strings, event/active times and durations are milliseconds, target/speed are WPM and accuracy is a percentage. Draft `textSource`, `versions` and `canPause` are not wire fields.
- The path recommendation reports `weakestKey` and up to five `focusKeys` selected from that user's least-sampled unlocked key, most-overdue review key and weakest unlocked keys. The browser refreshes dashboard/path data after a saved result; a failed API refresh leaves the previous recommendation unavailable/stale and shows its error state.
- `sessionResultSchema` matches the implemented result list above, including server metrics with nullable unknown values, XP reward records, nullable problem-key average latency and `certificate:null`. No client score is accepted. Future certificate/reward variants require a coordinated schema change.
- History is `{sessions:[{id,mode,status,netWpm,rawAccuracy,completedAt}]}` with nullable metrics/completion time and a maximum of 100 rows. No agreed pagination/filter parameters. Non-completed detail returns `sessionId,status,mode,text,expiresAt`; completed detail is the official result.
- `GET /progress` returns at most 100 completed practice session summaries plus key statistics; it accepts no pagination, sort or filter parameters. `GET /gamification` returns `{xp,level,streak,dailyGoal:{goalMinutes,minutesToday,done}}`; goal values are minutes and streak is a day count. Badges and reward history are not included.
- `GET /path` includes `recommendation.{activity,reason,weakestKey?,focusKeys?}`. Focus keys are derived from that owner's unlocked evidence: least-sampled key, most-overdue review when due, then highest weakness; each selected key is repeated in practice/lesson text while every currently unlocked key appears at least once.
- `GET /admin/ping` returns `{message}` after server-side Admin role enforcement; it is only an access probe. `GET /certificates/verify/:code` returns `{code,name,issueDate,netWpm,rawAccuracy}` for a valid, non-revoked record, or `404 NOT_FOUND` for invalid, missing or revoked codes. `issueDate` is an ISO calendar date and accuracy is a percentage. The verification route is limited to 30 requests per 15 minutes. It exposes no email or keystrokes; issuance and private certificate list/PDF remain unimplemented.

Current runtime limits and mode policies below describe implemented behavior; decision 0012 records the approved BE-04 operational defaults. They do not establish production calibration for general speed/integrity limits.

| Area | Current behavior |
| --- | --- |
| Auth routes | Shared limiter: 10 requests per 15-minute window; rate-limit response is `429 RATE_LIMITED` |
| Certificate verification | 30 requests per 15-minute window; invalid, missing and revoked certificates return `404 NOT_FOUND` |
| JSON request body | Express rejects bodies over 1 MiB; malformed JSON returns `400 INVALID_REQUEST` |
| Session submit | At most 10,000 events; schema/field failures return `400 INVALID_REQUEST`; replay/integrity failures return `422 INVALID_SUBMISSION` |
| Session history / progress | At most 100 rows, newest first; no pagination, sort or filter query contract |
| Identical session submit retry | Returns the saved result; a different payload for a completed session returns `409 SESSION_CONFLICT`; no automatic client write retry |
| Session start retry | No server idempotency key; repeated explicit starts may create another assignment |

Implemented server error codes include `INVALID_REQUEST`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `INVALID_PASSWORD`, `EMAIL_REGISTERED`, `EMAIL_NOT_VERIFIED`, `ACCOUNT_INACTIVE`, `EMAIL_SAME`, `EMAIL_UNAVAILABLE`, `LAST_ADMIN`, `ACCOUNT_CHANGED`, `UNAUTHENTICATED`, `FORBIDDEN`, `CSRF_FAILED`, `ORIGIN_FORBIDDEN`, `NOT_FOUND`, `SESSION_CONFLICT`, `SESSION_UNAVAILABLE`, `INVALID_SUBMISSION`, `CONTENT_NOT_READY`, `PLACEMENT_UNAVAILABLE`, `NO_REVIEWS_DUE`, `RATE_LIMITED`, and `INTERNAL_ERROR`. This list is the current implementation surface, not a finalized exhaustive error taxonomy.

Validation and transport rules:

- Auth request objects strip extra fields; profile (including nested preferences), start and submission objects reject them. Session response schemas reject unrecognized fields; other response schemas strip them and reject missing/invalid required fields. Request schema failures stop before Fetch; the backend independently validates requests and returns `400 INVALID_REQUEST` for invalid fields, rather than the draft 422 validation convention. Invalid replay/submission semantics use 422.
- The transport validates current auth/user/session/course routes automatically and accepts explicit `requestSchema`/`responseSchema` for subsequently reviewed boundaries. Calls keep JSON-string bodies; schema-backed calls also accept plain objects. Authenticated writes require an explicit CSRF token. Unreviewed writes without a request schema are rejected. Paths are relative API paths; query strings are accepted only for the course catalog's shared query schema.
- Cookies use `credentials:include`; authenticated writes send `X-CSRF-Token`. AuthProvider remains the only auth-state owner and receives CSRF from real login/me; no JWT/CSRF persistence or duplicate token store is introduced. CSRF rejection never automatically retries a write or invents a token.
- `ApiError` exposes safe `code`, `status`, `messageKey`, `retryable`, `retryAfterMs` and `authenticationRequired`. Server message/details are never surfaced verbatim. Known statuses include 400/401/403/404/409/422/429/5xx; malformed success DTOs produce `CONTRACT_ERROR`, network failure `NETWORK_ERROR`, and cancellation remains an AbortError. Retry metadata does not authorize replaying a write. Retry-After is usable only if exposed to the browser by the server/CORS policy.
- AuthProvider retains ownership of logout/cache clearing. Transport signals protected-session rejection through `authenticationRequired`; it does not clear global auth on arbitrary late requests. Automatic protected-401 UI/session recovery and stale-account response handling require Dev 1 integration review; this task does not claim those browser flows verified.
- `available:false` explicitly produces `FEATURE_UNAVAILABLE` before any request. Unmounted/unknown resources returning 404 remain `NOT_FOUND`, not empty arrays. Only a successful valid empty response represents empty data. No automatic fixture fallback exists. Existing fixture DTOs are synthetic schema-test inputs, never real authentication evidence.
- Protected query factories now require owner ID: `queryKeys.dashboard(userId)` (likewise path/progress/gamification/sessions/adminAccess), detail uses `queryKeys.session(userId,sessionId)`, cleanup uses `queryKeys.owner(userId)`. Prefix is `['owner',userId]`; unsupported filters throw instead of colliding in cache. Auth bootstrap retains `['auth','me']`; public keys have a separate `public` prefix. Existing query/invalidation callers were migrated together; protected query functions forward TanStack's abort signal to Fetch. Routing/providers are unchanged.
- Safe interface keys live under `apiErrors.CODE` in English/Arabic dictionaries. Arabic wording is supplied for review; human wording approval and feature-page adoption of `messageKey` remain pending.

Verification evidence: `server/tests/unit/frontend-contracts.test.js` (transport/schema/cache-key tests, using explicit synthetic fixtures, plus real TanStack owner-cache removal and request cancellation), and the FE-02 real-HTTP test in `server/tests/integration/features.test.js` (real PostgreSQL test account, real login cookie, profile write/restoration, missing-CSRF rejection by the server, session submission/result, logout). The Node integration adapter retains the actual login cookie because Node Fetch has no browser cookie jar; it does not bypass authentication. All 31 unit tests and 6 integration tests passed; lint and client build passed. The existing bundle-size warning remains. Browser CORS/cookies, account-switch races, English/Arabic/appearance/viewport/accessibility and active typing presentation checks are **not yet verified**; owner/reviewer sign-off is pending.

## FE-05 typing assignment and result boundary — 22 October 2026

**Status: the existing typing controller integrates the practice contract; backend BE-04 also exposes all six session modes.** Non-practice frontend flows are not wired or browser-accepted in this FE task. Developer-fixture typing remains explicitly marked as fixture data; API failures do not silently fall back to fixture sessions.

- `POST /sessions` sends the machine value `{ "mode": "practice" }`. The validated assignment's `text` is passed unchanged to the existing typing screen's `assignedText` prop. The UI label `Adaptive Practice` is presentation text, not a wire mode. The response's `source` and captured `rules` remain validated server data; they do not rewrite the assignment text or provide client scoring authority.
- Submit places the session ID only in `/sessions/:id/submit`. The shared schema validates the strict body `{ "events": [...], "finishTimeMs": number }`. The adapter accepts the existing recorder snapshot timing name (`finishTime`) or the canonical timing name (`finishTimeMs`), then projects only those two fields. Recorder session IDs, event counts, and diagnostics are not sent; scores, expected keys and correctness claims are never part of the schema. Invalid event fields are rejected.
- The response is checked against strict assignment, detail, history and official-result schemas. Displayed official metrics/rewards come from the server result, not from the recorder or live provisional metrics.
- BE-04 adds placement, standalone key-group lesson, review, timed and certified start/submit behavior. Course enrollment identifiers and course-owned lesson completion are still not runtime session fields. Existing course examples such as `enrollmentId`/`lessonId` do not authorize adding them to this session schema.

Unit verification uses `server/tests/unit/frontend-contracts.test.js` to check the assignment mapping and exact serialized request body from an actual recorder snapshot, including exclusion of recorder metadata. The focused dashboard/session browser suite passed 12 tests with intercepted HTTP fixtures; it checks the existing session/recovery presentation but is not live-API evidence. A real-HTTP FE-02/FE-05 integration test is present in `server/tests/integration/features.test.js`, where adapter output goes through the shared schema and authenticated session endpoint. Its local run was blocked because `server/.env` has no `TEST_DATABASE_URL` and Docker is unavailable; therefore live-server FE-05 verification remains outstanding. Unit tests (52), lint, production build and the focused browser suite passed; owner/reviewer demonstration and browser acceptance remain pending.

## FE-06 / FE-10 current frontend boundaries — 22 October 2026

**Status: implementation under verification; owner/reviewer and Arabic wording review pending.** No Prisma or server endpoint changes. Real dashboard/path/practice flows use Fetch with cookies; development course cards are isolated samples.

| Boundary | Current fields / behavior | Status |
| --- | --- | --- |
| `GET /dashboard` | `user.{name,email,xp,level}`, `streak`, `dailyGoal.{goalMinutes,minutesToday,done}`, `recommendation.{activity,reason,weakestKey?}`, `recentSessions` | Existing API; runtime `dashboardResponseSchema` validates current fields |
| Recent session | `id,mode,netWpm,grossWpm,rawAccuracy,finalAccuracy,durationMs,xpEarned,completedAt` | Practice only; nullable score values stay unknown; missing required fields fail validation |
| `GET /path` | `groups`, `keys`, `recommendation` | Existing API; `pathResponseSchema` validates current groups/statistics; absent key evidence is not assumed locked |
| Practice lifecycle | Existing start/detail/submit/abandon shapes | `useTypingSession` owns assignments; `useSubmitSession` delegates frozen submission/reconciliation to the same controller |
| Reload pointer | Tab-local `{ownerId,sessionId}` | No JWT, CSRF, text or events persisted; real owned status is checked before recovery |
| Course resume | No accepted runtime fields | Development-only labelled sample; no target, mastery value or resume action; FE-07/FE-12 review required |

- Dashboard values remain server-derived; required-field failures are contract errors, not zero/empty fallbacks. A path failure does not hide the dashboard. Failed background refresh retains previously loaded data with a warning.
- The recommendation's English reason is preserved with English/LTR markup. Existing frontend labels may still describe placement/timed modes as unavailable; BE-04 now provides the backend session starts, but wiring and browser acceptance are separate frontend work. Future reason codes/parameters need backend-owner agreement.
- An explicit retry checks owned status before sending the frozen `{events,finishTimeMs}` again. Completed recovery displays the saved result and supplies no new reward notifications. No automatic write retries or replacement assignments hide uncertain writes.
- Full assignments and typing state stay in memory across presentation changes. Reload recovers a saved result, or explains lost typing progress and requires explicit abandon/restart. Failed abandonment cannot allocate another attempt.
- Start has no backend idempotency key. A lost start response may leave an orphan assignment; the UI explains the uncertainty and does not automatically retry. A future backend contract is needed to remove this limitation.
- Developer handoff comments mark unavailable modes, course contracts, reason translation and future reward-notification integration. They are deferred work, not completed feature claims.

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

This inventory includes mounted endpoints and future proposals. Current runtime contracts are described in the migration/FE-02 sections above; proposed rows are not mounted and must not be treated as available routes. Team agreement is tracked separately in the phase record below.

| Method/path (under base path) | Access | Input/output intent |
| --- | --- | --- |
| `POST /auth/register` (`/auth/signup` alias) | Public, rate-limited | Email/password → verification-needed acknowledgement |
| `POST /auth/verify-email` | Public, rate-limited | Registration email + one-time token → acknowledgement; both identify the same account |
| `POST /auth/resend-verification` | Public, rate-limited | Email → non-enumerating verification acknowledgement |
| `POST /auth/login` | Public, rate-limited | Email/password → public user DTO + cookie |
| `POST /auth/logout` | Authenticated | Revoke current session, clear cookie |
| `GET /auth/me` | Authenticated | Public user DTO including own presentation preferences |
| `POST /auth/forgot-password` | Public, rate-limited | Email → same acknowledgement whether account exists or not |
| `POST /auth/reset-password` | Public, rate-limited | Token/new password/confirmation → acknowledgement; revoke sessions |
| `PATCH /users/me` | Owner (Student or Admin) | Allowlisted profile/preferences fields → updated DTO; partial preference merge |
| `POST /users/me/password`, `POST /users/me/email` | Owner (Student or Admin) | Current password change/email change actions; see implemented request schemas above |
| `DELETE /users/me` | Owner (Student or Admin) | Implemented `{password}` confirmation → acknowledgement; removes authored forum text, retains only needed anonymous discussion structure, and protects the last active Admin |
| `POST /sessions` (`/sessions/start` alias) | Student | Implemented six-mode assignment using shared `startSessionSchema`/`sessionAssignmentSchema`; course enrollment linkage remains draft |
| `POST /sessions/:id/submit` | Owner | Events/finish time → official result |
| `POST /sessions/:id/abandon` | Owner | Mark abandoned; no rewards |
| `GET /sessions/:id` | Owner | Status or saved official result |
| `GET /sessions` | Student/owner | Current history capped at 100; pagination and filters are not implemented |
| `GET /path`, `GET /path/keyboard` | Student | Current key/group state and recommendation; due-review contract is future work |
| `GET /dashboard` | Student | Current profile summary, streak, daily goal, recommendation and recent practice sessions |
| `GET /admin/ping` | Admin | Implemented role-protected access probe only |
| `GET /progress` | Student | Current practice-session summaries and key statistics; trends/mode filters are future work |
| `GET /gamification` | Student | Current XP, level, daily goal and streak; badges are future work |
| `GET /certificates` | Owner | Certificate list |
| `GET /certificates/:id/pdf` | Owner | Downloadable PDF |
| `GET /certificates/verify/:code` | Public | Implemented public fields for valid, non-revoked certificates; full policy sign-off remains pending |
| `/forum/*` | Student; public reading TBD | Threads, posts, accepted answer and reports; exact routes TBD |
| `/admin/*` | Admin | Users, content, settings, analytics, moderation, certificates and audit; exact routes TBD |

Outside `/api/v1`: implemented `GET /health/live` and database-backed `GET /health/ready`. Placement, review and both test types are not implemented; future session modes require an agreed contract. No Google-login endpoint.

## FE-08 forum development fixture boundary

The forum routes, shared runtime schemas and public reading policy remain **Contract to agree**. FE-08 does not implement or call `/forum/*`, expose public reading, or approve a moderation policy. The current `createForumApi` boundary returns `FEATURE_UNAVAILABLE` without making a request. UI tests may inject presentation fixtures, but the API adapter itself does not provide in-memory forum data. There is no API-error-to-fixture fallback. No real forum reads or writes are available.

The following feature-local shapes support UI review only; backend/DTO owners must agree them before real integration:

- List: `items`, `page`, `totalPages`, `totalItems`, `permissions.canCreateThread`. Visible summaries include `id`, `status`, authored `title`/`author`, category code, `replyCount` and nullable `acceptedReplyId`. Draft fixture list inputs are `page`, `search`, `category` (`all` or a category code) and `answerStatus` (`all`, `accepted`, `unaccepted`). Search matches visible discussion titles/body text case-insensitively, with outer query whitespace ignored; it does not search replies or rewrite authored text. Combined criteria apply before pagination; filtered matches/counts exclude non-visible posts. Unfiltered browsing retains structural placeholders. These are fixture conventions pending real API agreement.
- Detail: the visible summary plus authored `body`, a page of `replies`, reply `page`/`totalPages`, and explicit `permissions.canReply`, `canAcceptAnswer`, `canReport`. Visible replies contain `id`, `status`, authored `author`/`body` and `permissions.canReport`. `acceptedReplyId` describes the entire thread, including other pages.
- Visibility: `visible`, `hidden`, `unavailable`. Non-visible records contain structural identity/status only, with no authored text or author identity. The renderer independently suppresses authored fields/actions on any non-visible or unknown status. Real ordinary responses must enforce omission on the server; UI suppression is not access control.
- Writes: create takes `title`, `body`, category; reply takes `threadId`, `body`; accept takes `threadId`, `replyId`; report takes `threadId`, `postId`, `reason`. Each fixture operation carries a `requestId`, retained for unchanged explicit retries. Create returns `threadId`; reply returns `threadId`/reply `page`; accept/report acknowledge `threadId`. The UI refreshes DTOs after acknowledgement rather than inventing counts, acceptance or visibility.

Fixture-only input bounds are title 180 characters, discussion/reply 5000, report reason 1000; categories are `technique`, `adaptive`, `hardware`, `general`. These are draft UI constraints, not approved server limits. Fixture owner/permission checks and replay receipts demonstrate the flows; the real server must independently enforce authentication, ownership, revocation, CSRF, validation, atomic single-answer replacement and idempotent writes. Reporting acknowledges a concern without hiding content in the browser. Permission flags are explicit UI hints; absent flags disable controls, and no Admin moderation controls are added by FE-08.

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

Current 200 response fragment (authentication cookie is set separately; `publicUserSchema` above defines all required user fields):

```json
{"user":{"id":"10000000-0000-4000-8000-000000000001","name":"Layla","role":"student","preferences":{"themePreference":"system","uiLocale":"en"}},"csrfToken":"<64-character hexadecimal token from the server>"}
```

### Start

Request to `POST /sessions`:

```json
{"mode":"practice"}
```

Proposed mode values: `placement`, `lesson`, `practice`, `review`, `timed`, `certified`. Timed mode requests `durationSeconds` from the allowed set. Certified duration comes from approved server policy; the client cannot choose certificate thresholds. Theme options, restart replacement and start-request retry behaviour must be agreed before integration.

Future draft 201 assignment proposal (not the current DTO; see FE-02 above):

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

**Certified integrity event:** `{ "seq": 6, "type": "focusLost", "t": 1900 }` records one client-observed transition from focused to unfocused after the first insert. It carries no `char`, is accepted only for certified assignments, and does not pause the clock or directly change the score. Replay counts it and breaks adjacent-key latency evidence. The event is an untrusted client report, not proof of user intent or misconduct; no focus-return event is required. The server still validates sequence and monotonic elapsed time.

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

## Course expansion — student API implemented; feature boundary remains partial

The course behavior in [SRS section 9.6](srs.md#course-proposal) / [decision 0008](decisions.md#0008) is approved. On 26 November 2026, runtime implementation was explicitly authorized for the student catalog and enrollment slice. That authorization does not settle course objectives/checkpoints, lesson completion, placement freshness, re-enrollment across versions, or initial course content. Admin authoring and course-linked session submissions remain unimplemented.

Implemented student course routes:

| Route | Access | Runtime behavior |
| --- | --- | --- |
| `GET /courses?search=&level=&topic=&status=` | Public | Searches published versions; `status=archived` can inspect archived snapshots; drafts are never returned |
| `GET /courses/:courseId` | Public | Returns a published detail or an archived snapshot; no learner data is included |
| `POST /courses/:courseId/enrollments` | Student + CSRF | Captures the current published version; duplicate requests for the same user/version return the existing enrollment |
| `GET /users/me/enrollments` (`GET /courses/my-courses` compatibility alias) | Student | Lists only the signed-in student's enrollments and derives zero/partial progress from saved lesson IDs |
| `GET /enrollments/:enrollmentId/path` | Student | Returns the owned enrollment and its captured course snapshot; cross-user IDs return 404 |

The enrollment uniqueness rule currently applies per user and course version. This is an implementation choice for retry safety, not a team-approved policy for simultaneous old/new-version enrollment. Course progress remains empty until the session integration and reviewed completion rules exist. No course content is inserted by the migration, so a fresh database correctly returns an empty catalog until reviewed content is authored and published.

| Proposed boundary | Intent |
| --- | --- |
| Existing `POST /sessions` | Optional enrollment/lesson context for a course activity; placement/review use the same lifecycle |
| Existing submit/result routes | Return saved course-progress effects alongside official result/rewards; identical retries remain safe |
| `/admin/courses/*` | Protected draft authoring, validation/preview, publish and archive; exact methods/actions TBD |

Candidate session-start fragment, **not a complete agreed payload**: `{ "mode": "lesson", "enrollmentId": "example-enrollment", "lessonId": "example-lesson" }`. The server resolves ownership, course version, eligibility, activity rules and settings. Clients cannot submit mastery/completion claims or override constraints. Preserve existing standalone session requests; agree nullability and backward compatibility before changes. Public catalog DTOs must not expose private learner data or draft content. Pagination, enrollment uniqueness, draft edit conflicts, publication retries, archival responses, eligibility errors, progress/exemption DTOs and targeted-placement request shapes remain to agree. Admin writes retain role/CSRF/audit protections.

## Remaining draft course boundaries

The student catalog/enrollment rows above are implemented from the shared runtime schemas. These behaviors are still proposals and are not implied by the student API slice:

| Proposed boundary | Intent |
| --- | --- |
| Existing `POST /sessions` | Optional enrollment/lesson context for a course activity; placement/review use the same lifecycle |
| Existing submit/result routes | Return saved course-progress effects alongside official result/rewards; identical retries remain safe |
| `/admin/courses/*` | Protected draft authoring, validation/preview, publish and archive; exact methods/actions TBD |

The same-version duplicate-enrollment rule is implemented for request retry safety, but active enrollments across successive versions remain a team decision. The enrollment uniqueness index should be reviewed by Dev 4 before treating that policy as final.

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
| Phase / contract version | BE-01 current-runtime inventory, revision 2 (2026-11-25) |
| Status | Agreed current auth/profile and practice frontend boundary; BE-04 mode start contracts and operational defaults are recorded in decision 0012. Student course API runtime shapes are implemented from candidate schemas; Dev 4 review and acceptance remain pending. |
| Scope and SYS IDs | Current auth/profile, six-mode backend session lifecycle, dashboard/path/progress/gamification, Admin ping and public certificate-verification boundaries are recorded at their documented implemented shapes; course-linked features and unrelated future endpoints remain Draft (SYS-1–64 as applicable). |
| Endpoint schemas and positive/error examples | Auth/practice and progress/gamification/Admin/certificate DTO fixtures remain in `server/tests/unit/frontend-contracts.test.js`. Student course catalog/enrollment DTOs are now runtime-bound; admin authoring, course session progress, forum and certificate issuance remain unimplemented. |
| Auth/ownership, limits and retry rules | Current route gates and runtime limits are documented above; start has no server idempotency key, history/progress are capped at 100, and same-version enrollment retries return the unique existing row. Re-enrollment across versions remains policy-pending. |
| Frontend/backend owners and reviewers | Coordination: Dev 1; assigned reviewer: Dev 4. Project owner confirms FE-35 handoff (Dev 4 / Dev 5) and applicable Dev 4 / feature-owner reviews are complete. |
| Agreement date / decision link | 2026-11-25; owner confirmation recorded in this phase record. Detailed SRS policy values still marked TBD remain deferred to their owning feature tasks. |
| Compatibility/migration plan | Move clients to `/api/v1`; keep the `/auth/signup` and `/sessions/start` aliases; replace legacy keystroke body with `{events,finishTimeMs}`. Legacy data import is separate and unapproved. |
| Verification evidence | `npm test` (54 unit tests), `npm run lint`, `npm run build`, and `git diff --check` passed for the current implementation; current auth/practice live API evidence is linked in the FE-02/FE-05 sections above. |

For a future revision, settle required/optional/null fields, time units, permission checks, error codes, pagination, duplicate/concurrent behaviour and matching mocks before marking that revision Agreed. A breaking change needs coordination and an updated decision/contract, not a silent field rename.

## Guest practice integration boundary

Approved public flows cover course exploration, guest typing and an attempt result with gross WPM and raw accuracy. No guest endpoint, identity mechanism, durable storage or guest-to-account import is specified by the Figma prototype. Keep existing authenticated assignment, submit, result and history contracts owner-scoped. A guest summary is separate from an official saved result. If server support is chosen for guest attempts, document inputs, abuse limits, lifetime and response authority before exposing it.

For a signed-in save retry, reuse the original attempt identifier and payload. Render confirmed metrics and rewards only after the authoritative response. The Figma saving transition is illustrative, not a timeout-based success condition.
