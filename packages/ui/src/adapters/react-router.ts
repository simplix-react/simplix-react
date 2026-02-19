import type { RouterAdapter } from "./router-provider";

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
}

/**
 * Creates a {@link RouterAdapter} from React Router v6+ hooks.
 * Must be called inside a React Router context (e.g., \<BrowserRouter\>).
 *
 * react-router-dom is NOT a dependency — import hooks yourself and pass them.
 */
export function createReactRouterAdapter(hooks: ReactRouterHooks): RouterAdapter {
  const { useNavigate, useSearchParams, useLocation } = hooks;

  // Capture current hook references per call-site
  const nav = useNavigate();
  const [searchParams, setSearchParamsRR] = useSearchParams();
  const location = useLocation();

  return {
    navigate: (to, options) => nav(to, options),
    getSearchParams: () => searchParams,
    setSearchParams: (params, options) => setSearchParamsRR(params, options),
    // useCurrentPath must be a hook — wrap the location value
    useCurrentPath: () => location.pathname,
  };
}
