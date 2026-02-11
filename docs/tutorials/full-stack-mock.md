# Build a Full-Stack Mock Development Environment

> After completing this tutorial, you will have a fully working frontend application backed by an in-browser PostgreSQL database (PGlite) and MSW service worker — no backend server required.

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

## Step 3: Set Up PGlite with Migrations

Create a migration function that builds the database schema using PGlite and the `executeSql` helper.

Create `src/mock/migrations.ts`:

```ts
import type { PGlite } from "@electric-sql/pglite";
import { tableExists, executeSql } from "@simplix-react/mock";

export async function runMigrations(db: PGlite): Promise<void> {
  const projectsExist = await tableExists(db, "projects");
  if (projectsExist) return;

  await executeSql(
    db,
    `
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `,
  );
}
```

Key points:

- `tableExists` checks whether a table already exists (idempotent migrations)
- `executeSql` splits and executes multiple SQL statements separated by semicolons
- Column names use `snake_case` — the mock layer automatically maps them to `camelCase` in JSON responses

**Expected result:** The migration creates `projects` and `tasks` tables with proper types and a foreign key relationship.

## Step 4: Derive Mock Handlers

Generate MSW handlers from the contract using `deriveMockHandlers`.

Create `src/mock/handlers.ts`:

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "../contract";

export const handlers = deriveMockHandlers(projectApi.config, {
  project: {
    tableName: "projects",
    defaultSort: "created_at DESC",
  },
  task: {
    tableName: "tasks",
    defaultSort: "created_at DESC",
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

**Expected result:** `handlers` is an array of MSW `HttpHandler` instances. Each handler reads from and writes to the PGlite database.

## Step 5: Start the MSW Worker

Use `setupMockWorker` to bootstrap PGlite and MSW together.

Create `src/mock/setup.ts`:

```ts
import { setupMockWorker } from "@simplix-react/mock";
import { runMigrations } from "./migrations";
import { handlers } from "./handlers";

export async function startMockEnvironment(): Promise<void> {
  await setupMockWorker({
    dataDir: "idb://project-mock-demo",
    migrations: [runMigrations],
    seed: [],
    handlers,
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

1. Initializes PGlite at `idb://project-mock-demo` (persisted in IndexedDB)
2. Runs all migration functions
3. Runs all seed functions
4. Starts the MSW service worker

**Expected result:** Opening the browser console shows `[MSW] Mocking enabled`. All API requests to `/api/v1/*` are intercepted by the service worker and handled by PGlite.

## Step 6: Derive Hooks and Build the UI

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

**Expected result:** The app runs with full CRUD for projects and tasks. All data is persisted in the browser's IndexedDB via PGlite.

## Step 7: Verify CRUD Operations Work

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
| 7 | Refresh the page     | Previously created data persists (IndexedDB)            |

Open the Network tab in DevTools. All requests to `/api/v1/*` should show `(ServiceWorker)` as the initiator.

**Expected result:** All seven operations succeed. Data persists across page refreshes.

## Step 8: Add Seed Data

Create a seed function to pre-populate the database with sample data.

Create `src/mock/seed.ts`:

```ts
import type { PGlite } from "@electric-sql/pglite";

export async function seedData(db: PGlite): Promise<void> {
  // Check if data already exists
  const result = await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM projects",
  );
  const count = parseInt(result.rows[0]?.count ?? "0", 10);
  if (count > 0) return;

  // Seed projects
  await db.query(
    `INSERT INTO projects (id, name, description, status)
     VALUES
       ('proj-1', 'Website Redesign', 'Redesign the company website', 'active'),
       ('proj-2', 'Mobile App', 'Build a mobile application', 'active'),
       ('proj-3', 'Legacy Migration', 'Migrate legacy systems', 'archived')`,
  );

  // Seed tasks for "Website Redesign"
  await db.query(
    `INSERT INTO tasks (id, project_id, title, completed)
     VALUES
       ('task-1', 'proj-1', 'Create wireframes', true),
       ('task-2', 'proj-1', 'Design mockups', false),
       ('task-3', 'proj-1', 'Implement homepage', false)`,
  );

  // Seed tasks for "Mobile App"
  await db.query(
    `INSERT INTO tasks (id, project_id, title, completed)
     VALUES
       ('task-4', 'proj-2', 'Set up React Native', true),
       ('task-5', 'proj-2', 'Build navigation', false)`,
  );
}
```

Update `src/mock/setup.ts` to include the seed function:

```ts
import { setupMockWorker } from "@simplix-react/mock";
import { runMigrations } from "./migrations";
import { seedData } from "./seed";
import { handlers } from "./handlers";

export async function startMockEnvironment(): Promise<void> {
  await setupMockWorker({
    dataDir: "idb://project-mock-demo",
    migrations: [runMigrations],
    seed: [seedData],
    handlers,
  });
}
```

To see the seed data on a fresh start, clear the existing IndexedDB:

1. Open DevTools → Application → IndexedDB
2. Delete the `project-mock-demo` database
3. Refresh the page

**Expected result:** The app loads with 3 projects and their associated tasks pre-populated.

## Step 9: Transition to a Real API

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
    +-- Mock: PGlite + MSW (development)
    |
    +-- Real: Backend API server (production)
```

Because `defineApi` produces a standard HTTP client, your components work with both the MSW mock layer and a real API server. The contract is the single source of truth.

**Expected result:** Setting `VITE_USE_MOCK=false` bypasses the mock setup entirely. All fetch requests go directly to the real backend at `/api/v1/*`.

## Summary

In this tutorial you:

1. Installed `@simplix-react/contract`, `@simplix-react/react`, and `@simplix-react/mock`
2. Defined a contract with project and task entities
3. Created database migrations using `executeSql` and `tableExists`
4. Derived MSW handlers with `deriveMockHandlers`
5. Bootstrapped the mock environment with `setupMockWorker`
6. Built a working CRUD UI powered entirely by in-browser PGlite
7. Added seed data for realistic development
8. Set up an environment-variable-based switch for transitioning to a real API

The mock environment provides:

- Full PostgreSQL semantics (joins, constraints, transactions) via PGlite
- Persistent data across page refreshes via IndexedDB
- Network-level interception via MSW (visible in DevTools Network tab)
- Zero code changes needed when switching to a real backend
