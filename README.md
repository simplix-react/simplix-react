# simplix-react

Package-first React framework that auto-generates reusable domain packages from OpenAPI specs.

## What is simplix-react?

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
| [contract](./packages/contract) | `@simplix-react/contract` | Define type-safe API contracts with Zod schemas |
| [react](./packages/react) | `@simplix-react/react` | React Query hooks derived from contracts |
| [mock](./packages/mock) | `@simplix-react/mock` | Auto-generated MSW handlers and PGlite repositories |
| [i18n](./packages/i18n) | `@simplix-react/i18n` | Internationalization framework with i18next adapter |
| [testing](./packages/testing) | `@simplix-react/testing` | Testing utilities for simplix-react applications |
| [cli](./packages/cli) | `@simplix-react/cli` | CLI for scaffolding and validating projects |

## Quick Start

### 1. Install

```bash
pnpm add @simplix-react/contract @simplix-react/react
pnpm add -D zod @tanstack/react-query
```

### 2. Define a contract

```ts
import { z } from "zod";
import { defineApi } from "@simplix-react/contract";

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

- [Contract API](./docs/contract.md) -- Defining entities and operations
- [React Hooks](./docs/react.md) -- Using derived hooks
- [Mocking](./docs/mock.md) -- Setting up MSW handlers
- [i18n](./docs/i18n.md) -- Internationalization setup

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, coding standards, and how to submit changes.

## License

MIT
