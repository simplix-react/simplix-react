# Extensions

## Overview

Extensions provide environment-specific implementations for the abstract interfaces defined by core simplix-react packages. While core packages (`packages/`) are designed to be universally applicable and environment-agnostic, extensions address the needs of particular backend platforms, server frameworks, or infrastructure setups.

The core insight is that simplix-react's core packages define _what_ needs to happen (authenticate a user, check permissions, generate code from an OpenAPI spec), but not _how_ it happens for a specific backend. Extensions bridge this gap by implementing the abstract contracts for a concrete environment, keeping your application code portable across backends.

## How It Works

Extensions follow a provider pattern: core packages define abstract interfaces, and extensions supply concrete implementations.

```
Core Packages (environment-agnostic)          Extensions (environment-specific)

@simplix-react/auth                           @simplix-react-ext/simplix-boot-auth
  AuthInstance, TokenPair, FetchFn      <---    createBootAuth()

@simplix-react/access                         @simplix-react-ext/simplix-boot-access
  AccessAdapter, AccessPolicy           <---    createSpringAccessAdapter()
                                                createBootAccessPolicy()

@simplix-react/cli                            @simplix-react-ext/simplix-boot-cli-plugin
  registerPlugin(), SchemaAdapter       <---    simplixBootNaming, bootSchemaAdapter
```

Your application code depends on core interfaces. At configuration time, you wire in the extension's implementation. If you later switch backends (e.g., from Spring Boot to a different framework), you swap the extension --- your components and hooks remain unchanged.

### Naming Convention

Extension packages follow the `@simplix-react-ext/` scope prefix:

```
@simplix-react-ext/<extension>-<sub-package>
```

For example, the simplix-boot extension produces:

- `@simplix-react-ext/simplix-boot-auth`
- `@simplix-react-ext/simplix-boot-access`
- `@simplix-react-ext/simplix-boot-cli-plugin`
- `@simplix-react-ext/simplix-boot-utils`

### Directory Structure

Extensions live under `extensions/` in the monorepo root. Each extension is a standalone pnpm workspace with its own sub-packages:

```
simplix-react/
  packages/                         # Core packages (universal)
    auth/                           #   Abstract auth interfaces
    access/                         #   Abstract access control
    cli/                            #   CLI with plugin registry
    ...
  extensions/                       # Environment-specific implementations
    simplix-boot/                   #   Spring Boot adapters
      package.json                  #     Workspace root (private: true)
      pnpm-workspace.yaml           #     packages: ["packages/*"]
      packages/
        auth/                       #     Boot authentication
        access/                     #     Boot access control
        cli-plugin/                 #     CLI spec profile
        utils/                      #     Boot-specific utilities
```

### Workspace Registration

Extension sub-packages are registered in the root `pnpm-workspace.yaml` so they participate in the monorepo's build and dependency graph:

```yaml
packages:
  - "packages/*"
  - "extensions/simplix-boot/packages/*"
```

This allows `pnpm build`, `pnpm test`, and Turborepo pipelines to include extension packages automatically.

### Peer Dependency Model

Extension packages declare core packages as `peerDependencies` rather than direct dependencies. This avoids version duplication and ensures the extension uses the same instance of the core package as the consuming application:

```json
{
  "peerDependencies": {
    "@simplix-react/auth": "workspace:*",
    "@simplix-react/contract": "workspace:*"
  }
}
```

The consuming application installs both the core package and the extension. The extension resolves the core package from the consumer's `node_modules`, guaranteeing a single shared instance.

### CLI Dynamic Plugin Loading

The CLI uses a dynamic import pattern to discover extension plugins at runtime without requiring a hard dependency:

```ts
// packages/cli/src/bin.ts
try {
  await import("@simplix-react-ext/simplix-boot-cli-plugin");
} catch {
  // Plugin not installed --- boot profile won't be available
}
```

When the import succeeds, the plugin's top-level code calls `registerPlugin()` and `registerSchemaAdapter()` from `@simplix-react/cli`, registering its spec profile and schema adapter into the CLI's global registry. When the import fails (package not installed), the CLI continues without the plugin --- no error, no degradation for non-Boot users.

This pattern allows any extension to add CLI capabilities by publishing a package whose entry point calls the CLI's registration functions. The CLI does not need to know about extensions at compile time.

## Available Extensions

### simplix-boot (Spring Boot)

Adapters for SimpliX, a Spring Boot-based backend framework by SimpleCORE Inc. Implements simplix-react core interfaces for SimpliX's Spring Security APIs.

| Package | Core Package | Description |
| --- | --- | --- |
| `@simplix-react-ext/simplix-boot-auth` | `@simplix-react/auth` | Spring Security authentication: token issue/refresh/revoke, user profile, Boot envelope handling, `ApiResponseError` |
| `@simplix-react-ext/simplix-boot-access` | `@simplix-react/access` | Spring Security authorization: permission-to-CASL conversion, `AccessAdapter` implementation |
| `@simplix-react-ext/simplix-boot-cli-plugin` | `@simplix-react/cli` | CLI spec profile: Boot naming strategy, response adapter (envelope format), schema adapter (envelope unwrapping) |
| `@simplix-react-ext/simplix-boot-utils` | (standalone) | Boot-specific utilities such as `resolveBootEnum()` for handling Spring enum objects |

The auth package provides `createBootAuth()`, which wires up Bearer token authentication with automatic refresh, cross-tab sync, and Boot envelope unwrapping in a single call. The access package provides `createSpringAccessAdapter()` and `createBootAccessPolicy()`, which convert Spring Security permission responses into CASL rules. The CLI plugin registers a `simplix-boot` spec profile so `simplix openapi` can generate domain packages from Boot-style OpenAPI specs.

## Creating a New Extension

To create an extension for a new backend environment:

1. **Create the directory structure** under `extensions/<extension-name>/` with its own `package.json` (private), `pnpm-workspace.yaml`, and `packages/` directory.

2. **Register in root workspace** by adding `"extensions/<extension-name>/packages/*"` to the root `pnpm-workspace.yaml`.

3. **Implement sub-packages** that provide concrete implementations of core interfaces. Each sub-package declares the relevant core package as a `peerDependency`.

4. **For CLI integration**, create a CLI plugin package whose entry point calls `registerPlugin()` and `registerSchemaAdapter()`. The CLI will load it via dynamic import if installed.

5. **Follow the naming convention**: `@simplix-react-ext/<extension-name>-<sub-package>`.

Extensions participate in the root Turborepo pipeline automatically:

```bash
# Build all (including extensions)
pnpm build

# Test a specific extension package
pnpm --filter @simplix-react-ext/simplix-boot-access test
```

## Design Decisions

### Why Separate from Core?

Core packages must remain environment-agnostic to serve all users. Embedding Spring Boot-specific logic in `@simplix-react/auth` would force non-Boot users to carry irrelevant code and dependencies. Extensions keep the core lean while providing full-featured integrations for specific backends.

### Why Peer Dependencies?

Peer dependencies prevent version duplication. If an extension bundled its own copy of `@simplix-react/auth`, the application would have two separate auth instances --- one from the app and one from the extension --- leading to split state and subtle bugs. Peer dependencies guarantee a single shared instance.

### Why Dynamic Plugin Loading?

A static import would make the CLI depend on every extension at build time. Dynamic imports with `try/catch` allow the CLI to discover plugins at runtime based on what the user has installed, keeping the CLI's dependency footprint minimal.

## Related

- [Extensions Guide](../guides/extensions.md) --- how to set up and use the Boot extension
- [Authentication Architecture](./authentication.md) --- core auth design that extensions implement
- [API Contracts](./api-contracts.md) --- how contracts and `fetchFn` interact
