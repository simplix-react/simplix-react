import { useEffect, useRef, useSyncExternalStore } from "react";

import type { RouterAdapter, RouterBlockRequest } from "./router-provider";

/** The search key a page's list filters travel under; see `CrudSearch.filters`. */
const FILTERS_KEY = "filters";

/** One list filter in the address: `filters[status.in]=FAILED`, an array repeated once per member. */
const FILTER_PARAM = /^filters\[(.+)]$/;

/** The text a filter value is written as, or `undefined` for a value an address cannot carry. */
function filterText(value: unknown): string | undefined {
  if (typeof value === "string") return value === "" ? undefined : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

/**
 * A URL's search as a flat map of strings, written and read the same way on every route.
 *
 * @remarks
 * TanStack Router's own serializer writes every value as JSON, so a list filter `status=ACTIVE`
 * reaches the address bar as `status=%22ACTIVE%22` and a shared link stops reading back the way
 * the framework's list state wrote it. A list screen keeps its state as plain strings
 * (`status.in=ACTIVE,PAUSED`), so the search is kept flat: empty, `null` and `undefined` values are
 * left out, everything else is written with `String()`, and parsing hands back strings.
 *
 * The one exception is the page's list filters, `CrudSearch.filters`: an object of filter keys
 * to a string or an array of strings. It is written as one parameter per filter in the bracket form
 * (`filters[status.in]=FAILED`, `filters[status.in]=FAILED&filters[status.in]=PAUSED` for an
 * array) and read back into an object. A filter held once reads back as a string even if it was
 * written as a one-element array; the list reads a set's operators (`in`, `notIn`) as arrays either
 * way. Writing the filters as top-level keys is not possible, because nothing could then tell
 * a filter from the other keys a page keeps in its search.
 *
 * @example
 * ```ts
 * const router = createRouter({ routeTree, ...flatSearch });
 * flatSearch.stringifySearch({ filters: { "status.in": ["FAILED"] } });
 * // "?filters%5Bstatus.in%5D=FAILED"
 * ```
 */
export const flatSearch = {
  stringifySearch(search: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (key === FILTERS_KEY && typeof value === "object" && value !== null && !Array.isArray(value)) {
        for (const [name, held] of Object.entries(value)) {
          const members = Array.isArray(held) ? held : [held];
          for (const member of members) {
            const text = filterText(member);
            if (text !== undefined) params.append(`${FILTERS_KEY}[${name}]`, text);
          }
        }
        continue;
      }
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const text = params.toString();
    return text ? `?${text}` : "";
  },
  parseSearch(searchStr: string): Record<string, string | Record<string, string | string[]>> {
    const search: Record<string, string | Record<string, string | string[]>> = {};
    const held = new Map<string, string[]>();
    for (const [key, value] of new URLSearchParams(searchStr).entries()) {
      const filter = FILTER_PARAM.exec(key);
      if (filter?.[1] === undefined) {
        search[key] = value;
        continue;
      }
      held.set(filter[1], [...(held.get(filter[1]) ?? []), value]);
    }
    if (held.size > 0) {
      search[FILTERS_KEY] = Object.fromEntries([...held].map(([name, members]) => [name, members.length === 1 ? (members[0] ?? "") : members]));
    }
    return search;
  },
} as const;

/**
 * The part of a TanStack Router instance the adapter reads, so this package needs no dependency
 * on the router: any `createRouter(...)` result has it.
 */
export interface TanstackRouterLike {
  readonly state: { readonly location: { readonly pathname: string; readonly searchStr: string } };
  navigate(options: { to: string; search?: Record<string, string>; replace?: boolean }): Promise<unknown>;
  subscribe(eventType: "onBeforeLoad" | "onLoad" | "onResolved", fn: () => void): () => void;
  /**
   * The router's history. Its `block` registers a function asked before every navigation, and a
   * truthy answer holds the navigation back. Without it the adapter offers no `useBlocker`.
   */
  readonly history?: {
    block(blocker: { blockerFn: () => Promise<boolean> | boolean; enableBeforeUnload?: boolean }): () => void;
  };
}

/** The router events after which the current location may have changed. */
const LOCATION_EVENTS = ["onBeforeLoad", "onLoad", "onResolved"] as const;

/**
 * Creates the {@link RouterAdapter} the framework's screens navigate through, from a TanStack
 * Router instance.
 *
 * @remarks
 * Built from the router instance rather than its hooks, because the adapter is provided above
 * `RouterProvider`, where those hooks have nothing to read yet. `useCurrentPath` is a hook by
 * contract and subscribes to the router's own location events, so it works anywhere below.
 * A widget that sends the reader elsewhere asks for this adapter rather than importing the router,
 * so a module stays independent of which router the app mounts; without it the hook answers null
 * and the affordance does not render.
 *
 * @example
 * ```tsx
 * const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL, ...flatSearch });
 * const routerAdapter = createTanstackRouterAdapter(router);
 * <RouterContext.Provider value={routerAdapter}><RouterProvider router={router} /></RouterContext.Provider>
 * ```
 *
 * @param router - The app's router.
 * @returns The adapter to provide through `RouterContext`.
 */
export function createTanstackRouterAdapter(router: TanstackRouterLike): RouterAdapter {
  const subscribe = (listener: () => void) => {
    const stops = LOCATION_EVENTS.map((event) => router.subscribe(event, listener));
    return () => {
      for (const stop of stops) stop();
    };
  };
  const pathname = () => router.state.location.pathname;
  const history = router.history;
  // The guard decides asynchronously (it asks the reader), and a truthy answer holds the
  // navigation back: `proceed` answers false, `reset` answers true.
  const useBlocker = history
    ? ({ enabled, onBlocked }: RouterBlockRequest) => {
        const latest = useRef(onBlocked);
        latest.current = onBlocked;
        useEffect(() => {
          if (!enabled) return;
          // The tab-close warning belongs to the caller, which already registers it once.
          return history.block({
            blockerFn: () =>
              new Promise<boolean>((resolve) => {
                latest.current({ proceed: () => resolve(false), reset: () => resolve(true) });
              }),
            enableBeforeUnload: false,
          });
        }, [enabled]);
      }
    : undefined;
  return {
    navigate: (to, options) => {
      void router.navigate({ to, replace: options?.replace });
    },
    getSearchParams: () => new URLSearchParams(router.state.location.searchStr),
    setSearchParams: (params, options) => {
      void router.navigate({
        to: router.state.location.pathname,
        search: Object.fromEntries(params.entries()),
        replace: options?.replace,
      });
    },
    useCurrentPath: () => useSyncExternalStore(subscribe, pathname, pathname),
    ...(useBlocker ? { useBlocker } : {}),
  };
}
