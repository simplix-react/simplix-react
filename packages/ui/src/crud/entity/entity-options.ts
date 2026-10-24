import { useEffect, useMemo } from "react";

import { adaptOrvalGet } from "@simplix-react/headless";

/**
 * A `{ label, value }` option consumed by both {@link EntityCombobox} and the
 * FilterBar faceted filter. Deliberately icon-free: the two consumers type their
 * optional `icon` differently (ReactNode vs a component type), so an option that
 * omits it stays assignable to both.
 */
export interface EntityOption {
  label: string;
  value: string;
}

/** How much of an id a fallback label keeps before it stops being readable. */
const ID_PREFIX_LENGTH = 8;

/**
 * Shortens an id for the fallback label a picker shows while the row behind the
 * current value is still being resolved.
 *
 * @param id the entity id
 * @returns the id, truncated with an ellipsis once it is longer than a glance
 */
export function shortEntityId(id: string): string {
  return id.length > ID_PREFIX_LENGTH ? `${id.slice(0, ID_PREFIX_LENGTH)}…` : id;
}

/** Configuration for {@link createEntityOptions}. */
export interface EntityOptionsConfig<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg,
> {
  /** The domain's Orval list hook (called unconditionally inside the returned hook). */
  useList: (params: TParams, options?: { query?: { enabled?: boolean } }) => TQuery;
  /** Batch request params — include `{ page: 0, size: 1000 }` plus any fixed filters. */
  listParams: TParams;
  /**
   * FK id per row; rows whose value is empty/undefined are dropped. Annotate the
   * row parameter (e.g. `(t: ListXResponse["content"][number])`) so
   * the item type is bound to the real list body.
   */
  getValue: (item: TItem) => string | undefined;
  /** Display label per row; receives the caller arg so it can add discriminators. */
  getLabel: (item: TItem, arg: TArg) => string;
  /** Optional row predicate (site scoping / active-only / exclude-self). */
  filter?: (item: TItem, arg: TArg) => boolean;
  /** Optional gate hook — skips the request when it returns false (e.g. a permission check). */
  useEnabled?: () => boolean;
  /** Optional side effect per fresh page (e.g. publishing a name directory). */
  onData?: (items: TItem[]) => void;
}

const ALWAYS_ENABLED = () => true;

/**
 * Builds a batch-loaded `{ label, value }` options hook for an FK entity list —
 * the single loader a combobox and any faceted filter over the same directory
 * share (React Query dedupes the one request). A factory rather than a plain
 * generic hook because the domain list hook must be called unconditionally
 * inside the returned hook.
 *
 * <p><b>Only for a bounded catalogue</b> — a set an administrator authors and can
 * count: organizations, visit types, leave types, shift definitions. One request
 * fetches the whole of it, every consumer of the directory shares that request,
 * and a row deactivated years ago still resolves to its name in an old record.
 *
 * <p>It is the wrong loader for anything that accumulates — a person, a customer,
 * a contract, an issued key, one row per transaction. Past the batch size the
 * option list is silently short: a row that exists cannot be found and nothing
 * says why. Those ask the server per query instead — {@link createEntitySearch}
 * for a form picker, {@link createEntityFacet} for a list filter. When in doubt
 * about which side a directory falls on, assume it grows.
 *
 * @returns A `useXOptions(arg?)` hook yielding `{ options, isLoading }`.
 */
export function createEntityOptions<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg = void,
>(
  cfg: EntityOptionsConfig<TItem, TParams, TQuery, TArg>,
): (arg?: TArg) => { options: EntityOption[]; isLoading: boolean } {
  const resolvedUseEnabled = cfg.useEnabled ?? ALWAYS_ENABLED;

  return function useEntityOptions(arg?: TArg) {
    const enabled = resolvedUseEnabled();
    const query = adaptOrvalGet<{ content?: TItem[] }, TQuery>(
      cfg.useList(cfg.listParams, { query: { enabled } }),
    );
    const rows = query.data?.content ?? [];

    useEffect(() => {
      cfg.onData?.(query.data?.content ?? []);
      // Fire per fresh page; `cfg` is stable across renders (created once by the factory).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data]);

    const options = useMemo<EntityOption[]>(() => {
      const a = arg as TArg;
      return rows
        .filter((it) => !!cfg.getValue(it))
        .filter((it) => (cfg.filter ? cfg.filter(it, a) : true))
        .map((it) => ({ label: cfg.getLabel(it, a), value: cfg.getValue(it)! }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data, arg]);

    return { options, isLoading: query.isLoading };
  };
}
