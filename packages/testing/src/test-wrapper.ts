import { createElement, type FC, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "./test-query-client.js";

/**
 * Creates a React wrapper component that provides all necessary context providers
 * for rendering hooks and components under test.
 *
 * @remarks
 * The wrapper includes a {@link QueryClientProvider} with either a caller-supplied
 * {@link QueryClient} or one created via {@link createTestQueryClient}.
 * Pass the returned component as the `wrapper` option to
 * `renderHook` or `render` from `@testing-library/react`.
 *
 * @param options - Optional configuration object.
 * @param options.queryClient - A custom {@link QueryClient} to use instead of the
 *   default test client.
 * @returns A React functional component that wraps its children with all required providers.
 *
 * @example
 * ```tsx
 * import { renderHook } from "@testing-library/react";
 * import { createTestWrapper } from "@simplix-react/testing";
 *
 * const wrapper = createTestWrapper();
 *
 * const { result } = renderHook(() => useMyQuery(), { wrapper });
 * ```
 *
 * @example Providing a custom QueryClient
 * ```tsx
 * import { QueryClient } from "@tanstack/react-query";
 * import { createTestWrapper } from "@simplix-react/testing";
 *
 * const queryClient = new QueryClient();
 * const wrapper = createTestWrapper({ queryClient });
 * ```
 */
export function createTestWrapper(options?: {
  queryClient?: QueryClient;
}): FC<{ children: ReactNode }> {
  const queryClient = options?.queryClient ?? createTestQueryClient();

  return function TestWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
