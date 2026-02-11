# Changelog

## 1.0.0

### Minor Changes

- Initial release of simplix-react packages

All notable changes to `@simplix-react/contract` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.0.1] - 2025-06-01

### Added

- `defineApi` function for declarative API contract definition with Zod schemas
- `deriveClient` for generating type-safe API clients from contracts
- `deriveQueryKeys` for generating TanStack Query key factories from contracts
- `buildPath` helper for URL path construction with parameter interpolation
- `ApiError` class and `defaultFetch` wrapper for standardized HTTP error handling
- `camelToKebab` and `camelToSnake` case transformation utilities
- `simpleQueryBuilder` for constructing query strings from typed parameters
- Full TypeScript type exports: `EntityDefinition`, `ApiContract`, `EntityClient`, `QueryKeyFactory`, and more
- `ListParams`, `SortParam`, `PaginationParam`, and `PageInfo` types for list query support
