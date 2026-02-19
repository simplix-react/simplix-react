# Build a Full-Stack Mock Development Environment

> After completing this tutorial, you will have a fully working frontend application backed by an in-memory mock store and MSW service worker — no backend server required.

## Prerequisites

- Node.js 18+
- pnpm installed globally
- Basic knowledge of React, TypeScript, and TanStack Query
- A Vite-based React project (or follow Step 1 below)

## Step 1: Set Up Dependencies

Create a new project and install all three simplix-react packages.

```bash
pnpm create vite mock-demo --template react-ts
cd mock-demo
pnpm add @simplix-react/contract @simplix-react/react @simplix-react/mock @tanstack/react-query zod
pnpm add -D @types/react @types/react-dom
```

Initialize the MSW service worker in your public directory:

```bash
pnpx msw init public/ --save
```

Verify the `mockServiceWorker.js` file was created:

```bash
ls public/mockServiceWorker.js
```

**Expected result:** The file `public/mockServiceWorker.js` exists. All packages are installed.

## Step 2: Define the Contract

Create the API contract with project and task entities. The task entity uses `parent` to nest under projects.

Create `src/contract.ts`:

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "archived"]).default("active"),
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createTaskSchema = z.object({
  title: z.string(),
  completed: z.boolean().default(false),
});

const updateTaskSchema = z.object({
  title: z.string().optional(),
  completed: z.boolean().optional(),
});

export const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    project: {
      path: "/projects",
      schema: projectSchema,
      createSchema: createProjectSchema,
      updateSchema: updateProjectSchema,
    },
    task: {
      path: "/tasks",
      schema: taskSchema,
      createSchema: createTaskSchema,
      updateSchema: updateTaskSchema,
      parent: {
        param: "projectId",
        path: "/projects",
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

**Expected result:** The file compiles without errors. `projectApi.config` contains both entity definitions.

## Step 3: Derive Mock Handlers

Generate MSW handlers from the contract using `deriveMockHandlers`.

Create `src/mock/handlers.ts`:

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "../contract";

export const handlers = deriveMockHandlers(projectApi.config, {
  project: {
    defaultSort: "createdAt:desc",
  },
  task: {
    defaultSort: "createdAt:desc",
  },
});
```

This single call generates 10 handlers:

| Entity  | Method | Path                                       |
| ------- | ------ | ------------------------------------------ |
| project | GET    | `/api/v1/projects`                         |
| project | GET    | `/api/v1/projects/:id`                     |
| project | POST   | `/api/v1/projects`                         |
| project | PATCH  | `/api/v1/projects/:id`                     |
| project | DELETE | `/api/v1/projects/:id`                     |
| task    | GET    | `/api/v1/projects/:projectId/tasks`        |
| task    | GET    | `/api/v1/tasks/:id`                        |
| task    | POST   | `/api/v1/projects/:projectId/tasks`        |
| task    | PATCH  | `/api/v1/tasks/:id`                        |
| task    | DELETE | `/api/v1/tasks/:id`                        |

Key points:

- No `tableName` is needed — the store name is derived automatically as `{domain}_{snake_case_entity}` (e.g. `project_project`, `project_task`)
- `defaultSort` uses `"field:direction"` format with camelCase field names

**Expected result:** `handlers` is an array of MSW `HttpHandler` instances. Each handler reads from and writes to the in-memory store.

## Step 4: Start the MSW Worker

Use `setupMockWorker` to bootstrap the in-memory store and MSW together.

Create `src/mock/setup.ts`:

```ts
import { setupMockWorker } from "@simplix-react/mock";
import { handlers } from "./handlers";

export async function startMockEnvironment(): Promise<void> {
  await setupMockWorker({
    domains: [
      {
        name: "project",
        handlers,
      },
    ],
  });
}
```

Update `src/main.tsx` to start the mock environment before rendering:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

async function bootstrap() {
  // Start mock environment in development
  if (import.meta.env.DEV) {
    const { startMockEnvironment } = await import("./mock/setup");
    await startMockEnvironment();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
```

`setupMockWorker` performs these steps in order:

1. Filters domains where `enabled !== false`
2. Resets the in-memory store
3. Seeds each entity store from domain seed data (if provided)
4. Combines handlers from enabled domains and starts the MSW service worker

**Expected result:** Opening the browser console shows `[MSW] Mocking enabled`. All API requests to `/api/v1/*` are intercepted by the service worker and handled by the in-memory store.

## Step 5: Derive Hooks and Build the UI

Create the hooks and a simple UI to test the full stack.

Create `src/hooks.ts`:

```ts
import { deriveHooks } from "@simplix-react/react";
import { projectApi } from "./contract";

export const hooks = deriveHooks(projectApi);
```

Update `src/App.tsx`:

```tsx
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hooks } from "./hooks";

const queryClient = new QueryClient();

function ProjectManager() {
  const { data: projects, isLoading } = hooks.project.useList();
  const createProject = hooks.project.useCreate();
  const deleteProject = hooks.project.useDelete();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = () => {
    createProject.mutate({
      name: `Project ${Date.now()}`,
      description: "A test project",
      status: "active" as const,
    });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Project Manager (Mock)</h1>

      <button onClick={handleCreate} disabled={createProject.isPending}>
        Create Project
      </button>

      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            <button onClick={() => setSelectedId(p.id)}>{p.name}</button>
            <button onClick={() => deleteProject.mutate(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {selectedId && <TaskPanel projectId={selectedId} />}
    </div>
  );
}

function TaskPanel({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = hooks.task.useList(projectId);
  const createTask = hooks.task.useCreate(projectId);
  const updateTask = hooks.task.useUpdate();
  const deleteTask = hooks.task.useDelete();

  const [title, setTitle] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      { title, completed: false },
      { onSuccess: () => setTitle("") },
    );
  };

  if (isLoading) return <p>Loading tasks...</p>;

  return (
    <div>
      <h2>Tasks</h2>

      <form onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks?.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() =>
                  updateTask.mutate({
                    id: t.id,
                    dto: { completed: !t.completed },
                  })
                }
              />
              {t.title}
            </label>
            <button onClick={() => deleteTask.mutate(t.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectManager />
    </QueryClientProvider>
  );
}
```

**Expected result:** The app runs with full CRUD for projects and tasks. All data is stored in-memory and handled via MSW.

## Step 6: Verify CRUD Operations Work

Start the development server and test every operation.

```bash
pnpm dev
```

Open the browser and perform these operations in order:

| # | Action               | Expected Result                                         |
| - | -------------------- | ------------------------------------------------------- |
| 1 | Click "Create Project" | A new project appears in the list                     |
| 2 | Click the project name | The task panel opens below                            |
| 3 | Type a task title and click "Add" | The task appears in the list                |
| 4 | Toggle the task checkbox | The task shows as completed                          |
| 5 | Click "Remove" on the task | The task disappears from the list                  |
| 6 | Click "Delete" on the project | The project disappears from the list             |

Open the Network tab in DevTools. All requests to `/api/v1/*` should show `(ServiceWorker)` as the initiator.

> **Note:** Data is stored in-memory and resets on every page refresh. This is by design — the mock layer is intended for development and testing, not data persistence. See Step 7 for pre-populating data with seed records.

**Expected result:** All six operations succeed. Each page refresh starts with a clean slate (or with seed data if configured).

## Step 7: Add Seed Data

Pre-populate the mock store with sample data using the `seed` option in `MockDomainConfig`.

Update `src/mock/setup.ts` to include seed data:

```ts
import { setupMockWorker } from "@simplix-react/mock";
import { handlers } from "./handlers";

export async function startMockEnvironment(): Promise<void> {
  await setupMockWorker({
    domains: [
      {
        name: "project",
        handlers,
        seed: {
          project_project: [
            {
              id: "proj-1",
              name: "Website Redesign",
              description: "Redesign the company website",
              status: "active",
              createdAt: "2025-01-15T09:00:00Z",
              updatedAt: "2025-01-15T09:00:00Z",
            },
            {
              id: "proj-2",
              name: "Mobile App",
              description: "Build a mobile application",
              status: "active",
              createdAt: "2025-01-10T09:00:00Z",
              updatedAt: "2025-01-10T09:00:00Z",
            },
            {
              id: "proj-3",
              name: "Legacy Migration",
              description: "Migrate legacy systems",
              status: "archived",
              createdAt: "2025-01-05T09:00:00Z",
              updatedAt: "2025-01-05T09:00:00Z",
            },
          ],
          project_task: [
            {
              id: "task-1",
              projectId: "proj-1",
              title: "Create wireframes",
              completed: true,
              createdAt: "2025-01-16T09:00:00Z",
              updatedAt: "2025-01-16T09:00:00Z",
            },
            {
              id: "task-2",
              projectId: "proj-1",
              title: "Design mockups",
              completed: false,
              createdAt: "2025-01-17T09:00:00Z",
              updatedAt: "2025-01-17T09:00:00Z",
            },
            {
              id: "task-3",
              projectId: "proj-1",
              title: "Implement homepage",
              completed: false,
              createdAt: "2025-01-18T09:00:00Z",
              updatedAt: "2025-01-18T09:00:00Z",
            },
            {
              id: "task-4",
              projectId: "proj-2",
              title: "Set up React Native",
              completed: true,
              createdAt: "2025-01-11T09:00:00Z",
              updatedAt: "2025-01-11T09:00:00Z",
            },
            {
              id: "task-5",
              projectId: "proj-2",
              title: "Build navigation",
              completed: false,
              createdAt: "2025-01-12T09:00:00Z",
              updatedAt: "2025-01-12T09:00:00Z",
            },
          ],
        },
      },
    ],
  });
}
```

Key points:

- Seed data is plain JavaScript objects — no SQL, no migrations
- Store names follow the convention `{domain}_{snake_case_entity}` (e.g. domain `"project"` + entity `"project"` = `"project_project"`, entity `"task"` = `"project_task"`)
- Each record should include all fields that the schema expects, including `id`, `createdAt`, and `updatedAt`
- Seed data is loaded fresh on every page refresh, ensuring a consistent starting state

**Expected result:** The app loads with 3 projects and their associated tasks pre-populated on every page load.

## Step 8: Transition to a Real API

When your backend is ready, switching from mock to real API requires zero changes to your contract, hooks, or components. The only changes are in your bootstrap code.

Update `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

async function bootstrap() {
  // Only use mock in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true") {
    const { startMockEnvironment } = await import("./mock/setup");
    await startMockEnvironment();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
```

Create a `.env` file for mock mode:

```bash
VITE_USE_MOCK=true
```

Create a `.env.production` file for production:

```bash
VITE_USE_MOCK=false
```

The transition path:

```
Contract (shared)
    |
    +-- Mock: In-Memory Store + MSW (development)
    |
    +-- Real: Backend API server (production)
```

Because `defineApi` produces a standard HTTP client, your components work with both the MSW mock layer and a real API server. The contract is the single source of truth.

**Expected result:** Setting `VITE_USE_MOCK=false` bypasses the mock setup entirely. All fetch requests go directly to the real backend at `/api/v1/*`.

## Summary

In this tutorial you:

1. Installed `@simplix-react/contract`, `@simplix-react/react`, and `@simplix-react/mock`
2. Defined a contract with project and task entities
3. Derived MSW handlers with `deriveMockHandlers`
4. Bootstrapped the mock environment with `setupMockWorker`
5. Built a working CRUD UI powered entirely by an in-memory store
6. Added seed data using plain JavaScript objects
7. Set up an environment-variable-based switch for transitioning to a real API

The mock environment provides:

- Lightweight in-memory storage with automatic CRUD operations
- Sorting, filtering, and offset-based pagination out of the box
- Network-level interception via MSW (visible in DevTools Network tab)
- Consistent seed data on every page load for reliable development
- Zero code changes needed when switching to a real backend
