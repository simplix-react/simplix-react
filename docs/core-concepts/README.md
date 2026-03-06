# Core Concepts

Architectural explanations of how simplix-react works internally. These documents describe the design decisions, data flow, and structural patterns behind each major subsystem. Read these to understand _why_ things work the way they do.

## Contents

| Document | Description |
| --- | --- |
| [API Contracts](./api-contracts.md) | How `defineApi()` assembles EntityDefinitions and OperationDefinitions into a single source of truth, the contract structure (schemas, paths, parent relations), and how contracts drive the entire derivation pipeline |
| [Schema Derivation](./schema-derivation.md) | The five-stage derivation pipeline: contract assembly → client generation → query key factory → React Query hooks → MSW mock handlers, and how Zod schemas maintain end-to-end type safety across all stages |
| [Authentication](./authentication.md) | Strategy-based auth middleware architecture: how `AuthScheme` implementations (Bearer, API Key, OAuth2, Custom) produce authenticated `fetchFn` wrappers with automatic 401 retry and single-flight token refresh |
| [Authorization](./authorization.md) | CASL-powered access control: how `AccessPolicy` wraps CASL abilities, the adapter pattern for extracting rules from JWT tokens or API endpoints, role normalization, and the React integration layer |
| [Cache Invalidation](./cache-invalidation.md) | Automatic query cache invalidation strategy: hierarchical query key structure (`[domain, entity, scope, params]`), how mutations invalidate related queries, and the conservative broad-invalidation tradeoff |
| [Extensions](./extensions.md) | Extension system architecture: provider pattern for environment-specific implementations, naming conventions (`@simplix-react-ext/`), how extensions implement core abstract interfaces for specific backends like Spring Boot |
| [Form Derivation](./form-derivation.md) | How `deriveEntityFormHooks()` generates TanStack Form hooks from contracts and React Query hooks, including automatic dirty-field tracking, server error mapping, and the full derivation chain from Zod to form bindings |
| [Internationalization](./internationalization.md) | Adapter-based i18n architecture: the `II18nAdapter` interface, domain vs. application translation ownership, namespace scoping for collision prevention, lazy-loaded module translations, and `Intl` API formatting |
| [Mock Data Layer](./mock-data-layer.md) | MSW + in-memory Map store architecture: how `deriveMockHandlers()` generates handlers with real CRUD operations, filtering, sorting, pagination, and relation loading — all backed by JavaScript `Map` instances |
| [UI Components](./ui-components.md) | Four-layer component architecture (primitives → base → layout → CRUD), compound component patterns with explicit `value`/`onChange` props, and how `CrudList`, `CrudForm`, `CrudDetail`, and `CrudTree` compose from lower layers |
