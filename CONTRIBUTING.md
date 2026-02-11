# Contributing to simplix-react

Thank you for your interest in contributing to simplix-react. This guide covers the development workflow, coding standards, and submission process.

## Prerequisites

- **Node.js** >= 20
- **pnpm** 10.x
- **TypeScript** 5.9+

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/simplix-react/simplix-react.git
cd simplix-react
pnpm install
```

### 2. Build all packages

```bash
pnpm build
```

### 3. Run checks

```bash
pnpm typecheck   # TypeScript type checking
pnpm lint         # ESLint
pnpm test         # Run test suites
```

## Project Structure

```
simplix-react/
├── packages/
│   ├── contract/     # @simplix-react/contract
│   ├── react/        # @simplix-react/react
│   ├── mock/         # @simplix-react/mock
│   ├── i18n/         # @simplix-react/i18n
│   ├── testing/      # @simplix-react/testing
│   ├── cli/          # @simplix-react/cli
│   ├── config-eslint/
│   └── config-typescript/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Development Workflow

### Running a single package

Use Turborepo filters to target a specific package:

```bash
pnpm build --filter @simplix-react/contract
pnpm test --filter @simplix-react/react
```

### Watch mode

```bash
pnpm dev
```

This starts all packages in development/watch mode concurrently.

## Coding Standards

### File naming

Use **kebab-case** for all file names:

```
define-api.ts       ✔
defineApi.ts        ✖
DefineApi.ts        ✖
```

### TypeScript

- Strict mode is enabled across all packages.
- Use explicit return types for exported functions.
- Prefer `interface` over `type` for object shapes.

### No backward compatibility code

This is a greenfield project. When refactoring:

- Delete old code completely.
- Never add `@deprecated` annotations -- just remove the code.
- No re-export shims or compatibility layers.

### No re-export files

Do not create files whose sole purpose is re-exporting from another location:

```ts
// ✖ FORBIDDEN
export { Foo, Bar } from "../source";

// ✔ Import directly from the source
import { Foo, Bar } from "../source";
```

**Exception:** `index.ts` files that consolidate exports from within the same directory are allowed.

### Shared patterns

If the same pattern appears in 2 or more files, extract it into a shared location and refactor all usages.

## Submitting Changes

### 1. Create a branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make your changes

Follow the coding standards above. After any code modification, verify:

```bash
pnpm typecheck    # Fix ALL type errors
pnpm lint         # Fix ALL errors and warnings
pnpm build        # Verify build succeeds for affected packages
pnpm test         # Ensure tests pass
```

### 3. Commit

Write clear, concise commit messages:

```
feat(contract): add filter schema support for entities
fix(react): resolve stale query key in useList
```

### 4. Open a pull request

- Provide a summary of changes and the motivation behind them.
- Reference any related issues.
- Ensure all CI checks pass.

## Reporting Issues

When filing an issue, include:

- A clear description of the problem or feature request.
- Steps to reproduce (for bugs).
- Expected vs. actual behavior.
- Package name and version affected.

## Code of Conduct

Be respectful, constructive, and inclusive. We are committed to providing a welcoming environment for everyone.
