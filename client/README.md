# TypeFlow frontend

React, JavaScript/JSX and Tailwind CSS. Install and run from the repository root using the [quick start](../README.md#quick-start), not a separate client install. For everyday development, start Docker Desktop, then run `npm run db:up` and `npm run dev` from the root. The website uses http://localhost:5173.

Follow the [frontend structure](../docs/architecture.md#3-frontend-layout), [API contract](../docs/api-contract.md), [design brief](../DESIGN.md) and [team workflow](../docs/contributing.md). Existing screens, translations, preferences and typing components are preserved. New scaffold files contain only `Coming soon` comments: they have no exports, API connections or routes. Implement and review them before importing them.

Use `src/index.css` for the Tailwind entry point and shared theme/document styles. Reuse existing screens, including the keyboard map in `features/learning-path/LearningPath.jsx`; avoid duplicate views and browser copies of server scoring/adaptive rules. Exact course contracts remain to agree before integration.

From the root, `npm run lint --workspace=client` checks the frontend and `npm run build --workspace=client` builds it. Browser tests are not configured; `tests/e2e/` reserves their future location. A successful build does not verify backend integration or placeholder features.
