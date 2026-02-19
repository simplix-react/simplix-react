import { createContext, useContext } from "react";

/** Router abstraction interface. Adapters (e.g., React Router) implement this contract. */
export interface RouterAdapter {
  navigate: (to: string, options?: { replace?: boolean }) => void;
  getSearchParams: () => URLSearchParams;
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  useCurrentPath: () => string;
}

/** Context for providing a router adapter to CRUD components. */
export const RouterContext = createContext<RouterAdapter | null>(null);

/** Retrieves the router adapter from the nearest CrudProvider, or null if unavailable. */
export function useRouter(): RouterAdapter | null {
  return useContext(RouterContext);
}
