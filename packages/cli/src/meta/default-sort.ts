/** The order a generated list opens in. */
export interface DefaultSort {
  readonly field: string;
  readonly direction: "asc" | "desc";
}

/** A field a project names as a default sort candidate, newest first unless it says otherwise. */
export type DefaultSortCandidate = string | { readonly field: string; readonly direction?: "asc" | "desc" };

/** What {@link chooseDefaultSort} reads. */
export interface DefaultSortInput {
  /** The order the entity's SimpliX Meta declares (`entities.<name>.defaultSort`). */
  readonly declared?: { readonly field: string; readonly direction?: "asc" | "desc" };
  /** The project's candidates, in order (`scaffold.defaultSortFields`). */
  readonly candidates?: readonly DefaultSortCandidate[];
  /** The fields the list row carries, with whether the backend can order by each. */
  readonly fields: readonly { readonly name: string; readonly sortable?: boolean }[];
  /** The field a row is addressed by, which never orders a list a reader reads. */
  readonly rowIdField: string;
}

/**
 * The order a generated list opens in: the one the entity declares, else the first project
 * candidate the row carries and the backend can order by, else none, so the server's own order
 * stands. Never the row's key: a list ordered by an opaque id is in no order a reader can use.
 *
 * <p>A declared field the row does not carry, or one the backend states it cannot order by, is
 * passed over: the first request would be refused.
 *
 * @param input the declaration, the candidates and the row's fields
 * @returns the order, or `undefined` for the server's own
 */
export function chooseDefaultSort(input: DefaultSortInput): DefaultSort | undefined {
  const usable = (name: string, strict: boolean) => {
    if (name === input.rowIdField) return false;
    const field = input.fields.find((one) => one.name === name);
    if (!field) return false;
    return strict ? field.sortable === true : field.sortable !== false;
  };
  if (input.declared && usable(input.declared.field, false)) {
    return { field: input.declared.field, direction: input.declared.direction ?? "desc" };
  }
  for (const candidate of input.candidates ?? []) {
    const one = typeof candidate === "string" ? { field: candidate } : candidate;
    if (usable(one.field, true)) return { field: one.field, direction: one.direction ?? "desc" };
  }
  return undefined;
}

/**
 * The fields of a list with the one it opens sorted by shown even when it is an audit stamp.
 *
 * <p>A generated list leaves the record stamps out of its columns and filters: the detail's audit
 * strip carries them. An entity whose rows are events (a log, a ledger) is read by when a row was
 * written, and its default sort names that stamp; the column the order reads off and the period
 * filter that narrows it are then the list's own, so the stamp keeps both.
 *
 * @param fields the list's fields, each with its audit flag
 * @param sort the order the list opens in
 * @returns the fields, the sorted-by one no longer flagged as an audit stamp
 */
export function withSortKeyShown<F extends { readonly name: string; readonly isAuditField?: boolean }>(
  fields: readonly F[],
  sort: DefaultSort | undefined,
): F[] {
  return fields.map((field) => (sort && field.name === sort.field && field.isAuditField ? { ...field, isAuditField: false } : field));
}
