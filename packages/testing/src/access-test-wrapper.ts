import { createElement, type FC, type ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { AccessPolicy } from "@simplix-react/access";
import { createTestQueryClient } from "./test-query-client.js";
import { createMockPolicy } from "./mock-policy.js";

/**
 * Options for {@link createAccessTestWrapper}.
 */
export interface AccessTestWrapperOptions {
  /** Custom {@link QueryClient}. Falls back to {@link createTestQueryClient}. */
  queryClient?: QueryClient;
  /** Custom {@link AccessPolicy}. Falls back to {@link createMockPolicy} (full access). */
  policy?: AccessPolicy;
}

/**
 * Creates a React wrapper component that provides {@link QueryClientProvider}
 * and an access-aware context for testing hooks and components that depend on
 * access control.
 *
 * @remarks
 * When `@simplix-react/access/react` exports `AccessProvider`, this wrapper
 * will include it automatically. Pass the returned component as the `wrapper`
 * option to `renderHook` or `render` from `@testing-library/react`.
 *
 * @example
 * ```tsx
 * import { renderHook } from "@testing-library/react";
 * import { createAccessTestWrapper, createMockPolicy } from "@simplix-react/testing";
 *
 * const wrapper = createAccessTestWrapper();
 * const { result } = renderHook(() => useCan("view", "Pet"), { wrapper });
 * ```
 *
 * @example Restricted policy
 * ```tsx
 * const policy = createMockPolicy({
 *   rules: [{ action: "view", subject: "Pet" }],
 *   allowAll: false,
 * });
 * const wrapper = createAccessTestWrapper({ policy });
 * ```
 */
export function createAccessTestWrapper(
  options?: AccessTestWrapperOptions,
): FC<{ children: ReactNode }> {
  const queryClient = options?.queryClient ?? createTestQueryClient();
  const _policy = options?.policy ?? createMockPolicy();

  // TODO: Wrap with AccessProvider from @simplix-react/access/react once available
  return function AccessTestWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
