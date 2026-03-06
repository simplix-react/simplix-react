# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.1.3] - Unreleased

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
- Unified all package versions to 0.1.0, then bumped through 0.1.1, 0.1.2, to 0.1.3
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
