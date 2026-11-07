// ── Shared list / filter / pagination types ──
export type { SortState, PaginationState, FilterState, EmptyReason } from "./shared-types";
export type { ListHook, ListHookResult } from "./list-types";
export { resolveEmptyReason } from "./resolve-empty-reason";
export type { ResolveEmptyReasonInput } from "./resolve-empty-reason";
export type { CrudMutation } from "./crud-mutation";

// ── Searchable param serialization ──
export { buildSearchableParams, SEARCHABLE_KEYWORD_PARAM } from "./build-searchable-params";
export type { SearchableListParams, BuildSearchableParamsOptions } from "./build-searchable-params";

// ── Orval adapters ──
export { adaptOrvalList } from "./adapt-orval-list";
export type { OrvalListHookLike, AdaptOrvalListOptions } from "./adapt-orval-list";
export { adaptOrvalGet } from "./adapt-orval-get";
export type { OrvalGetResultLike, OrvalGetQueryFields } from "./adapt-orval-get";
export { adaptOrvalCreate, adaptOrvalUpdate, adaptOrvalDelete, adaptOrvalOrder } from "./adapt-orval-mutation";
export type { OrvalMutationLike } from "./adapt-orval-mutation";

// ── Filter vocabulary ──
export {
  SearchOperator,
  dateOperatorConfig,
  selectOperatorConfig,
  textOperatorOrder,
  numberOperatorOrder,
} from "./filter-types";
export type { DateRange } from "./filter-types";
export { makeFilterKey, parseFilterKey, getFilterLayout, insertFilterSeparators } from "./filter-utils";

// ── Toast store ──
export { addToast, removeToast, runToastAction, useToastStore } from "./toast-store";
export type { Toast, ToastAction } from "./toast-store";

// ── Formatting utilities ──
export { formatBytes } from "./format-bytes";
export {
  toBcp47,
  isYearFirstLocale,
  getMonthNames,
  generateYears,
  formatDateShort,
  formatDateMedium,
  toLocalDateString,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
} from "./format-date";

// ── Date math ──
export {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  addDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
} from "./date-math";
export { asPlainDate, parseDate } from "./parse-date";
export type { DateLike } from "./parse-date";

// ── Semantic-kind date / time encoding ──
export {
  serializeInstant,
  serializeRfc3339Local,
  decodeInstant,
  parseRfc3339,
  asZonedInstant,
  serializeCalendarDate,
  decodeCalendarDate,
  serializeWallClockTime,
  decodeWallClockTime,
  formatWallClockTime,
} from "./rfc3339-date";
export {
  to12Hour,
  to24Hour,
  wrapValue,
  withTime,
  isHourDisabled,
  isMinuteDisabled,
  clampToRange,
  padTimeUnit,
  isHourOutOfRange,
  isMinuteOutOfRange,
  clampTimeValue,
} from "./time-select";
export type { TimeValue } from "./time-select";

// ── Local ids ──
export { generateLocalId } from "./local-id";

// ── Theme registry ──
export { THEMES } from "./theme-manifest";
export type { ColorTheme } from "./theme-manifest";

// ── Application helpers: zones and dates, clipboard, list and form state ──
export { APP_TIME_ZONE, configureAppTimeZone, getAppTimeZone, useAppTimeZone } from "./datetime/app-timezone";
export { browserZoneLabel, offsetAsUtc, withBrowserZone, zoneLabel } from "./datetime/browser-zone-label";
export { daysUntilDay } from "./datetime/days-until";
export { elapsedSpan, elapsedSpanBetween, elapsedSpanOf } from "./datetime/elapsed-span";
export type { ElapsedSpan, ElapsedUnit } from "./datetime/elapsed-span";
export { periodStanding } from "./datetime/period-distance";
export type { PeriodStanding } from "./datetime/period-distance";
export { calendarDayLabel, pickedCalendarDay, zoneCalendarDate, zoneDayRange, zoneDayShifted, zoneDayStartInstant, zoneLastDaysRange, zoneMonthRange, zonePickedDayRange, zonePickedMonthRange, zonePickedWeekRange, zoneWeekRange } from "./datetime/zone-bounds";
export type { CalendarDayStyle, ZoneInstantRange } from "./datetime/zone-bounds";
export { useRollingWindow, useZoneToday } from "./datetime/zone-clock";
export type { RollingWindowOptions, ZoneToday } from "./datetime/zone-clock";
export { isSameZoneDay, timeAtOrAfter, timePlusHours, zoneClockOf, zoneDateTimeText, zoneDayOf, zoneInstantAt, zoneInstantOnDayOf, zoneTimeOf } from "./datetime/zone-time";
export { copyText } from "./clipboard/copy-text";
export type { CopyOutcome } from "./clipboard/copy-text";
export { installClipboardFallback } from "./clipboard/install-clipboard-fallback";
export { installRandomUUIDFallback, randomUUIDFrom } from "./crypto/install-random-uuid-fallback";
export { missingRequired } from "./entity/missing-required";
export { paginationHandlers } from "./entity/pagination-handlers";
export type { PaginationHandlers } from "./entity/pagination-handlers";
export { useDebouncedValue } from "./entity/use-debounced-value";
export { useOnline } from "./entity/use-online";

// ── In-memory filtering ──
export { matchesFilter } from "./client-filter";
