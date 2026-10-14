# React + Vite

> Historical starter-template notes; not the TypeFlow target specification or verified setup. For required Light/Dark appearance, English/Arabic interface and desktop/mobile non-typing pages, read [DESIGN.md](../DESIGN.md), the [SRS](../docs/srs.md) and [setup status](../docs/setup.md). English desktop/QWERTY typing remains the scope. The application has not been assessed during documentation work; template statements below are not project implementation evidence.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

TypeFlow uses JavaScript ES modules and `.jsx` components with Tailwind CSS. Use JavaScript/React lint rules, shared Zod runtime validation, tests and the Vite build. Exact lint configuration and commands remain unverified; follow [setup](../docs/setup.md). The frontend is this root-level `client/` folder, backend is `server/`, and shared schemas/formulas belong in `packages/shared/`. See [decision 0003](../docs/decisions/0003-javascript-client-server.md).
