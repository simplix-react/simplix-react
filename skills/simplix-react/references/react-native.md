# React Native (simplix-react-native)

How to build native (Expo) apps in a simplix workspace. The native extension reproduces the framework philosophy — package-first, OpenAPI-driven, derived hooks, FSD — on React Native. Contracts and logic are REUSED; screen grammar is NEW. Web component names never carry over.

## Non-negotiable invariants (native)

1. **Standard kit first.** Before writing any custom native component, check the commonization registry below. `@simplix-react-native/ui` pre-builds the standard kit; a pattern that exists there must not be re-implemented in a module or app. Project-specific shared pieces get promoted to the project's own shared native package — never left inline in `modules/` or `apps/`.
2. **No web-to-RN porting.** There is no `CrudList`, `ListDetail`, `CrudForm`, or `usePageHeader` on native. Use the mobile grammar:

   | Web grammar | Native grammar |
   | --- | --- |
   | `CrudList.Table` + FilterBar + pagination | `EntityList` — card rows, search bar, filter sheet, infinite scroll |
   | `ListDetail` side panel | Full-screen push detail + pinned bottom action bar (`MasterDetail` only on tablet landscape) |
   | `CrudForm` page + popover pickers | Full-screen form — keyboard-avoiding scroll, sheet pickers, `StepFlow` for long forms |
   | Dialog-centric interaction | Sheet-first — `AlertDialog` only for destructive confirmation |
   | `usePageHeader` registration | expo-router `Stack.Screen` options |

3. **Generator-first, native edition.** A screen listing a growing collection is ALWAYS built as: backend paged searchable endpoint → `simplix scaffold <entity> --native` → customize the generated `EntityList` screen. Hand-assembling a screen set from scratch is a defect. Device-layer flows (capture, signature, kiosk step screens) are not generation targets. Convention fixes go into the CLI templates (`packages/cli/src/templates/native*/*.hbs`), never per instance.
4. **Native packages ship source.** `@simplix-react-native/*` exports point at `src/` — Metro transpiles them and NativeWind extracts classes from package sources. Consequences: the app's `tailwind.config.js` must include the kit sources in `content`, and there is no build step to "fix" output in — the source is the artifact.
5. **Shared logic comes from `@simplix-react/headless`.** Searchable serialization (`buildSearchableParams`, `SearchOperator`, `makeFilterKey`), Orval adapters (`adaptOrval*`), the toast store, formatting and semantic-kind date/time helpers are platform-neutral and shared with the web. Never duplicate them natively. The list state machines are deliberately NOT shared: web `useCrudList` (page model) vs native `useEntityFeed` (feed model).
6. **Theme tokens only.** Every kit component references the token sheet (same token names as the web CSS variables, resolved by `SimplixThemeProvider` + the package tailwind preset). Palette-literal styling belongs only in the `STATUS_TONES` vocabulary. Presets mirror the web `THEMES` manifest.
7. **Device seams are injected.** The capture package defines the `FaceDetectorAdapter` seam and a complete session state machine (composition judgement, sustain, countdown, retake, manual fallback); the concrete ML Kit binding is the app's choice. Lock Task Mode is Android-only — gate with `isLockTaskAvailable()`; iPadOS stays on Guided Access / MDM.
8. **Unattended-device hygiene.** Kiosk-style apps wrap the tree in `IdleResetProvider` (discard in-progress input on idle) and `NetworkRecoveryGate` (full-screen recovery, reset on reconnect). Personal data must never survive an idle reset.

## Commonization registry (standard kit)

| Need | Use | Package |
| --- | --- | --- |
| Layout | `Stack` `Flex` `Grid` `Section` `Card` `Container` `Heading` `Text` (same prop language as web) | `@simplix-react-native/ui` |
| Page skeleton | `Screen` (scroll/safe-area/keyboard) · `StepFlow` + `useStepFlow` · `MasterDetail` + `useIsWideLayout` | `@simplix-react-native/ui` |
| Controls | `Button` (incl. `size="touch"`) · `Label` · `Badge` · `StatusBadge` · `BooleanBadge` · `EmptyValue` · `Separator` · `Skeleton` · `StatusDot` · `AlertBanner` · `ToastHost` · `STATUS_TONES` | `@simplix-react-native/ui` |
| Overlays | `BottomSheet` · `Dialog` · `AlertDialog` · `Popover` · `OverlayPortalHost` | `@simplix-react-native/ui` |
| Nav & input | `Tabs` · `ActionSheetMenu` · `Input` · `Textarea` · `NumberInput` · `Checkbox` · `RadioGroup` · `Switch` · `SelectSheet` · `ComboboxSheet` · `NativeDateTimePicker` | `@simplix-react-native/ui` |
| Form fields | `FormFields.*` — Text, Textarea, Number, Password, Phone, Country, Select, MultiSelect, Combobox, Checkbox, Switch, Date, DateRange, DateTime, Time, Image, File | `@simplix-react-native/ui` |
| Detail fields | `DetailFields.*` — Text, Status, Badge, Boolean, Date, Number, Phone, Note, List, Link | `@simplix-react-native/ui` |
| List machine | `EntityList` + `EntityList.Row` + `useEntityFeed` + `SwipeableRow` + `EntityFilterDef` | `@simplix-react-native/ui` |
| Boot | `SimplixNativeProvider` · `createNativeQueryClient` · `createNativeI18n` · `configureNativeBootMutator` · token stores (`createSecureTokenStore`, `createAsyncStorageTokenStore`) · `startNativeMocks` · `dispatchError` | `@simplix-react-native/runtime` |
| Camera capture | `CameraPreview` · `useAutoCaptureSession` · `useDetectorPolling` · `GuideFrame` · `CountdownOverlay` via `GuideFrame` · `CapturePreview` · `capturePhotoFormDataPart` | `@simplix-react-native-ext/capture` |
| Signature | `SignaturePad` (drawn/typed → PNG) · `signatureFormDataPart` | `@simplix-react-native-ext/signature` |
| QR | `QrCodeView` · `RotatingTokenQr` | `@simplix-react-native-ext/qr` |
| Kiosk control | `useKeepAwake` · `startLockTask` / `isLockTaskAvailable` · `IdleResetProvider` · `NetworkRecoveryGate` | `@simplix-react-native-ext/kiosk` |

Every kit string ships en/ko/ja through i18n self-registration (`simplix/native*` namespaces) — mounting the runtime provider is enough.

## CLI

```bash
# Expo app shell: expo-router, NativeWind, boot wiring, mock toggle
simplix add-app <name> --native

# Native entity screen set from the generated domain package:
# EntityList screen, push detail, full-screen form, expo-router routes, locale skeletons
simplix scaffold <entity> --native --module <module> [--app <app>]
```

`scaffold --native` maps the OpenAPI artifacts exactly like the web scaffold: SearchDTO → filter sheet definitions, ListDTO → card-row typing, DetailDTO → `DetailFields`, Create/UpdateDTO → `FormFields`. Generated screens take navigation callbacks; the route wrappers own expo-router wiring, keeping modules router-agnostic.

## App boot composition

```tsx
// src/app/boot.ts — module scope, before first render
export const tokenStore = createSecureTokenStore();
configureNativeBootMutator({ baseUrl, getToken: () => tokenStore.get("access_token") });
export const queryClient = createNativeQueryClient();
export const i18n = createNativeI18n({ defaultLocale, supportedLocales });
export const bootReady = Promise.all([i18n.i18nReady, tokenStore.hydrate()]);

// app/_layout.tsx
<SimplixNativeProvider queryClient={queryClient} i18nAdapter={i18n.adapter} ready={bootReady}>
  <Stack />
</SimplixNativeProvider>
```

The provider mounts the toast host, the global error dialog, and the overlay portal; boot gates render a spinner until settled. Token stores are async-hydrated behind the synchronous `TokenStore` contract — reads before `hydrate()` throw by design.
