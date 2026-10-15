# Security and privacy guide

**Status: implementation/review checklist, not a completed security assessment.** The [SRS](srs.md) is authoritative. Account lifecycle and permission guidance are included below.

## Trust boundaries

| Input/boundary | Required treatment |
| --- | --- |
| Browser requests | Validate schema/size, authenticate, check ownership and role |
| Typing events | Replay against stored assignment; ignore supplied scores/correctness |
| Duplicate/concurrent requests | Database-enforced result/reward uniqueness and lossless state updates |
| LLM output | Untrusted text; validate content and constraints before serving |
| Forum content | Render as safe text or sanitise an explicitly allowed format; never inject arbitrary HTML |
| SQL/analytics | Parameterised queries; no interpolation of user values into SQL |
| Public certificate endpoint | Allowlisted public fields only; unguessable code is not a licence to expose private data |
| Logs/errors | Omit passwords, tokens, cookies, database credentials and raw keystroke bodies |
| Presentation preferences/dictionaries | Validate owner-only enum updates and merge partial fields; map supported UI locales to bundled dictionaries, never arbitrary paths/HTML; visitor storage contains no auth or personal records |

## Review checklist

- [ ] Cookie authentication includes CSRF protection, allowed-origin checks and effective revocation.
- [ ] Authentication, generation and abuse-prone endpoints have bounded input and rate limits.
- [ ] CORS grants credentials only to intended origins; production HTTPS and cookie policy are verified.
- [ ] Submission checks distinguish ordinary typing errors from an invalid event stream.
- [ ] Transactions handle retries and concurrent sessions; network integrations remain outside them.
- [ ] Secrets remain server-side and outside version control/client bundles.
- [ ] Admin changes and certificate revocations are audited with minimal metadata.
- [ ] Public DTOs omit internal records, token hashes and private learning data.
- [ ] Production mocks, fake-user headers and test credentials are disabled.
- [ ] Light/Dark, English/Arabic and desktop/mobile variants preserve ownership, safe error wording and privacy; mixed-direction user content stays escaped/isolated and is never injected as translated HTML.

## Privacy and operations

Capture only exercise input. Apply the SRS's 30-day default raw-log retention with restart catch-up. Delete account-linked personal data, generated PDFs and cached private artifacts according to SRS section 10.4. Preserve retry hashes only as permitted by the retained-result policy; remove them with deleted results.

Agree audit/operational/backup retention before production. Verify a backup restore and document how deletion applies when backups expire or are restored. Do not call records anonymous merely because a name was removed if they remain linkable to a person.

For suspected exposure, notify the team's designated owner privately, restrict access, rotate affected secrets and record a sanitised incident note. Incident owner/channel: TBD. Do not publish credentials or exploit details in a public issue.

Certificates are unproctored. Plausible forged client logs remain possible; do not market integrity heuristics as identity verification or proof of human typing.

## Committed or disclosed secrets

Treat an exposed credential as compromised even if its file/commit is later removed. Notify the designated owner privately and revoke/rotate the affected credential through the provider's controls. For a signing-key compromise, address active session invalidation as part of recovery. Replace stored examples with fake values and check CI output, artifacts and screenshots for further exposure. Coordinate any repository-history cleanup with teammates; deleting history alone does not revoke a credential.

Before release, review dependency/security scan findings with their affected versions, reachability and remediation. Record exceptions with an owner; do not automatically run broad dependency upgrades or claim that a clean scan proves the application secure.

## Authentication and authorisation

**Status: required behaviour and implementation checklist; no implementation verified.** Source: SRS SYS-1–9 and SYS-48–49. Route examples live in the [API contract](api-contract.md); cross-cutting protections live in [security](security.md).

### Account lifecycle

1. Public registration validates email/password and always creates a Student. Ignore submitted roles.
2. Store a bcrypt password hash and a hashed, one-time, expiring email-verification token. Support rate-limited resend.
3. Login requires verified email and an active account. Return a public user DTO and set an httpOnly authentication cookie; never return the token as browser application state.
4. Authenticate every protected request, checking JWT validity, server-side revocation, active account, role and resource ownership.
5. Logout revokes the current session and clears its cookie with matching scope attributes.
6. Reset requests return the same public response for existing and unknown emails. A valid single-use reset updates the password and revokes all sessions.
7. Deactivation and deletion revoke all sessions. Recheck account/session state on subsequent requests; clearing a browser cookie alone is insufficient.

### Authorisation boundaries

Students access their own sessions, statistics and certificates. Admin routes require the Admin role server-side and audit material actions. Public verification returns only approved certificate fields. Frontend guards improve navigation but cannot grant access. Protect creation of additional admins and prevent removing the last active admin.

Students and Admins can read/update their own appearance and English/Arabic interface preferences through the draft account contract, with active-account/ownership/CSRF checks. Visitors store only allowlisted local appearance/locale values and cannot update an account. At login, use confirmed account preferences; on logout discard account-scoped preference cache and resolve visitor choice/default. Localisation retains generic reset/resend responses and safe error meanings in both languages; theme, RTL and mobile navigation never change authorisation. SRS section 10.5 owns defaults/persistence rules.

### Route access and review

The following matrix summarises existing requirements; it grants no additional administrative access to private learner data.

| Action | Guest | Student | Admin |
| --- | --- | --- | --- |
| Public certificate verification | Yes, allowlisted fields | Same public view | Same public view |
| Own account appearance/language preferences | Local visitor values only | Own account | Own account |
| Placement/practice/tests and learner history | No | Own assignments/data | No implicit learner access |
| Accept a forum answer | No | Own thread only | No additional privilege specified |
| Manage users/content/settings and moderate posts | No | No | Explicit protected admin actions |

Public forum reading and any additional admin learner-data views remain subject to their explicit contract/scope decision.

For each new route, review params/query/body schemas, authentication, role, ownership, CSRF for state changes, rate/size limits, safe response fields and documented errors. Test unauthenticated requests, the wrong role, another user's resource and the successful authorised case. A route being hidden by the UI is not an authorisation test.

### Decide before implementation

- Revocation design: server-side session records or equivalent effective strategy; JWT claims and lookup rules.
- Password policy, bcrypt cost, token/session lifetimes and resend throttles.
- Normalised-email rules and handling of duplicate/unverified accounts.
- Cookie name/path/domain/SameSite settings, deployment origins and concrete CSRF mechanism.
- First-admin provisioning and credential handoff without committed credentials.

httpOnly reduces direct token theft through JavaScript reads; it does not eliminate XSS or CSRF. Apply HTTPS/Secure in production, an explicit cookie policy, origin validation and the chosen CSRF protection.

### Acceptance evidence

Verify unverified/deactivated login rejection, expiration/reuse of email tokens, identical reset-request responses, logout/reset revocation, ignored registration roles, student-to-admin denial, cross-user resource denial and CSRF rejection. Include account deletion and the last-admin safeguard. Record evidence in [testing](testing.md).
