import type { ReactNode } from "react";

import { RouterContext, type RouterAdapter } from "./router-provider";

/** Props for the {@link CrudProvider} component. */
export interface CrudProviderProps {
  router: RouterAdapter;
  children: ReactNode;
}

/**
 * Provides a router adapter to the component tree for URL-based
 * navigation and search parameter synchronization.
 */
export function CrudProvider({ router, children }: CrudProviderProps) {
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}
