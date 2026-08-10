# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

The topmost section is always the next version, marked `Unreleased`. The release
workflow stamps it with the released version and date, then opens a fresh
`Unreleased` section for the following development version.

## [0.3.3] - 2026-08-10

## [0.3.2] - 2026-08-04

### Added

- `Popover.Anchor` is a registered UI component, reachable through `useFlatUIComponents()`. A field box that holds controls of its own positions the popover from the box while a button inside it triggers

### Fixed

- `usePageHeader` now publishes on every render of its caller, so an action in the page header reflects the state it was written against. It re-registered only when `title`, `description`, or `metadataKey` changed, which froze `actions`, `metadata`, and `center` at the values of the render that last changed one of those three — a save button installed disabled never enabled, and a period selector never moved its highlight. Consumers worked around it by encoding the state into `metadataKey`; that is no longer needed and the field goes back to meaning what it says. The header is held in a store the header chrome subscribes to rather than in provider state, so publishing no longer re-renders the page that published and the dependency list that caused the freeze is gone
- Popover-backed select fields (`ComboboxField`, `MultiSelectField`, `TreeSelectField`, `TreeMultiSelectField`, `CountryField`, `CurrencyField`, `TimezoneField`) no longer put a control inside their popover trigger. The trigger is a real `<button role="combobox">` — reachable by Tab, opened with Enter or Space, closed with Escape — and the clear, expand, and chip-remove buttons are its siblings. The trigger was a `<span role="combobox">` holding those buttons, which left it out of the tab order entirely and gave assistive technology a control nested inside a control
- `CrudList` row presses that start in the selection cell, the row-action cell, or the drag-handle cell no longer reach `onRowClick`. A list wired to both selection and a detail panel opened the panel when a row was ticked, because the whole `<tr>` carried the handler and the caller could not tell which cell a press came from. Covers the table, the card mode, and the reorderable variants of both
- Every user-facing `aria-label`, `title`, and placeholder in `@simplix-react/ui` resolves through the `simplix/ui` catalogue. Row selection, pagination, the column toggle, the display-order sort, the filter clear and remove buttons, the wizard steps, the map and date navigators, the number and signature inputs, and the language selector carried English string literals, so a screen reader announced them in English whatever the locale

## [0.3.1] - 2026-08-03

### Changed

- Every export condition of every package now points inside the published `dist`. The `source` conditions on `@simplix-react/ui`, `@simplix-react/calendar`, and `@simplix-react/headless` named `./src/...`, which the tarball does not ship; a consumer running `resolve.conditions=["source"]` against the registry build therefore resolved nothing. Raw-source resolution is no longer offered — a linked checkout is consumed through its `dist` like every other package

### Fixed

- `@simplix-react/ui` exports `./theme.css` as `./dist/theme.css`. The `style` condition pointed at `./src/theme.css`, a path the published tarball does not ship, and Tailwind resolves CSS with `conditionNames: ["style"]` — so `@import "@simplix-react/ui/theme.css"` failed to resolve in every consumer installing from the registry

## [0.3.0] - 2026-08-03

### Added

- Server-search mode for `FilterBar` faceted filters — `onSearch` (debounced via `searchDebounceMs`), `loading`, `selectedOptions`, and `footer` on `FacetedFilterDef`, plus the exported `FacetedFilterOptionDef` option type. Eager `options` keep working unchanged
- `FieldWrapper` accepts a render-function child that receives `{ id, labelId }`, so a custom control earns an accessible name — `id` on a labelable control, `aria-labelledby={labelId}` on a composite (radio group, date picker); a plain-element child is named by the wrapping fieldset. `FieldControlProps` and `FieldWrapperChildren` are exported
- `List.Column` `minWidth` floors a column's width and lets long free-text ellipsize instead of stretching the table; `useContainerWidth` is exported
- `CrudDetail` default actions accept `deleteLabel`; `FilterBar` accepts `countLoading`; `CrudListFilters` carries `isLoading`
- i18n keys `list.totalCountUnknown` (`@simplix-react/ui`) and `accessibility.selectTimeSlot` (`@simplix-react/calendar`)

### Changed

- Form fields, icon-only controls (row actions, toolbar and map buttons, close/clear affordances), and the calendar's time-grid slots now carry accessible names so assistive technology announces them; a custom `FieldWrapper` override must resolve a function child by calling it with `{ id, labelId }`
- `ListTotalBadge` and `FilterBar` show `Total —` while the first page is in flight instead of claiming `Total 0`; `CrudDetail`'s delete action is a labeled button rather than an icon-only one
- Boot attachment upload/download failures reject with an `ApiResponseError` carrying the server envelope's `message` / `errorCode` / `errorDetail` (was a bare `HTTP <status>` error); `.status` is preserved

### Fixed

- Lists no longer report a paused or retrying query as "no data" — `ListHookResult` carries `isPaused` / `failureCount`, `EmptyReason` gains `"unavailable"`, and `CrudList` / `AssignmentPanel` / `EntityList` render "the list could not be loaded"
- Queries no longer stay paused forever after a missed `online` event — `@simplix-react/react` exports `startOnlineStatusSync` / `resyncOnlineStatus`, which repair React Query's cached connectivity flag from `navigator.onLine` at boot and on `visibilitychange`; the project template wires the sync into generated apps
- Clear and remove affordances nested inside a filter or date-picker trigger are lifted to sibling buttons, so no interactive control nests inside another
- CLI mock update handlers compile for a singleton resource whose DTO declares no id field

## [0.2.1] - 2026-03-17

### Added

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
- Comprehensive framework improvements from review

### Fixed

- Broken documentation links and packages table in README
- Stable branch-based source links instead of commit hashes in API docs
- CLI mutator regeneration when strategy mismatches config
- Boot API enum object resolution in CrudList cell rendering
- Page header actions and ListDetail dialog layout in UI
- ESLint config for simplix-boot packages and i18n lint error

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
