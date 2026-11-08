import { useEffect } from "react";

import type { RouterAdapter, RouterBlockRequest } from "./router-provider";

// Adapter factory for React Router v6+.
// Must be called inside a React Router context (e.g., <BrowserRouter>).
// react-router-dom is NOT a hard dependency — import it yourself and pass the hooks.
/** React Router v6+ hook references required to create a router adapter. */
export interface ReactRouterHooks {
  useNavigate: () => (to: string, options?: { replace?: boolean }) => void;
  useSearchParams: () => [
    URLSearchParams,
    (
      params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean },
    ) => void,
  ];
  useLocation: () => { pathname: string };
  /**
   * React Router's `useBlocker`, which needs a data router (`createBrowserRouter`). Pass it to let
   * an unsaved-changes guard hold Back and in-app links; leave it out under `<BrowserRouter>`,
   * where the hook throws.
   */
  useBlocker?: (shouldBlock: boolean) => { state: string; proceed?: () => void; reset?: () => void };
}

/**
 * Creates a {@link RouterAdapter} from React Router v6+ hooks.
 * Must be called inside a React Router context (e.g., \<BrowserRouter\>).
 *
 * react-router-dom is NOT a dependency — import hooks yourself and pass them.
 */
export function createReactRouterAdapter(hooks: ReactRouterHooks): RouterAdapter {
  const { useNavigate, useSearchParams, useLocation, useBlocker: useRouterBlocker } = hooks;

  // Capture current hook references per call-site.
  // This factory is itself called during render (it forwards React Router
  // hooks), so the hook calls are valid even though the name isn't `use*`.
  /* eslint-disable react-hooks/rules-of-hooks */
  const nav = useNavigate();
  const [searchParams, setSearchParamsRR] = useSearchParams();
  const location = useLocation();
  /* eslint-enable react-hooks/rules-of-hooks */

  // The adapter's hook forwards React Router's: it is called from the guard's render, in a fixed
  // order, so the hook rules hold.
  const useBlocker = useRouterBlocker
    ? ({ enabled, onBlocked }: RouterBlockRequest) => {
        const blocker = useRouterBlocker(enabled);
        const held = blocker.state === "blocked" ? blocker : null;
        useEffect(() => {
          if (!held?.proceed || !held.reset) return;
          onBlocked({ proceed: held.proceed, reset: held.reset });
          // The blocker object changes identity per render; the state change is what announces a
          // new held navigation.
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [held?.state]);
      }
    : undefined;

  return {
    navigate: (to, options) => nav(to, options),
    getSearchParams: () => searchParams,
    setSearchParams: (params, options) => setSearchParamsRR(params, options),
    // useCurrentPath must be a hook — wrap the location value
    useCurrentPath: () => location.pathname,
    ...(useBlocker ? { useBlocker } : {}),
  };
}
