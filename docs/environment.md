# Environment and configuration

**Status: proposed variable names.** Confirm against validated runtime schemas during implementation; do not infer that `.env` files already exist. See [setup](setup.md).

| Scope | Proposed names | Notes |
| --- | --- | --- |
| API runtime | `NODE_ENV`, `PORT`, `CLIENT_URL` | Exact origin policy follows chosen deployment |
| Database | `DATABASE_URL`, `TEST_DATABASE_URL` | Sensitive; tests must verify a dedicated test database |
| Authentication | `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing secret is server-only; revocation is also required |
| Cookies | `COOKIE_SECURE`, `COOKIE_SAMESITE` | Production policy depends on topology; do not weaken it to fix setup |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Local Mailpit and production SMTP use separate settings |
| LLM | `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_TIMEOUT_MS` | Server-only; define explicit fallback-only development mode |
| Browser | `VITE_API_URL`, optional `VITE_USE_MOCKS` | Public values; mocks must not be enabled in production |

There are no Google-auth variables in the baseline. Exact defaults, required/optional flags, lifetimes, ports, job configuration and fallback-mode switch remain TBD. Document them in the runtime schema and safe `.env.example` when implemented.

## Rules

- Commit fake examples, never credentials, real connection strings or private tokens. Never paste secrets into issues, AI prompts, screenshots or documentation.
- Keep development, test and production databases and credentials separate. CI supplies its own test connection.
- Anything bundled into the browser, including `VITE_` variables, is public. Browser configuration must not contain LLM, SMTP, database or JWT secrets.
- Validate configuration on startup with useful errors that identify the missing name without disclosing the value.
- Give each deployed secret an owner and rotation procedure; record references, not secret values.
- Learning thresholds, reward policies and content rules belong in versioned business settings. Do not override captured session rules with an untracked environment change.
- Light/Dark/System and English/Arabic interface choices are account/visitor presentation preferences, not environment variables or content-theme settings. Bundled dictionaries contain no secrets; locale never selects arbitrary paths or a different typing language. See SRS section 10.5 and [DESIGN.md](../DESIGN.md).

## Deployment worksheet

Frontend/API origins: TBD. Database/SMTP/LLM provider: TBD. Secret storage and rotation owner: TBD. Backup retention: TBD. Job schedule and catch-up policy: TBD. Document local development exceptions separately from production requirements.
