import type { RequestHandler } from "msw";

/** Handle returned by {@link startNativeMocks}. */
export interface NativeMockServer {
  /** Stop intercepting requests. */
  stop(): void;
}

/** Options for {@link startNativeMocks}. */
export interface StartNativeMocksOptions {
  /** MSW request handlers — the same generated handlers the web worker uses. */
  handlers: RequestHandler[];
  /**
   * Behavior for requests without a matching handler. Defaults to
   * `"bypass"` so real endpoints keep working next to mocked domains.
   */
  onUnhandledRequest?: "bypass" | "warn" | "error";
}

/**
 * Start the msw/native interceptor with the generated domain handlers —
 * the native counterpart of the web `setupMockWorker`.
 *
 * The consuming app must install msw and load its React Native polyfills
 * BEFORE calling this (see the msw React Native integration guide):
 *
 * ```ts
 * // index.js — before anything else
 * import "react-native-url-polyfill/auto";
 * import "fast-text-encoding";
 * ```
 *
 * @example
 * ```ts
 * if (process.env.EXPO_PUBLIC_ENABLE_MOCKS === "true") {
 *   await startNativeMocks({ handlers: visitorMockHandlers });
 * }
 * ```
 */
export async function startNativeMocks(
  options: StartNativeMocksOptions,
): Promise<NativeMockServer> {
  // Dynamic import keeps msw an optional dependency: production builds that
  // never enable mocks do not bundle it.
  const { setupServer } = await import("msw/native");
  const server = setupServer(...options.handlers);
  server.listen({ onUnhandledRequest: options.onUnhandledRequest ?? "bypass" });
  return {
    stop() {
      server.close();
    },
  };
}
