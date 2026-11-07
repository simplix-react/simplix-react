import { useSyncExternalStore } from "react";

import type { RouterAdapter } from "./router-provider";

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
 * @example
 * ```ts
 * const router = createRouter({ routeTree, ...flatSearch });
 * ```
 */
export const flatSearch = {
  stringifySearch(search: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const text = params.toString();
    return text ? `?${text}` : "";
  },
  parseSearch(searchStr: string): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(searchStr).entries());
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
  };
}
