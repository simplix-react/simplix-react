/** URL search params for CRUD page navigation. */
export interface CrudSearch {
  id?: string;
  mode?: "new" | "edit";
  /**
   * Which tab of the page is open.
   *
   * <p>Addressable state like the record is: a reader who reloads, or who sends somebody the link,
   * is looking at a tab and expects to still be looking at it. Held here rather than in the page's
   * own `useState` — a page that keeps it locally loses it on every reload and shares a link that
   * opens somewhere else.
   */
  tab?: string;
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
  };
}

/** Derives the CRUD view from search params. */
export type CrudView = "list" | "detail" | "new" | "edit";

/** @internal */
export function parseCrudSearch(search: CrudSearch): { view: CrudView; selectedId?: string } {
  if (search.mode === "new") return { view: "new" };
  if (search.mode === "edit" && search.id) return { view: "edit", selectedId: search.id };
  if (search.id) return { view: "detail", selectedId: search.id };
  return { view: "list" };
}

/**
 * The search a view is addressed by.
 *
 * <p>`tab` survives every transition: opening a record from the third tab and closing it again
 * returns to the third tab, which is where the reader was.
 *
 * @internal
 */
export function buildCrudSearch(view: CrudView, id?: string, tab?: string): CrudSearch {
  const at = tab === undefined ? {} : { tab };
  if (view === "new") return { ...at, mode: "new" };
  if (view === "edit" && id) return { ...at, id, mode: "edit" };
  if (view === "detail" && id) return { ...at, id };
  return at;
}
