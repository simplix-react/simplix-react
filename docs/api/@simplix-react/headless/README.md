[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/headless

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

## Enumerations

- [SearchOperator](enumerations/SearchOperator.md)

## Interfaces

- [AdaptOrvalListOptions](interfaces/AdaptOrvalListOptions.md)
- [BuildSearchableParamsOptions](interfaces/BuildSearchableParamsOptions.md)
- [ColorTheme](interfaces/ColorTheme.md)
- [CrudMutation](interfaces/CrudMutation.md)
- [DateRange](interfaces/DateRange.md)
- [FilterState](interfaces/FilterState.md)
- [ListHook](interfaces/ListHook.md)
- [ListHookResult](interfaces/ListHookResult.md)
- [OrvalGetQueryFields](interfaces/OrvalGetQueryFields.md)
- [OrvalGetResultLike](interfaces/OrvalGetResultLike.md)
- [OrvalMutationLike](interfaces/OrvalMutationLike.md)
- [PaginationState](interfaces/PaginationState.md)
- [SearchableListParams](interfaces/SearchableListParams.md)
- [SortState](interfaces/SortState.md)
- [TimeValue](interfaces/TimeValue.md)
- [Toast](interfaces/Toast.md)

## Type Aliases

- [DateLike](type-aliases/DateLike.md)
- [EmptyReason](type-aliases/EmptyReason.md)
- [OrvalListHookLike](type-aliases/OrvalListHookLike.md)

## Variables

- [dateOperatorConfig](variables/dateOperatorConfig.md)
- [numberOperatorOrder](variables/numberOperatorOrder.md)
- [selectOperatorConfig](variables/selectOperatorConfig.md)
- [textOperatorOrder](variables/textOperatorOrder.md)
- [THEMES](variables/THEMES.md)

## Functions

- [adaptOrvalCreate](functions/adaptOrvalCreate.md)
- [adaptOrvalDelete](functions/adaptOrvalDelete.md)
- [adaptOrvalGet](functions/adaptOrvalGet.md)
- [adaptOrvalList](functions/adaptOrvalList.md)
- [adaptOrvalOrder](functions/adaptOrvalOrder.md)
- [adaptOrvalUpdate](functions/adaptOrvalUpdate.md)
- [addDays](functions/addDays.md)
- [addToast](functions/addToast.md)
- [asPlainDate](functions/asPlainDate.md)
- [asZonedInstant](functions/asZonedInstant.md)
- [buildSearchableParams](functions/buildSearchableParams.md)
- [clampTimeValue](functions/clampTimeValue.md)
- [clampToRange](functions/clampToRange.md)
- [decodeCalendarDate](functions/decodeCalendarDate.md)
- [decodeInstant](functions/decodeInstant.md)
- [decodeWallClockTime](functions/decodeWallClockTime.md)
- [endOfDay](functions/endOfDay.md)
- [endOfMonth](functions/endOfMonth.md)
- [endOfWeek](functions/endOfWeek.md)
- [endOfYear](functions/endOfYear.md)
- [formatBytes](functions/formatBytes.md)
- [formatDateMedium](functions/formatDateMedium.md)
- [formatDateRange](functions/formatDateRange.md)
- [formatDateShort](functions/formatDateShort.md)
- [formatDateTime](functions/formatDateTime.md)
- [formatRelativeTime](functions/formatRelativeTime.md)
- [formatWallClockTime](functions/formatWallClockTime.md)
- [generateLocalId](functions/generateLocalId.md)
- [generateYears](functions/generateYears.md)
- [getFilterLayout](functions/getFilterLayout.md)
- [getMonthNames](functions/getMonthNames.md)
- [insertFilterSeparators](functions/insertFilterSeparators.md)
- [isHourDisabled](functions/isHourDisabled.md)
- [isHourOutOfRange](functions/isHourOutOfRange.md)
- [isMinuteDisabled](functions/isMinuteDisabled.md)
- [isMinuteOutOfRange](functions/isMinuteOutOfRange.md)
- [isSameDay](functions/isSameDay.md)
- [isSameMonth](functions/isSameMonth.md)
- [isSameWeek](functions/isSameWeek.md)
- [isYearFirstLocale](functions/isYearFirstLocale.md)
- [makeFilterKey](functions/makeFilterKey.md)
- [padTimeUnit](functions/padTimeUnit.md)
- [parseDate](functions/parseDate.md)
- [parseFilterKey](functions/parseFilterKey.md)
- [parseRfc3339](functions/parseRfc3339.md)
- [removeToast](functions/removeToast.md)
- [serializeCalendarDate](functions/serializeCalendarDate.md)
- [serializeInstant](functions/serializeInstant.md)
- [serializeRfc3339Local](functions/serializeRfc3339Local.md)
- [serializeWallClockTime](functions/serializeWallClockTime.md)
- [startOfDay](functions/startOfDay.md)
- [startOfMonth](functions/startOfMonth.md)
- [startOfWeek](functions/startOfWeek.md)
- [startOfYear](functions/startOfYear.md)
- [subDays](functions/subDays.md)
- [to12Hour](functions/to12Hour.md)
- [to24Hour](functions/to24Hour.md)
- [toBcp47](functions/toBcp47.md)
- [toLocalDateString](functions/toLocalDateString.md)
- [useToastStore](functions/useToastStore.md)
- [withTime](functions/withTime.md)
- [wrapValue](functions/wrapValue.md)
