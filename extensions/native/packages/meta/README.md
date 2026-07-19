# simplix-react-native

Meta package that installs the `@simplix-react-native/*` core packages in one dependency — the native mirror of the web `simplix-react` meta package.

## Included packages

| Package | Description |
| --- | --- |
| `@simplix-react-native/ui` | Standard mobile UI kit (primitives, page skeletons, controls, sheet-first overlays, FormFields / DetailFields, EntityList + useEntityFeed, theme token sheet) |
| `@simplix-react-native/runtime` | Expo runtime glue (token store adapters, Boot mutator assembly, app boot providers, msw/native wiring) |

Device-layer extensions install individually — they carry native modules and belong only in apps that use them:

```bash
pnpm add @simplix-react-native-ext/capture    # camera + auto-capture session
pnpm add @simplix-react-native-ext/signature  # drawn/typed signature to PNG
pnpm add @simplix-react-native-ext/qr         # rotating presence-token QR
pnpm add @simplix-react-native-ext/kiosk      # keep-awake, lock task, idle reset, recovery
```

## Setup

Because pnpm uses strict resolution, add to the app's `.npmrc` (done automatically by `simplix add-app --native`):

```
public-hoist-pattern[]=@simplix-react-native/*
public-hoist-pattern[]=@simplix-react-native-ext/*
```

Import from the individual packages:

```ts
import { EntityList, useEntityFeed, FormFields } from "@simplix-react-native/ui";
import { SimplixNativeProvider, createNativeI18n } from "@simplix-react-native/runtime";
```

RN packages ship source (`src/`) — Metro transpiles them, and NativeWind class extraction requires the package sources in the app's Tailwind `content` globs (the generated app config includes them).
