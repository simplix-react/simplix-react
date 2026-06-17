# simplix-react-ext

Meta package that installs all `@simplix-react-ext/*` extension packages in one dependency.

These extensions adapt simplix-react to the **simplix-boot** backend (Boot response
envelope, auth, SSE stream, and the OpenAPI codegen CLI plugin). Use this alongside the
core [`simplix-react`](../simplix-react/README.md) meta package.

## Installation

```bash
pnpm add simplix-react-ext
```

### pnpm Configuration

pnpm uses strict dependency resolution. To import from `@simplix-react-ext/*`
sub-packages, add this to your `.npmrc`:

```ini
public-hoist-pattern[]=@simplix-react-ext/*
```

> Projects created with `simplix init` include this configuration automatically.

This single install provides:

| Package | Description |
| --- | --- |
| `@simplix-react-ext/simplix-boot-access` | Spring Security authorization adapter for `@simplix-react/access` |
| `@simplix-react-ext/simplix-boot-auth` | Spring Security authentication adapter |
| `@simplix-react-ext/simplix-boot-cli-plugin` | CLI plugin: Boot OpenAPI spec profile and codegen adapters |
| `@simplix-react-ext/simplix-boot-stream` | Boot SSE streaming (EventSource management, subscriptions, staleness) |
| `@simplix-react-ext/simplix-boot-utils` | Boot envelope helpers (`resolveBootEnum`, mutators) |

## Usage

Import directly from individual packages:

```ts
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";
import { useStreamEvents } from "@simplix-react-ext/simplix-boot-stream";
```

## Selective Installation

If you only need specific packages, install them individually:

```bash
pnpm add @simplix-react-ext/simplix-boot-utils @simplix-react-ext/simplix-boot-stream
```

## License

MIT
