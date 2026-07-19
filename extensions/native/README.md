# simplix-react-native

React Native extension of simplix-react. It reproduces the framework philosophy — package-first, OpenAPI-driven, derived hooks, FSD — on React Native (Expo), so native apps start from the same contract and conventions as web apps.

The platform-neutral layers (contract, codegen, Boot envelope mutator logic, i18n core, MSW mocks, headless list/filter logic) are reused from the core `packages/`. This extension adds only what is platform-specific: the mobile UI kit, the Expo runtime glue, and device-layer packages.

## Packages

| Package | Description |
| --- | --- |
| `@simplix-react-native/ui` | Standard kit — layout primitives, page skeletons (`Screen`, `StepFlow`, `MasterDetail`), controls, overlays (sheet-first), `FormFields` / `DetailFields`, `EntityList` + `useEntityFeed`, theme token sheet, built-in en/ko/ja locales |
| `@simplix-react-native/runtime` | Token store adapters (`expo-secure-store`, AsyncStorage), mutator assembly, app boot (error dialog, i18n registration, `msw/native` wiring) |
| `@simplix-react-native-ext/capture` | Camera preview, on-device face detection seam, auto-capture session (guide frame, countdown, retake, upload) |
| `@simplix-react-native-ext/signature` | Drawn / typed signature to PNG upload (same payload contract as the web `SignaturePad`) |
| `@simplix-react-native-ext/qr` | QR display for rotating presence tokens (interval re-issue, remaining-validity display) |
| `@simplix-react-native-ext/kiosk` | keep-awake, Android Lock Task Mode, idle reset timer, network recovery screen |
| `simplix-react-native` | Meta package installing `@simplix-react-native/ui` + `@simplix-react-native/runtime` in one dependency |

## Consumption model

Unlike web packages (compiled `dist`), RN packages ship **source**: `main`/`exports` point at `src/`, Metro transpiles the TypeScript, and NativeWind extracts `className` utilities by scanning package sources from the consuming app's Tailwind config. There is no build step for these packages — `typecheck`, `lint`, and `test` only.

RN packages never import DOM-dependent web packages (`@simplix-react/ui`, `@simplix-react/calendar`). Shared code is limited to platform-neutral layers (`@simplix-react/contract`, `@simplix-react/api`, `@simplix-react/i18n`, `@simplix-react/auth`, `@simplix-react/headless`).

## Screen grammar (no web-to-RN porting)

Contracts and logic are reused; screen grammar is designed for mobile. Web component names are not carried over:

| Web grammar | RN grammar |
| --- | --- |
| `CrudList.Table` columns + FilterBar + pagination | `EntityList` — card rows, search bar, filter sheet, infinite scroll |
| `ListDetail` side panel | Full-screen push detail + pinned bottom action bar (tablet landscape may opt into `MasterDetail`) |
| `CrudForm` page + popover pickers | Full-screen form — keyboard-avoiding scroll, sheet pickers, `StepFlow` for long forms |
| Dialog-centric interaction | Sheet-first — `AlertDialog` only for destructive confirmation |
| `usePageHeader` registration model | expo-router stack header |

## CLI

- `simplix add-app <name> --native` — generates an expo-router app skeleton (NativeWind, boot wiring, mock toggle).
- `simplix scaffold <entity> --native` — generates an entity screen set (`EntityList` screen, push detail, full-screen form, expo-router routes, locale skeletons) from the OpenAPI-generated domain package.

## Build and test

```bash
# Typecheck / lint / test all native packages
pnpm --filter "@simplix-react-native/*" typecheck
pnpm --filter "@simplix-react-native-ext/*" typecheck

# Root pipeline includes these packages automatically
pnpm typecheck && pnpm test
```
