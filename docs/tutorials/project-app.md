# Build a Project Management App from Scratch

> After completing this tutorial, you will have a fully functional project management app with CRUD operations for projects and tasks, built entirely with simplix-react.

## Prerequisites

- Node.js 18+
- pnpm installed globally
- Basic knowledge of React, TypeScript, and TanStack Query

## Step 1: Set Up the Project

Create a new React project and install the required simplix-react packages.

```bash
pnpm create vite project-manager --template react-ts
cd project-manager
pnpm add @simplix-react/contract @simplix-react/react @tanstack/react-query zod
pnpm add -D @types/react @types/react-dom
```

Verify the installation succeeded:

```bash
pnpm list @simplix-react/contract @simplix-react/react @tanstack/react-query zod
```

**Expected result:** All four packages appear in the dependency list with their versions.

## Step 2: Define the Project Entity Contract

Create the API contract that defines your project entity with Zod schemas and `defineApi`.

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
  },
  queryBuilder: simpleQueryBuilder,
});
```

**Expected result:** The file compiles without TypeScript errors. The `projectApi` object contains `config`, `client`, and `queryKeys`.

## Step 3: Derive React Query Hooks

Use `deriveHooks` to generate type-safe React Query hooks from the contract.

Create `src/hooks.ts`:

```ts
import { deriveHooks } from "@simplix-react/react";
import { projectApi } from "./contract";

export const hooks = deriveHooks(projectApi);
```

This single call produces hooks for every CRUD operation:

- `hooks.project.useList()` — fetch all projects
- `hooks.project.useGet(id)` — fetch a single project
- `hooks.project.useCreate()` — create a project
- `hooks.project.useUpdate()` — update a project
- `hooks.project.useDelete()` — delete a project

**Expected result:** The file compiles and `hooks.project` is fully typed with all entity hooks.

## Step 4: Create the ProjectList Component

Build a component that lists all projects using `useList`.

Create `src/components/ProjectList.tsx`:

```tsx
import { hooks } from "../hooks";

export function ProjectList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { data: projects, isLoading, error } = hooks.project.useList();

  if (isLoading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Projects</h2>
      {projects?.length === 0 && <p>No projects yet. Create one below.</p>}
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>
            <button onClick={() => onSelect(project.id)}>
              {project.name}
            </button>
            <span> — {project.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Expected result:** The component renders a list of projects. Each project name is clickable. The `project` variable is fully typed with `id`, `name`, `description`, `status`, `createdAt`, and `updatedAt` fields.

## Step 5: Add Project Creation

Create a form component that uses `useCreate` to add new projects.

Create `src/components/CreateProject.tsx`:

```tsx
import { useState } from "react";
import { hooks } from "../hooks";

export function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = hooks.project.useCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(
      { name, description, status: "active" as const },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Project</h3>
      <div>
        <label htmlFor="project-name">Name</label>
        <input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="project-desc">Description</label>
        <textarea
          id="project-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? "Creating..." : "Create"}
      </button>
      {createProject.isError && (
        <p>Error: {createProject.error.message}</p>
      )}
    </form>
  );
}
```

**Expected result:** Submitting the form creates a new project via POST. On success, the project list automatically refreshes because `useCreate` invalidates all project queries.

## Step 6: Add Project Editing

Create an edit form that uses `useUpdate` to modify existing projects.

Create `src/components/EditProject.tsx`:

```tsx
import { useState, useEffect } from "react";
import { hooks } from "../hooks";

export function EditProject({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const { data: project, isLoading } = hooks.project.useGet(projectId);
  const updateProject = hooks.project.useUpdate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  if (isLoading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject.mutate(
      { id: projectId, dto: { name, description } },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Project</h3>
      <div>
        <label htmlFor="edit-name">Name</label>
        <input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="edit-desc">Description</label>
        <textarea
          id="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={updateProject.isPending}>
        {updateProject.isPending ? "Saving..." : "Save"}
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
```

**Expected result:** The form loads the existing project data and sends a PATCH request with the updated fields. The `useUpdate` hook accepts `{ id, dto }` as its mutation variable.

## Step 7: Add Project Deletion

Add a delete button that uses `useDelete` to remove projects.

Create `src/components/DeleteProject.tsx`:

```tsx
import { hooks } from "../hooks";

export function DeleteProject({
  projectId,
  projectName,
  onDeleted,
}: {
  projectId: string;
  projectName: string;
  onDeleted: () => void;
}) {
  const deleteProject = hooks.project.useDelete();

  const handleDelete = () => {
    if (!confirm(`Delete "${projectName}"?`)) return;
    deleteProject.mutate(projectId, {
      onSuccess: () => onDeleted(),
    });
  };

  return (
    <button onClick={handleDelete} disabled={deleteProject.isPending}>
      {deleteProject.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

**Expected result:** Clicking the delete button sends a DELETE request. On success, the project list automatically refreshes.

## Step 8: Add the Task Child Entity

Extend the contract with a task entity that belongs to a project using the `parent` field.

Update `src/contract.ts` to add the task entity:

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

The `parent` field tells the framework that tasks are nested under projects. This produces URLs like `/api/v1/projects/:projectId/tasks`.

**Expected result:** `hooks.task` now exists alongside `hooks.project`. The task hooks automatically handle parent scoping — `useList` accepts a `projectId`, and `useCreate` scopes new tasks under the given project.

## Step 9: Create the TaskList Component with parentId

Build a task list component that displays tasks for a specific project.

Create `src/components/TaskList.tsx`:

```tsx
import { useState } from "react";
import { hooks } from "../hooks";

export function TaskList({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = hooks.task.useList(projectId);
  const createTask = hooks.task.useCreate(projectId);
  const updateTask = hooks.task.useUpdate();
  const deleteTask = hooks.task.useDelete();

  const [newTitle, setNewTitle] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask.mutate(
      { title: newTitle, completed: false },
      { onSuccess: () => setNewTitle("") },
    );
  };

  const toggleComplete = (taskId: string, currentValue: boolean) => {
    updateTask.mutate({ id: taskId, dto: { completed: !currentValue } });
  };

  if (isLoading) return <p>Loading tasks...</p>;

  return (
    <div>
      <h3>Tasks</h3>

      <form onSubmit={handleAddTask}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          required
        />
        <button type="submit" disabled={createTask.isPending}>
          Add Task
        </button>
      </form>

      <ul>
        {tasks?.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id, task.completed)}
              />
              <span
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </span>
            </label>
            <button onClick={() => deleteTask.mutate(task.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Key points:

- `hooks.task.useList(projectId)` fetches tasks scoped to the parent project
- `hooks.task.useCreate(projectId)` creates tasks under the specified project
- `hooks.task.useUpdate()` and `hooks.task.useDelete()` work with entity IDs directly

**Expected result:** The component renders a task list for the selected project. You can add, toggle, and remove tasks. All mutations automatically invalidate the task query cache.

## Step 10: Wire Everything Together

Assemble the components into the main `App` component with React Query provider.

Update `src/App.tsx`:

```tsx
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectList } from "./components/ProjectList";
import { CreateProject } from "./components/CreateProject";
import { EditProject } from "./components/EditProject";
import { DeleteProject } from "./components/DeleteProject";
import { TaskList } from "./components/TaskList";

const queryClient = new QueryClient();

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [editingProjectId, setEditingProjectId] = useState<string | null>(
    null,
  );

  return (
    <div>
      <h1>Project Manager</h1>

      <CreateProject />

      <ProjectList onSelect={setSelectedProjectId} />

      {selectedProjectId && (
        <div>
          <h2>Selected Project</h2>
          <button onClick={() => setEditingProjectId(selectedProjectId)}>
            Edit
          </button>
          <DeleteProject
            projectId={selectedProjectId}
            projectName={selectedProjectId}
            onDeleted={() => setSelectedProjectId(null)}
          />
          <TaskList projectId={selectedProjectId} />
        </div>
      )}

      {editingProjectId && (
        <EditProject
          projectId={editingProjectId}
          onClose={() => setEditingProjectId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
```

**Expected result:** The app renders with a project creation form, a project list, and — when a project is selected — its tasks. All CRUD operations are fully wired with automatic cache invalidation.

## Summary

In this tutorial you:

1. Defined an API contract with `defineApi` using Zod schemas for both project and task entities
2. Derived type-safe React Query hooks with a single `deriveHooks` call
3. Built CRUD components (`useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`)
4. Modeled a parent-child relationship between projects and tasks using the `parent` field
5. Scoped task queries and mutations to a specific project via `parentId`

All type safety flows from the Zod schemas — change a schema, and TypeScript catches every affected component at compile time.

**Next steps:**

- Add a mock backend with `@simplix-react/mock` (see the [Full-Stack Mock tutorial](./full-stack-mock.md))
- Add filtering and sorting with `ListParams`
- Add infinite scrolling with `useInfiniteList`
