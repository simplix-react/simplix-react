# Installation

## Prerequisites

Before installing simplix-react, ensure you have the following:

| Requirement | Version | Check Command |
| --- | --- | --- |
| Node.js | >= 18.0.0 | `node --version` |
| pnpm | >= 9.0.0 | `pnpm --version` |

If you do not have pnpm installed:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Installing Packages

### All-in-One (Recommended)

Install the meta package to get all `@simplix-react/*` packages in a single dependency:

```bash
pnpm add simplix-react
```

This includes contract, react, form, auth, mock, i18n, cli, and testing packages. Import directly from individual packages:

```ts
import { defineApi } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
```

#### pnpm Hoist Configuration

pnpm uses strict dependency resolution — transitive dependencies are not automatically accessible. When using the `simplix-react` meta package, you must configure `.npmrc` to hoist `@simplix-react/*` packages:

```ini
# .npmrc
public-hoist-pattern[]=@simplix-react/*
```

This allows your code to import from `@simplix-react/contract`, `@simplix-react/react`, etc. even though only `simplix-react` is declared in `package.json`.

> **Note:** Projects created with `simplix init` include this `.npmrc` automatically.

### Selective Installation

Alternatively, install only the packages you need:

#### Core Packages

The contract and React hooks packages are the foundation of every simplix-react project:

```bash
pnpm add @simplix-react/contract @simplix-react/react
```

### Mock Data Layer (Optional)

For frontend-first development with an in-browser mock backend:

```bash
pnpm add -D @simplix-react/mock
```

### Internationalization (Optional)

For multi-language support:

```bash
pnpm add @simplix-react/i18n
```

### Testing Utilities (Optional)

For testing simplix-react applications:

```bash
pnpm add -D @simplix-react/testing
```

### CLI (Optional)

For project scaffolding and validation:

```bash
pnpm add -D @simplix-react/cli
```

## Peer Dependencies

Each package requires specific peer dependencies. Install them alongside the simplix-react packages.

### @simplix-react/contract

| Peer Dependency | Version |
| --- | --- |
| `zod` | >= 4.0.0 |

```bash
pnpm add zod
```

### @simplix-react/react

| Peer Dependency | Version |
| --- | --- |
| `@simplix-react/contract` | (installed above) |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |
| `zod` | >= 4.0.0 |

```bash
pnpm add @tanstack/react-query react zod
```

### @simplix-react/mock

| Peer Dependency | Version | Required |
| --- | --- | --- |
| `@simplix-react/contract` | (installed above) | Yes |
| `msw` | >= 2.0.0 | Optional |
| `@electric-sql/pglite` | >= 0.2.0 | Optional |
| `zod` | >= 4.0.0 | Yes |

```bash
pnpm add -D msw @electric-sql/pglite
```

### @simplix-react/i18n

| Peer Dependency | Version | Required |
| --- | --- | --- |
| `i18next` | >= 25.0.0 | Optional |
| `react` | >= 18.0.0 | Optional |
| `react-i18next` | >= 16.0.0 | Optional |

```bash
pnpm add i18next react-i18next
```

### @simplix-react/testing

| Peer Dependency | Version |
| --- | --- |
| `@simplix-react/contract` | (installed above) |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |

No additional peer dependencies beyond what `@simplix-react/react` already requires.

## All-In-One Installation

To install everything at once for a full-featured setup:

```bash
# Runtime dependencies
pnpm add @simplix-react/contract @simplix-react/react @simplix-react/i18n \
  zod @tanstack/react-query react

# Dev dependencies
pnpm add -D @simplix-react/mock @simplix-react/testing @simplix-react/cli \
  msw @electric-sql/pglite
```

## Using the CLI for Scaffolding

The CLI provides project scaffolding to get started quickly:

```bash
npx @simplix-react/cli init
```

This will prompt you for a project name and set up the recommended directory structure with all necessary configuration files.

## Verify Installation

After installation, verify everything is working by running a quick type check:

```bash
npx tsc --noEmit
```

If there are no errors, you are ready to define your first contract.

## Next Steps

- [Quick Start](./quick-start.md) — Build your first contract-driven feature in 5 minutes
- [TypeScript Setup](./typescript.md) — Configure TypeScript for optimal type inference
