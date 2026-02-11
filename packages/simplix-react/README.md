# simplix-react

[![npm version](https://img.shields.io/npm/v/simplix-react.svg)](https://www.npmjs.com/package/simplix-react)
[![license](https://img.shields.io/npm/l/simplix-react.svg)](https://github.com/simplix-react/simplix-react/blob/main/LICENSE)

Meta package that installs all `@simplix-react/*` packages in one dependency.

## Installation

```bash
pnpm add simplix-react
```

### pnpm Configuration

pnpm uses strict dependency resolution. To import from `@simplix-react/*` sub-packages, add this to your `.npmrc`:

```ini
public-hoist-pattern[]=@simplix-react/*
```

> Projects created with `simplix init` include this configuration automatically.

This single install provides:

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/form` | TanStack Form hooks derived from contracts |
| `@simplix-react/auth` | Authentication middleware (Bearer, API Key, OAuth2) |
| `@simplix-react/mock` | MSW handlers + PGlite repositories |
| `@simplix-react/i18n` | i18next-based internationalization |
| `@simplix-react/cli` | Project scaffolding and validation CLI |
| `@simplix-react/testing` | Test utilities (mock clients, query wrappers) |

## Usage

Import directly from individual packages:

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
import { deriveFormHooks } from "@simplix-react/form";
import { createAuth, bearerScheme } from "@simplix-react/auth";
import { deriveMockHandlers } from "@simplix-react/mock";
import { I18nextAdapter } from "@simplix-react/i18n";
```

## Selective Installation

If you only need specific packages, install them individually:

```bash
pnpm add @simplix-react/contract @simplix-react/react
```

## Documentation

- [Getting Started](https://github.com/simplix-react/simplix-react/blob/main/docs/getting-started/overview.md)
- [API Reference](https://github.com/simplix-react/simplix-react/tree/main/docs/api)

## License

MIT
