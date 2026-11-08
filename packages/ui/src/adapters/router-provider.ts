import { createContext, useContext } from "react";

/** What a router hands a guard when it holds a navigation back. */
export interface RouterBlockDecision {
  /** Lets the held navigation go through. */
  proceed: () => void;
  /** Drops the held navigation and stays on the current route. */
  reset: () => void;
}

/** A request to hold every navigation that leaves the current route until the guard decides. */
export interface RouterBlockRequest {
  /** Whether navigations are held; `false` registers nothing. */
  enabled: boolean;
  /**
   * Called once for each held navigation (a link, `navigate`, or the browser's Back and Forward),
   * with the two ways to settle it. The navigation stays held until one of them is called.
   */
  onBlocked: (decision: RouterBlockDecision) => void;
}

/** Router abstraction interface. Adapters (e.g., React Router) implement this contract. */
export interface RouterAdapter {
  navigate: (to: string, options?: { replace?: boolean }) => void;
  getSearchParams: () => URLSearchParams;
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  useCurrentPath: () => string;
  /**
   * A hook that holds navigations away from the current route while `enabled`. Optional: an
   * adapter over a router that cannot hold a navigation leaves it out, and a guard then covers
   * only the navigations the page makes itself.
   */
  useBlocker?: (request: RouterBlockRequest) => void;
}

/** Context for providing a router adapter to CRUD components. */
export const RouterContext = createContext<RouterAdapter | null>(null);

/** Retrieves the router adapter from the nearest CrudProvider, or null if unavailable. */
export function useRouter(): RouterAdapter | null {
  return useContext(RouterContext);
}
