# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

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
