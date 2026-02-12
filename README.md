<p align="center">
  <img src="docs/assets/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# SimpliX React

[![npm version](https://img.shields.io/npm/v/simplix-react.svg)](https://www.npmjs.com/package/simplix-react)
[![license](https://img.shields.io/npm/l/simplix-react.svg)](https://github.com/simplix-react/simplix-react/blob/main/LICENSE)

Package-first React framework that auto-generates reusable domain packages from OpenAPI specs.

## What is SimpliX React?

simplix-react is a package-first React framework that auto-generates reusable domain packages from OpenAPI specs. Define your API surface once and derive type-safe clients, React Query hooks, mock servers, and i18n bundles automatically — from contract to component.

## Key Features

- **Contract-Driven** -- Define entities and operations once with Zod schemas; everything else is derived.
- **Type-Safe End-to-End** -- Full TypeScript inference from API contract through React hooks to UI components.
- **Auto-Generated Hooks** -- `deriveHooks` produces `useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, and `useInfiniteList` per entity.
- **Mock-First Development** -- Auto-generate MSW handlers and PGlite repositories from the same contract.
- **Monorepo Architecture** -- Modular packages that can be adopted incrementally.

## Packages

| Package | npm | Description |
| --- | --- | --- |
| [contract](./packages/contract) | [![npm](https://img.shields.io/npm/v/@simplix-react/contract.svg)](https://www.npmjs.com/package/@simplix-react/contract) | Type-safe API contracts with Zod schemas |
| [react](./packages/react) | [![npm](https://img.shields.io/npm/v/@simplix-react/react.svg)](https://www.npmjs.com/package/@simplix-react/react) | React Query hooks derived from contracts |
| [form](./packages/form) | [![npm](https://img.shields.io/npm/v/@simplix-react/form.svg)](https://www.npmjs.com/package/@simplix-react/form) | TanStack Form hooks derived from contracts |
| [auth](./packages/auth) | [![npm](https://img.shields.io/npm/v/@simplix-react/auth.svg)](https://www.npmjs.com/package/@simplix-react/auth) | Authentication middleware (Bearer, API Key, OAuth2) |
| [mock](./packages/mock) | [![npm](https://img.shields.io/npm/v/@simplix-react/mock.svg)](https://www.npmjs.com/package/@simplix-react/mock) | MSW handlers + PGlite repositories |
| [i18n](./packages/i18n) | [![npm](https://img.shields.io/npm/v/@simplix-react/i18n.svg)](https://www.npmjs.com/package/@simplix-react/i18n) | i18next-based internationalization |
| [testing](./packages/testing) | [![npm](https://img.shields.io/npm/v/@simplix-react/testing.svg)](https://www.npmjs.com/package/@simplix-react/testing) | Testing utilities |
| [cli](./packages/cli) | [![npm](https://img.shields.io/npm/v/@simplix-react/cli.svg)](https://www.npmjs.com/package/@simplix-react/cli) | Project scaffolding and validation CLI |

## Quick Start

### 1. Install

Install all packages at once:

```bash
pnpm add simplix-react
pnpm add zod @tanstack/react-query
```

When using pnpm, add this to your `.npmrc` so transitive `@simplix-react/*` packages are resolvable:

```ini
public-hoist-pattern[]=@simplix-react/*
```

Or install only the packages you need:

```bash
pnpm add @simplix-react/contract @simplix-react/react
pnpm add zod @tanstack/react-query
```

### 2. Define a contract

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["active", "archived"]),
});

const api = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    project: {
      path: "/projects",
      schema: projectSchema,
      createSchema: projectSchema.omit({ id: true }),
      updateSchema: projectSchema.partial().omit({ id: true }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

### 3. Derive hooks

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(api);
```

### 4. Use in a component

```tsx
function ProjectList() {
  const { data: projects, isLoading } = hooks.project.useList();
  const { mutate: createProject } = hooks.project.useCreate();

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {projects?.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

## Documentation

Detailed guides are available in the [docs/](./docs/) directory:

### Getting Started

- [Overview](./docs/getting-started/overview.md) -- Framework architecture and core philosophy
- [Installation](./docs/getting-started/installation.md) -- Package installation and project setup
- [Quick Start](./docs/getting-started/quick-start.md) -- Build your first feature in 5 minutes
- [TypeScript](./docs/getting-started/typescript.md) -- Recommended tsconfig and type inference

### Core Concepts

- [API Contracts](./docs/core-concepts/api-contracts.md) -- Defining entities and operations
- [Schema Derivation](./docs/core-concepts/schema-derivation.md) -- The five-stage derivation pipeline
- [Authentication](./docs/core-concepts/authentication.md) -- Auth architecture and strategy pattern
- [Cache Invalidation](./docs/core-concepts/cache-invalidation.md) -- Automatic query invalidation
- [Mock Data Layer](./docs/core-concepts/mock-data-layer.md) -- MSW + PGlite architecture

### Guides

- [Defining Entities](./docs/guides/defining-entities.md) -- Type-safe CRUD entities with Zod
- [Authentication](./docs/guides/authentication.md) -- Bearer, API Key, OAuth2, and custom auth
- [Custom Fetch](./docs/guides/custom-fetch.md) -- HTTP layer customization
- [Custom Operations](./docs/guides/custom-operations.md) -- Non-CRUD endpoints
- [Mock Handlers](./docs/guides/mock-handlers.md) -- Setting up MSW handlers
- [Form Hooks](./docs/guides/form-hooks.md) -- TanStack Form integration
- [Internationalization](./docs/guides/internationalization.md) -- Multi-language setup
- [Parent-Child Relationships](./docs/guides/parent-child.md) -- Nested entity hierarchies
- [Testing with Mocks](./docs/guides/testing-with-mocks.md) -- Vitest and MSW integration
- [CLI Usage](./docs/guides/cli-usage.md) -- Project scaffolding and validation

### Tutorials

- [Project App](./docs/tutorials/project-app.md) -- Build a project management app from scratch
- [Auth Protected App](./docs/tutorials/auth-protected-app.md) -- Login, logout, token refresh, and route guards
- [Full-Stack Mock](./docs/tutorials/full-stack-mock.md) -- Complete frontend with in-browser PGlite
- [Petstore OpenAPI](./docs/tutorials/petstore-openapi.md) -- Generate domain packages from the Swagger Petstore spec

### API Reference

- [API Documentation](./docs/api/README.md) -- TypeDoc-generated API reference

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, coding standards, and how to submit changes.

## License

MIT
