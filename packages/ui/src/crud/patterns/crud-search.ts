/**
 * The list filters an address carries: each key is a filter key (`field.operator`, such as
 * `status.in`), each value one string or an array of strings.
 *
 * <p>This is the form a link can hold. The list's own state may hold booleans, numbers and dates, and
 * the list reads them back from here by the type of the control that owns the key; see
 * `AddressedFilters`.
 */
export type CrudSearchFilters = Record<string, string | string[]>;

/** How a navigation is recorded by the router. */
export interface CrudNavigateOptions {
  /**
   * Replace the current history entry instead of adding one. A change the reader makes while
   * staying on the same view (narrowing a list) is written this way, so the Back button leaves the
   * screen instead of stepping through every filter the reader tried.
   */
  replace?: boolean;
}

/** URL search params for CRUD page navigation. */
export interface CrudSearch {
  id?: string;
  mode?: "new" | "edit";
  /**
   * Which tab of the page is open.
   *
   * <p>Addressable state like the record is: a reader who reloads, or who sends somebody the link,
   * is looking at a tab and expects to still be looking at it. Held here rather than in the page's
   * own `useState`, because a page that keeps it locally loses it on every reload and shares a link
   * that opens somewhere else.
   */
  tab?: string;
  /**
   * The list filters the page opens with, and the ones the reader has applied since.
   *
   * <p>Addressable for the same reason the tab is, and so that a link can carry a count's own
   * condition: a tile reading "4 failed jobs" opens the list filtered to those four jobs rather than
   * to every job. `id`, `mode` and `tab` are reserved and never appear inside it.
   *
   * <p>The framework knows no entity's filter keys. A page narrows this object to the keys its list
   * declares before applying it, so a stale link never sends a parameter the server refuses.
   */
  filters?: CrudSearchFilters;
}

/** The search keys that address the view, never filter keys. */
const RESERVED_KEYS: ReadonlySet<string> = new Set(["id", "mode", "tab"]);

/** The one string, or the strings, a filter value may be; anything else is not a value a link carries. */
function filterValue(raw: unknown): string | string[] | undefined {
  if (typeof raw === "string") return raw === "" ? undefined : raw;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const members: string[] = [];
  for (const member of raw) {
    if (typeof member !== "string") return undefined;
    if (member !== "") members.push(member);
  }
  return members.length === 0 ? undefined : members;
}

/**
 * Reads the filters out of a raw search value, dropping what is not a filter.
 *
 * <p>Nothing here throws: a value that is not an object, a nested object, a number, a boolean, an
 * array holding anything but strings and an empty value are dropped, and so is a key that
 * names the view (`id`, `mode`, `tab`). A one-element array stays an array. When nothing is left the
 * result is `undefined`, so an address with no filters carries no `filters` key at all.
 */
function validateFilters(raw: unknown): CrudSearchFilters | undefined {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return undefined;
  const kept: [string, string | string[]][] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (key === "" || RESERVED_KEYS.has(key)) continue;
    const read = filterValue(value);
    if (read !== undefined) kept.push([key, read]);
  }
  // `fromEntries` defines each key as an own property, so a key named `__proto__` stays data.
  return kept.length === 0 ? undefined : Object.fromEntries(kept);
}

/**
 * Validates and extracts CRUD search params from a raw search object.
 * Use as `validateSearch` in TanStack Router route definitions.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute("/buildings/")({
 *   component: BuildingsRoute,
 *   validateSearch: validateCrudSearch,
 * });
 * ```
 */
export function validateCrudSearch(search: Record<string, unknown>): CrudSearch {
  return {
    id: typeof search.id === "string" ? search.id : undefined,
    mode: search.mode === "new" || search.mode === "edit" ? search.mode : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
    filters: validateFilters(search.filters),
  };
}

/** Derives the CRUD view from search params. */
export type CrudView = "list" | "detail" | "new" | "edit";

/** @internal */
export function parseCrudSearch(search: CrudSearch): {
  view: CrudView;
  selectedId?: string;
  filters?: CrudSearchFilters;
} {
  const filters = search.filters === undefined ? {} : { filters: search.filters };
  if (search.mode === "new") return { view: "new", ...filters };
  if (search.mode === "edit" && search.id) return { view: "edit", selectedId: search.id, ...filters };
  if (search.id) return { view: "detail", selectedId: search.id, ...filters };
  return { view: "list", ...filters };
}

/**
 * The search a view is addressed by.
 *
 * <p>`tab` and `filters` survive every transition: opening a record from the third tab and closing
 * it again returns to the third tab, and opening a record from a filtered list and closing it
 * returns to the same filtered list, which is where the reader was.
 *
 * @internal
 */
export function buildCrudSearch(
  view: CrudView,
  id?: string,
  tab?: string,
  filters?: CrudSearchFilters,
): CrudSearch {
  const at = {
    ...(tab === undefined ? {} : { tab }),
    ...(filters === undefined ? {} : { filters }),
  };
  if (view === "new") return { ...at, mode: "new" };
  if (view === "edit" && id) return { ...at, id, mode: "edit" };
  if (view === "detail" && id) return { ...at, id };
  return at;
}
