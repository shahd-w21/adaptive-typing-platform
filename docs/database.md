# Database development guide

**Status: planned implementation guidance; schema, migrations and commands are not verified.** [Architecture](architecture.md) owns the conceptual data model and transaction flow. [SRS section 10.4](srs.md#104-privacy-retention-and-deletion) owns retention/deletion. This guide adds practical working rules without defining a second schema.

## Locations and access

Planned locations: `server/prisma/schema.prisma`, `server/prisma/migrations/`, `server/prisma/seed.js` and `server/prisma/content/`. Shared runtime contracts belong in `packages/shared/`, not generated database records exposed to the browser.

Use Prisma for ordinary CRUD and relationships. Use parameterised SQL where the query is clearer or needs database-specific aggregation, date bucketing or window functions. Put reporting SQL in dedicated analytics/admin query functions rather than controllers. Joins alone do not require SQL. A reviewed infrastructure query, such as a transaction lock, belongs beside the persistence operation it supports rather than being forced into analytics.

- Parameterise user values; never build SQL by concatenation. Dynamic column/sort names require an explicit allowlist, not value interpolation.
- Validate query results with Zod before constructing a public DTO.
- Decide numeric serialisation explicitly: counts may arrive as BigInt and database numerics may need conversion. Convert only within a safe range, or use an agreed string representation. Do not blindly cast large counts to a smaller integer just to make JSON work.
- Date reports must state their timezone, window boundaries and denominator; session scoring uses the captured session rules.
- User-owned reads/writes filter by the authorised owner. Administrative access is explicit and audited where required; an ID in the request is not ownership evidence.

## Transactions and concurrency

Pass the transaction client through every repository/helper participating in a submission, including raw queries. A call through the global Prisma client inside that helper would escape the transaction. Keep LLM, email and PDF calls outside it.

Recheck session status under the chosen database concurrency protection. Save the result, retry hash and applicable learning/reward records once. Protect updates from different sessions for the same student, not just duplicate submission of one session. The concrete lock/version strategy remains an implementation decision; test it with separate concurrent requests.

Completed records/settings are immutable during ordinary operation, while lifecycle transitions, retention and account deletion follow their explicit rules. Do not interpret “append-only” as permission to retain personal data forever.

## Migration workflow

1. Coordinate schema/contract changes with the designated reviewer and dependent tracks.
2. Create a new migration using the pinned Prisma version and verified setup procedure.
3. Review the generated SQL for dropped data, defaults, uniqueness, backfill needs and compatibility with current application reads/writes.
4. Test application from an empty disposable database and upgrade from a representative prior schema.
5. Commit schema and migration together, including any required data-migration/release notes.

Never rewrite a migration already applied to shared environments; add a corrective migration. Do not use `db push` on shared data. Migration drift is a diagnosis task, not an automatic reason to reset a database. Production release/restore steps remain to be verified in [setup](setup.md).

## Seeds and test isolation

Use stable IDs or natural keys and upsert/reconciliation so repeated development seeds do not duplicate content. Document whether an existing record is preserved or updated. Seed execution must not reset user progress, roles or passwords unexpectedly. Do not automatically provision known demo credentials in production.

Keep synthetic fixtures representative: verified/unverified accounts, different key evidence, due reviews and empty history. See [content guide](content-guide.md) for validation before activating curriculum content.

Tests must positively verify their dedicated database identity before any destructive setup. Use isolated fixtures and include rollback, duplicate/concurrent submission, uniqueness and retention/deletion tests. Actual connection values, commands and test reset behaviour must be reviewed during implementation; this guide authorises no database operation.
