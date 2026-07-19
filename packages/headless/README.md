# @simplix-react/headless

Platform-neutral headless logic shared by the web UI kit (`@simplix-react/ui`) and the native UI kit (`@simplix-react-native/ui`). Nothing in this package touches the DOM or React Native — only plain TypeScript and React hooks that run on every platform.

## What it provides

| Area | Exports |
| --- | --- |
| Orval adapters | `adaptOrvalList`, `adaptOrvalGet`, `adaptOrvalCreate`, `adaptOrvalUpdate`, `adaptOrvalDelete`, `adaptOrvalOrder` |
| Searchable serialization | `buildSearchableParams`, `SearchOperator`, `makeFilterKey`, `parseFilterKey`, operator config tables |
| List contracts | `ListHook`, `ListHookResult`, `SortState`, `PaginationState`, `FilterState`, `EmptyReason`, `CrudMutation` |
| Toast store | `addToast`, `removeToast`, `useToastStore` (renderers live in each platform kit) |
| Formatting | `formatBytes`, `formatDateShort` / `formatDateMedium` / `formatDateTime` / `formatRelativeTime` / `formatDateRange` |
| Date math | `startOfDay` … `endOfYear`, `addDays` / `subDays`, `isSameDay` / `isSameMonth` / `isSameWeek`, `parseDate`, `asPlainDate` |
| Semantic-kind date/time encoding | `serializeInstant`, `decodeInstant`, `serializeCalendarDate`, `decodeCalendarDate`, `serializeWallClockTime`, `decodeWallClockTime`, `TimeValue` helpers |
| Theme registry | `THEMES`, `ColorTheme` — the color preset manifest shared by web CSS presets and the native token sheet |

## Consumption

`@simplix-react/ui` re-exports everything here, so web consumers keep importing from `@simplix-react/ui` unchanged. Native consumers (and `@simplix-react-native/ui` itself) import from `@simplix-react/headless` directly.

```ts
import { adaptOrvalList, buildSearchableParams, SearchOperator } from "@simplix-react/headless";
```

The list state machines are intentionally NOT here: the web page model (`useCrudList`) lives in `@simplix-react/ui`, the native feed model (`useEntityFeed`) lives in `@simplix-react-native/ui`. Both consume the same `ListHook` contract and `buildSearchableParams` serialization from this package.
