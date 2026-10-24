import { adaptOrvalList } from "@simplix-react/headless";
import type { AdaptOrvalListOptions, ListHook, OrvalListHookLike } from "@simplix-react/headless";
import type { FilterDef } from "../filters/filter-bar";

/**
 * A list hook whose narrowing the reader cannot type away.
 *
 * <p><b>Why not `transformFilters`.</b> That option looks like the place for this and is not: the
 * list state machine only puts a `filters` object into the request when the reader has committed
 * one, and `transformFilters` runs only when that object exists. A tab, a chip row or a scope
 * arriving in the address therefore narrows nothing at all on the first view of a screen — the
 * request goes out unnarrowed, the whole register comes back, and the tab above it still says the
 * count it would have had. Nothing errors, nothing is logged, and the number and the rows disagree
 * in the one place a reader would not check. Committing any filter makes it start working, which is
 * what makes it so easy to miss while testing.
 *
 * <p>Merging into the request parameters instead puts the narrowing outside that gate, and keeps it
 * in the query key — so switching tabs refetches rather than re-rendering the same answer.
 *
 * <p><b>The forced parameters win.</b> A tab is a statement about which records are being looked
 * at; a filter narrows within it.
 *
 * @typeParam T the row type
 * @param useApiHook the generated list hook
 * @param forced the parameters the tab or the address imposes, in the server's own filter grammar
 * @param options the same options `adaptOrvalList` takes
 * @returns a list hook for `useCrudList` in server mode
 */
export function adaptForcedList<T>(
  useApiHook: OrvalListHookLike,
  forced: Record<string, unknown>,
  options?: AdaptOrvalListOptions,
): ListHook<T> {
  // A forced value that is not known yet is `undefined`, and the request must not go out carrying
  // the key with nothing in it: the server refuses an empty condition as a malformed search rather
  // than answering with everything, the screen keeps the refusal, and the tab reads 「데이터를
  // 불러오지 못했습니다」 over a register that is there. There is no value in this position meaning
  // 「everything」 — a scope the reader has not got is not a scope of all records — so the query is
  // gated instead, and what comes back is an empty settled result rather than a spinner nothing
  // will ever end. A console with no workplace is a documented state, not a transient one.
  const known = Object.entries(forced).filter(([, value]) => value !== undefined);
  const ready = known.length === Object.keys(forced).length;
  const withForced: OrvalListHookLike = (params, hookOptions) =>
    useApiHook({ ...(params as object), ...Object.fromEntries(known) }, hookOptions);
  const inner = adaptOrvalList<T>(withForced, {
    ...options,
    queryOptions: { ...options?.queryOptions, ...(ready ? {} : { enabled: false }) },
  });
  return (params?: Record<string, unknown>) => {
    const result = inner(params);
    return ready ? result : { ...result, data: [], total: 0, isLoading: false, error: null };
  };
}

/**
 * The scope string {@link adaptForcedList}'s narrowing amounts to.
 *
 * <p>Pass it as `useCrudList`'s `scopeKey` beside every `adaptForcedList`. Without it the page
 * index survives a change of tab, chip or parent record and addresses a page of a result set that
 * no longer exists: the rows come back empty while the total that comes back with them is right,
 * so the toolbar states 「전체 57건」 over nothing. Reported from the 사용자 계정 tabs, where
 * paging into 활성 and then pressing 정지 drew a count over an empty table.
 *
 * <p>Keys are sorted, so two objects that force the same thing produce the same string whatever
 * order the caller built them in — otherwise a `useMemo` returning a differently-ordered object
 * would look like a change of scope and reset the reader's page under them.
 *
 * @param forced the parameters handed to {@link adaptForcedList}
 * @returns a stable string naming that narrowing
 */
export function forcedScope(forced: Record<string, unknown>): string {
  return Object.keys(forced)
    .sort()
    .map((key) => `${key}=${String(forced[key])}`)
    .join("&");
}

/** The suffix that makes a forced parameter a pin on one field. */
const PINS_ONE_VALUE = ".equals";

/**
 * The filters left once the ones the screen has already decided are taken out.
 *
 * <p><b>A tab that pins a field kills the filter over that same field.</b> {@link adaptForcedList}
 * merges the tab's parameters over the request AFTER the reader's filters, so on 설치됨 —
 * `status.equals: APPLIED` — the 상태 facet draws, opens, takes a selection, paints its badge in
 * the bar and changes not one row. There is nothing on the screen to say why, so it reads as a
 * broken control or as a register with nothing in it, and the reader's next move is to try it
 * again.
 *
 * <p><b>Deleting the filter is not the fix, because the same list is drawn on the tabs that do not
 * pin it.</b> Every tab strip in this console narrows a different axis per tab — 설치됨 pins
 * `status`, 미구독 pins `licensed`, 설치 이력 pins neither — so the control is right on three tabs
 * out of four and dead on the fourth. Which filters the bar offers is therefore a question about
 * the tab that is open, answered here, at the moment the bar is drawn.
 *
 * <p><b>`.equals` and nothing else.</b> A pin is a single value the request substitutes for
 * whatever the reader chose. `.in` is the opposite case — the screen forces a SET and a filter
 * narrows inside it, which is what a chip row is for — and `.greaterThan`, `.lessThan` and the
 * date bounds narrow an axis the reader can still narrow further.
 *
 * <p><b>Judged by the key rather than by its value.</b> A pin whose value has not arrived yet
 * (`siteId.equals: undefined`) still names a field this screen has decided, and
 * {@link adaptForcedList} holds the whole query closed until it does. Reading the value instead
 * would draw the control for as long as the read takes and then take it away under the reader.
 *
 * @param forced the parameters handed to {@link adaptForcedList}
 * @param filters the bar's full set, as the screen would draw it with nothing pinned
 * @returns the same filters, minus every one the screen has already decided
 */
export function filtersOutsideForced(
  forced: Record<string, unknown>,
  filters: readonly FilterDef[],
): FilterDef[] {
  const pinned = new Set(
    Object.keys(forced)
      .filter((key) => key.endsWith(PINS_ONE_VALUE))
      .map((key) => key.slice(0, -PINS_ONE_VALUE.length)),
  );
  if (pinned.size === 0) return [...filters];
  return filters.filter((filter) => !pinned.has(filter.field));
}

/** A list controller that carries the narrowing it was built under. */
export type UnderForced<L> = L & {
  /** The parameters this controller's every request is pinned with. */
  readonly forced: Record<string, unknown>;
};

/**
 * The list controller with the narrowing it was built under attached to it.
 *
 * <p><b>The filter bar is drawn by a component that never sees the tab.</b> A list widget takes
 * one prop — the controller its screen's hook built — and the parameters the tab pins are computed
 * either in that hook or in the page above it, so the one place that decides which filters to
 * offer is the one place with no way to know what the screen has already decided. Handing the
 * narrowing back with the controller is what closes that: `useCrudList`'s answer already carries
 * this list's `scopeKey`, and what pinned it belongs beside it.
 *
 * <p><b>Attached rather than passed as a second prop.</b> A prop is a line every render site has
 * to remember, and the one that forgets draws a dead control that nothing fails on — whereas a
 * hook cannot hand back a controller without the thing it was built from.
 *
 * @typeParam L the controller `useCrudList` returned
 * @param list that controller
 * @param forced the parameters handed to {@link adaptForcedList} beside it
 * @returns the same controller, carrying its narrowing
 */
export function withForced<L>(list: L, forced: Record<string, unknown>): UnderForced<L> {
  return { ...list, forced };
}
