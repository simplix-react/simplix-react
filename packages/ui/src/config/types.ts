/**
 * Definition of a single remote-config query injected into {@link createAppConfig}.
 *
 * The host supplies the fetcher (and its react-query coordinates); the framework
 * runs it and distributes the result via the generated context — mirroring the
 * MenuProvider injection pattern.
 */
export interface RemoteConfigQueryDef<T> {
  /** react-query cache key. */
  queryKey: readonly unknown[];
  /** Host fetcher (e.g. an authenticated `/files/policy` request). */
  queryFn: (ctx: { signal?: AbortSignal }) => Promise<T>;
  /** Gate the query (e.g. only when authenticated). Defaults to enabled. */
  enabled?: boolean;
  /** Per-query staleTime (ms). */
  staleTime?: number;
}
