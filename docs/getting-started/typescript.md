# TypeScript Setup

simplix-react is built with TypeScript and leverages Zod's type inference to provide end-to-end type safety. This guide covers the recommended configuration for optimal developer experience.

## Recommended tsconfig.json

The following configuration is recommended for projects using simplix-react:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Settings Explained

| Setting | Value | Why |
| --- | --- | --- |
| `target` | `ES2022` | Enables modern features like `structuredClone`, top-level `await`, and `Array.at()`. |
| `module` | `ESNext` | Required for ESM-only packages used by simplix-react. |
| `moduleResolution` | `bundler` | Matches how bundlers (Vite, webpack, esbuild) resolve modules. Supports `exports` field in package.json. |
| `strict` | `true` | Enables all strict type-checking options. Required for accurate Zod type inference. |
| `isolatedModules` | `true` | Ensures compatibility with single-file transpilers (esbuild, SWC). |
| `verbatimModuleSyntax` | `true` | Enforces explicit `type` keyword on type-only imports, preventing runtime import errors. |

## Strict Mode

simplix-react requires `"strict": true` for accurate type inference. The individual flags enabled by strict mode are:

- `strictNullChecks` — Prevents `null`/`undefined` from being assigned to non-nullable types
- `strictFunctionTypes` — Enforces correct function parameter types
- `strictBindCallApply` — Type-checks `bind`, `call`, and `apply`
- `noImplicitAny` — Disallows implicit `any` types
- `noImplicitThis` — Disallows `this` with an implicit `any` type

Without strict mode, Zod's `z.infer<>` may produce overly wide types (e.g., `string | undefined` where `string` is expected), leading to false positives and missed errors.

## Path Aliases

Path aliases simplify imports in larger projects. Configure them in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Then use clean imports throughout your code:

```ts
// Without aliases
import { projectApi } from "../../../contracts/project";

// With aliases
import { projectApi } from "@/contracts/project";
```

※ **Bundler configuration required** — Path aliases in `tsconfig.json` only affect TypeScript's type checker. Your bundler must also resolve them:

**Vite** (`vite.config.ts`):

```ts
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## Type Inference with Zod

simplix-react uses `z.infer<>` to derive TypeScript types directly from Zod schemas. You never need to write separate type definitions — the contract schemas are the types.

### Extracting Types from Schemas

```ts
import { z } from "zod";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

// Derive the TypeScript type from the schema
type Task = z.infer<typeof taskSchema>;
// Result: { id: string; title: string; status: string; createdAt: string }
```

### Types Flow Through the Pipeline

When you define a contract, the types propagate automatically:

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});

const hooks = deriveHooks(projectApi);

// All fully typed — no manual annotations needed:
// hooks.task.useList()    → UseQueryResult<{ id: string; title: string }[]>
// hooks.task.useGet(id)   → UseQueryResult<{ id: string; title: string }>
// hooks.task.useCreate()  → UseMutationResult<..., { title: string }>
// hooks.task.useUpdate()  → UseMutationResult<..., { id: string; dto: { title?: string } }>
```

### Working with Inferred Types

Export inferred types alongside your contract for use in components and utilities:

```ts
// src/contracts/project.ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});

const taskCreateSchema = z.object({
  title: z.string(),
  status: z.string(),
});

const taskUpdateSchema = z.object({
  title: z.string().optional(),
  status: z.string().optional(),
});

export const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: taskSchema,
      createSchema: taskCreateSchema,
      updateSchema: taskUpdateSchema,
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// Export inferred types for use in components
export type Task = z.infer<typeof taskSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
```

Then use them in your components:

```tsx
import type { Task } from "@/contracts/project";

function TaskCard({ task }: { task: Task }) {
  return (
    <div>
      <h3>{task.title}</h3>
      <span>{task.status}</span>
    </div>
  );
}
```

## IDE Setup Tips

### VS Code

Install the following extensions for the best experience:

- **TypeScript and JavaScript Language Features** — Built-in, ensure it is enabled
- **Zod Intellisense** — Provides autocomplete for Zod schema methods
- **ESLint** — Integrates with the project's lint rules

Recommended workspace settings (`.vscode/settings.json`):

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Import Organization

Use `verbatimModuleSyntax` (already included in the recommended tsconfig) to enforce explicit type-only imports:

```ts
// Correct — type imports are explicit
import type { Task } from "@/contracts/project";
import { projectApi } from "@/contracts/project";

// Error with verbatimModuleSyntax — type should use 'import type'
import { Task, projectApi } from "@/contracts/project";
```

This prevents types from being included in the runtime bundle and makes the distinction between value and type imports clear.

## Next Steps

- [Overview](./overview.md) — Understand the framework architecture
- [Quick Start](./quick-start.md) — Build your first feature with simplix-react
