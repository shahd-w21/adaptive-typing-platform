# Security and privacy guide

**Status: implementation/review checklist, not a completed security assessment.** The [SRS](srs.md) is authoritative; authentication details are in [auth](auth.md).

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
