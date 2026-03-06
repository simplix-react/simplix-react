# Guides

Practical how-to guides for accomplishing specific tasks with simplix-react. Each guide focuses on a single goal, provides step-by-step instructions, and includes working code examples.

## Contents

### Contract & Entity Definition

| Document | Description |
| --- | --- |
| [Defining Entities](./defining-entities.md) | Define type-safe CRUD entities with Zod schemas (entity, create, and update schemas), register them in a contract via `defineApi()`, and configure path patterns for automatic client and hook derivation |
| [Custom Operations](./custom-operations.md) | Add non-CRUD endpoints (batch actions, RPC calls, file uploads) using `OperationDefinition` with custom HTTP methods, path parameters, and input/output schemas |
| [Parent-Child](./parent-child.md) | Configure nested entity hierarchies so child resources are scoped under parent URL paths (e.g., `/projects/:projectId/tasks`) with automatic query scoping and cache invalidation |

### React Integration

| Document | Description |
| --- | --- |
| [React Hooks Reference](./react-hooks-reference.md) | Derive and use type-safe React Query hooks (`useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`) with automatic cache invalidation, optimistic updates, and query key factories |
| [Form Hooks](./form-hooks.md) | Derive TanStack Form hooks from contracts via `deriveEntityFormHooks()`, build create/update forms with automatic dirty-field tracking, default value handling, and server validation error mapping |
| [UI Components](./ui-components.md) | Build CRUD interfaces using `CrudList`, `CrudForm`, `CrudDetail`, and `CrudTree` compound components with explicit field configuration, custom column rendering, and composable layout patterns |

### HTTP & Auth

| Document | Description |
| --- | --- |
| [Custom Fetch](./custom-fetch.md) | Customize the HTTP layer for headers, interceptors, logging, and error transformation by wrapping `defaultFetch` or providing a fully custom `FetchFn` implementation |
| [Authentication](./authentication.md) | Set up authenticated API requests using Bearer tokens, API keys, or OAuth2 via `@simplix-react/auth` with automatic token refresh, 401 retry, and `AuthProvider` React integration |
| [Authorization](./authorization.md) | Implement role-based access control using `@simplix-react/access` with CASL rules, JWT/API/static adapters, `AccessProvider` context, and `useCan()` hook for conditional UI rendering |

### i18n & Testing

| Document | Description |
| --- | --- |
| [Internationalization](./internationalization.md) | Add multi-language support with `@simplix-react/i18n`: configure `createI18nConfig`, organize translation files by namespace/locale, register domain translations, and use `useTranslation` hooks |
| [Testing with Mocks](./testing-with-mocks.md) | Configure Vitest and React Testing Library with `@simplix-react/testing` helpers: `createMockClient` for deterministic data, `createQueryWrapper` for provider setup, and mock access control testing |
| [Mock Handlers](./mock-handlers.md) | Set up and customize MSW mock handlers derived from contracts: seed data, override individual handlers, add custom response delays, and configure relation loading behavior |

### Tooling & Extensions

| Document | Description |
| --- | --- |
| [CLI Usage](./cli-usage.md) | Use the `simplix` CLI to scaffold projects (`init`), add domains and modules (`add`), import OpenAPI specs (`openapi`), validate project structure (`validate`), and generate i18n types |
| [Extensions](./extensions.md) | Set up Spring Boot authentication, authorization, and CLI code generation using `@simplix-react-ext/simplix-boot-*` extension packages with Boot-specific adapters and naming conventions |
| [LLM Integration](./llm-integration.md) | Provide context for LLM coding agents (Claude Code, Cursor, Copilot) using `llms.txt`, Claude Code skills, and CLAUDE.md references so agents can accurately generate simplix-react code |
