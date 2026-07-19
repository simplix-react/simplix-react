/**
 * Minimal shape required of an Orval-generated single-resource query result:
 * only `data` is needed at the boundary. Orval types `data` as the raw HTTP
 * envelope (`{ data, status, headers }`), but the boot mutator unwraps it at
 * runtime so `data` is the plain entity DTO. This adapter bridges that gap.
 */
export interface OrvalGetResultLike {
  data: unknown;
}

/**
 * Common React Query fields preserved when the query type is not supplied
 * explicitly. Used as the default for the `Q` type parameter so the single
 * type-argument form (`adaptOrvalGet<Dto>(query)`) keeps the usual fields.
 */
export interface OrvalGetQueryFields {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isSuccess: boolean;
  refetch: (...args: never[]) => unknown;
}

/**
 * Re-type an Orval-generated GET/detail query result so `data` is the entity
 * DTO (`T | undefined`) instead of the raw response envelope, while preserving
 * the other query fields (`isLoading`, `isError`, `error`, `refetch`, …).
 *
 * Read-side counterpart of {@link adaptOrvalList}. It is runtime-safe: the same
 * query object reference is returned unchanged — only its static type narrows.
 * The boot mutator already unwraps the Boot envelope, so `query.data` is the
 * plain DTO at runtime; this adapter aligns the type with that reality and
 * removes the need for `as any` casts at call sites.
 *
 * @typeParam T - Entity DTO type the endpoint resolves to.
 * @typeParam Q - Query result type; inferred when passed explicitly (e.g.
 *   `adaptOrvalGet<Dto, typeof query>(query)`) to preserve every field, or the
 *   common-fields default for the single-argument form.
 * @param query - Result of an Orval-generated `useGet*` query hook.
 * @returns The same query object with `data` typed as `T | undefined`.
 *
 * @example
 * ```ts
 * // Single type argument — preserves the common React Query fields:
 * const { data, isLoading } = adaptOrvalGet<Company>(useGetCompany(id));
 * //      ^? Company | undefined
 *
 * // Two type arguments — preserves the exact query result type:
 * const q = useGetCompany(id);
 * const { data, refetch } = adaptOrvalGet<Company, typeof q>(q);
 * ```
 */
export function adaptOrvalGet<
  T,
  Q extends OrvalGetResultLike = OrvalGetResultLike & OrvalGetQueryFields,
>(query: Q): Omit<Q, "data"> & { data: T | undefined } {
  return query as unknown as Omit<Q, "data"> & { data: T | undefined };
}
