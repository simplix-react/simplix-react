# Changelog

## 1.0.0

### Minor Changes

- Initial release of simplix-react packages

### Patch Changes

- Updated dependencies []:
  - @simplix-react/contract@1.0.0

All notable changes to `@simplix-react/mock` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.0.1] - 2025-06-01

### Added

- `deriveMockHandlers` for auto-generating MSW request handlers from API contracts
- `setupMockWorker` for configuring MSW service worker with contract-derived handlers
- PGlite integration with `initPGlite`, `getPGliteInstance`, and `resetPGliteInstance` lifecycle functions
- `mockSuccess` and `mockFailure` result helpers for standardized mock responses
- SQL row mapping utilities: `mapRow`, `mapRows`, `toCamelCase`, `toSnakeCase`
- `buildSetClause` for constructing parameterized SQL SET clauses
- `mapPgError` for translating PostgreSQL errors to typed `MockError` objects
- Migration helpers: `tableExists`, `columnExists`, `executeSql`, `addColumnIfNotExists`
