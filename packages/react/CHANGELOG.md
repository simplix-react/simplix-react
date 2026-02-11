# Changelog

## 1.0.0

### Minor Changes

- Initial release of simplix-react packages

### Patch Changes

- Updated dependencies []:
  - @simplix-react/contract@1.0.0

All notable changes to `@simplix-react/react` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.0.1] - 2025-06-01

### Added

- `deriveHooks` function for auto-generating React Query hooks from API contracts
- Derived `useList` hook for paginated list queries
- Derived `useGet` hook for single entity retrieval
- Derived `useCreate` mutation hook for entity creation
- Derived `useUpdate` mutation hook for entity updates
- Derived `useDelete` mutation hook for entity deletion
- Derived `useInfiniteList` hook for infinite scroll queries
- Operation-level mutation hooks for custom API operations
- Full TypeScript type exports: `EntityHooks`, `OperationHooks`, `DerivedListHook`, `DerivedGetHook`, and more
