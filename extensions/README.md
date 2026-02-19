# Extensions

Extensions provide environment-specific implementations that the core `simplix-react` framework cannot cover generically. While core packages (`packages/`) are designed to be universally applicable, extensions address the needs of particular platforms, server frameworks, or infrastructure setups.

Each extension lives in its own workspace under `extensions/` and implements the abstract interfaces defined in core packages for a specific environment.

## Architecture

```
simplix-react/
  packages/           # Core packages (universal, environment-agnostic)
    auth/             #   Abstract auth interfaces
    access/           #   Abstract access control interfaces
    ...
  extensions/         # Environment-specific implementations
    simplix-boot/     #   Spring Boot / Spring Security adapters
```

Core packages define abstract contracts (e.g., `AccessAdapter`, `TokenPair`). Extensions implement these contracts for specific environments, keeping consumer code portable.

## Available Extensions

| Extension                       | Target Environment     | Packages                                     | Description                                              |
| ------------------------------- | ---------------------- | -------------------------------------------- | -------------------------------------------------------- |
| [simplix-boot](./simplix-boot/) | SimpliX (Spring Boot)  | `@simplix-boot/auth`, `@simplix-boot/access` | SimpliX Spring Security auth and authorization adapters  |

## Creating a New Extension

An extension is a standalone pnpm workspace nested inside `extensions/`. Each extension:

1. Has its own `pnpm-workspace.yaml` and `package.json`
2. Contains one or more sub-packages under `packages/`
3. Declares core packages as `peerDependencies`
4. Is registered in the root `pnpm-workspace.yaml`

### Directory Structure

```
extensions/
  <extension-name>/
    package.json            # Workspace root (private: true)
    pnpm-workspace.yaml     # packages: ["packages/*"]
    tsconfig.json           # Shared compiler options
    packages/
      <sub-package>/
        package.json        # Published package
        tsconfig.json
        tsup.config.ts
        vitest.config.ts
        src/
          index.ts          # Public API exports
          types.ts          # Extension-specific types
          ...
```

### Registration

Add the extension's packages to the root `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "extensions/<extension-name>/packages/*"
```

### Peer Dependencies

Extension packages declare core packages as peer dependencies to avoid version conflicts:

```json
{
  "peerDependencies": {
    "@simplix-react/auth": "workspace:*",
    "@simplix-react/contract": "workspace:*"
  }
}
```

## Build and Test

Extensions participate in the root Turborepo pipeline:

```bash
# Build all (including extensions)
pnpm build

# Test all (including extensions)
pnpm test

# Build/test a specific extension package
pnpm --filter @simplix-boot/auth build
pnpm --filter @simplix-boot/access test
```
