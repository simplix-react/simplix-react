// ── Shared list / filter / pagination types ──
export type { SortState, PaginationState, FilterState, EmptyReason } from "./shared-types";
export type { ListHook, ListHookResult } from "./list-types";
export type { CrudMutation } from "./crud-mutation";

// ── Searchable param serialization ──
export { buildSearchableParams } from "./build-searchable-params";
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
export { addToast, removeToast, useToastStore } from "./toast-store";
export type { Toast } from "./toast-store";

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
