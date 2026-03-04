/** URL search params for CRUD page navigation. */
export interface CrudSearch {
  id?: string;
  mode?: "new" | "edit";
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

/** @internal */
export function buildCrudSearch(view: CrudView, id?: string): CrudSearch {
  if (view === "list") return {};
  if (view === "new") return { mode: "new" };
  if (view === "edit" && id) return { id, mode: "edit" };
  if (view === "detail" && id) return { id };
  return {};
}
