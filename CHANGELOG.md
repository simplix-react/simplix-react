# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.1.3] - Unreleased

### Added

- Server-search mode for `FilterBar` faceted filters — `onSearch` (debounced via `searchDebounceMs`), `loading`, `selectedOptions`, and `footer` on `FacetedFilterDef`, plus the exported `FacetedFilterOptionDef` option type. Eager `options` keep working unchanged
- `@simplix-react/form` package with TanStack Form integration and derived form hooks
- `@simplix-react/auth` package with authentication middleware (Bearer, API Key, OAuth2)
- `@simplix-react/access` package with CASL-based authorization (RBAC/ABAC) and React bindings
- `@simplix-react/ui` package with CRUD UI component library (list, form, detail, tree, filters)
- `@simplix-react/api` package with Orval mutator singleton for domain packages
- `simplix-react` meta package for single-dependency installation
- `simplix-boot` extension with Spring Boot adapters (auth, access, CLI plugin, utils)
- Auth rehydration, user management, auto-refresh scheduler, and helper utilities
- Access `normalizeRoles` helper and string-based `isSuperAdmin` support
- UI base components: Dialog, Table, Tabs, Switch (with size variants), BooleanBadge, empty state cards, map components
- CRUD filters, tree views, layout improvements, and wireframe comments
- Editor template and improved form template for CLI scaffolding
- Shared UI components and `resolveBootEnum` utility
- Error utilities and improved CRUD dialog layout
- `scaffold-crud` and `init-ui` CLI commands with Handlebars templates
- Per-domain mock toggle with `MockDomainConfig`
- `customizeApi`, path params helpers, and CRUD role types in contract
- `EntityHooks` type alias for React hooks
- Domain translations and locale picker hooks for i18n
- Expanded `DEFAULT_LOCALES` to 84 languages
- CLI plugin registry for extension integration
- `.npmrc` with `public-hoist-pattern` for pnpm compatibility
- MIT license
- Sample petstore store module
- Comprehensive test suites: CLI (fsd-rules, import-rules, config-loader), form hooks, mock handlers, UI (364 tests across 34 files)
- `FieldWrapper` accepts a render-function child that receives `{ id, labelId }`, so a custom control earns an accessible name — `id` on a labelable control, `aria-labelledby={labelId}` on a composite (radio group, date picker); a plain-element child is named by the wrapping fieldset. `FieldControlProps` and `FieldWrapperChildren` are exported
- `List.Column` `minWidth` floors a column's width and lets long free-text ellipsize instead of stretching the table; `useContainerWidth` is exported
- `CrudDetail` default actions accept `deleteLabel`; `FilterBar` accepts `countLoading`; `CrudListFilters` carries `isLoading`
- i18n keys `list.totalCountUnknown` (`@simplix-react/ui`) and `accessibility.selectTimeSlot` (`@simplix-react/calendar`)

### Changed

- Renamed `deriveHooks` to `deriveEntityHooks` and restructured core packages
- Replaced PGlite with in-memory mock store in mock package
- Simplified generic type constraints in contract to use defaults
- Extracted hook factory functions in react package and exported `DerivedHooksResult`
- Exported `DerivedFormHooksResult` and simplified `deepEqual` in form package
- Extracted helper functions in `createAuthFetch`
- Decomposed CLI openapi command, entity extractor, and i18n validator
- Restructured CLI openapi pipeline, scaffold-crud, and templates
- Restructured CLI openapi modules with plugin registry; removed boot presets
- Split UI base components into categorized subfolders
- Consolidated `kebabCase` helper to shared `case.ts` utility
- Extracted boot code to extensions directory and consolidated fetch implementations
- Unified empty state cards for error, no-filter, and no-search in UI
- Switched test runner to vitest across all packages
- Unified all package versions to 0.1.0, then bumped through 0.1.1, 0.1.2, to 0.1.3
- Comprehensive framework improvements from review
- Form fields, icon-only controls (row actions, toolbar and map buttons, close/clear affordances), and the calendar's time-grid slots now carry accessible names so assistive technology announces them; a custom `FieldWrapper` override must resolve a function child by calling it with `{ id, labelId }`
- `ListTotalBadge` and `FilterBar` show `Total —` while the first page is in flight instead of claiming `Total 0`; `CrudDetail`'s delete action is a labeled button rather than an icon-only one
- Boot attachment upload/download failures reject with an `ApiResponseError` carrying the server envelope's `message` / `errorCode` / `errorDetail` (was a bare `HTTP <status>` error); `.status` is preserved

### Fixed

- Broken documentation links and packages table in README
- Stable branch-based source links instead of commit hashes in API docs
- CLI mutator regeneration when strategy mismatches config
- Boot API enum object resolution in CrudList cell rendering
- Page header actions and ListDetail dialog layout in UI
- ESLint config for simplix-boot packages and i18n lint error
- Lists no longer report a paused or retrying query as "no data" — `ListHookResult` carries `isPaused` / `failureCount`, `EmptyReason` gains `"unavailable"`, and `CrudList` / `AssignmentPanel` / `EntityList` render "the list could not be loaded"
- Queries no longer stay paused forever after a missed `online` event — `@simplix-react/react` exports `startOnlineStatusSync` / `resyncOnlineStatus`, which repair React Query's cached connectivity flag from `navigator.onLine` at boot and on `visibilitychange`; the project template wires the sync into generated apps
- Clear and remove affordances nested inside a filter or date-picker trigger are lifted to sibling buttons, so no interactive control nests inside another
- CLI mock update handlers compile for a singleton resource whose DTO declares no id field

### Removed

- Obsolete SCIP analysis report
- Stale build artifacts from src directories

## [0.0.1] - 2025-06-01

### Added

- Initial monorepo setup with pnpm workspaces and Turborepo
- `@simplix-react/contract` package for Zod-based type-safe API contracts
- `@simplix-react/react` package for derived React Query hooks
- `@simplix-react/mock` package for auto-generated MSW handlers and PGlite repositories
- `@simplix-react/i18n` package for i18next-based internationalization
- `@simplix-react/testing` package for React Query testing utilities
- `@simplix-react/cli` package for project scaffolding and validation
- Shared ESLint and TypeScript configurations (`config-eslint`, `config-typescript`)
- Unified build, typecheck, lint, and test scripts via Turborepo
