import { createContext, type ReactNode } from "react";

import type { RouteMatcher } from "./menu-types";

// Holds the host router's match function so menu hooks can ask the router
// "does the current location match this menu href?" instead of guessing by
// string prefix. Provided by the app inside the router context.
export const RouteMatcherContext = createContext<RouteMatcher | null>(null);

export interface RouteMatcherProviderProps {
  matchRoute: RouteMatcher;
  children: ReactNode;
}

export function RouteMatcherProvider({
  matchRoute,
  children,
}: RouteMatcherProviderProps) {
  return (
    <RouteMatcherContext.Provider value={matchRoute}>
      {children}
    </RouteMatcherContext.Provider>
  );
}
