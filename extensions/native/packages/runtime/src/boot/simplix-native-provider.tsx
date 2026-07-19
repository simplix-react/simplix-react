import {
  OverlayPortalHost,
  SimplixThemeProvider,
  ToastHost,
  type SimplixThemeProviderProps,
} from "@simplix-react-native/ui";
import type { II18nAdapter } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorDialogHost } from "../error/error-dialog-host";

/** Props for {@link SimplixNativeProvider}. */
export interface SimplixNativeProviderProps {
  /** Query client, typically from `createNativeQueryClient()`. */
  queryClient: QueryClient;
  /** i18n adapter, typically from `createNativeI18n()`. */
  i18nAdapter: II18nAdapter;
  /**
   * Boot gates awaited before the first frame (i18n readiness, token store
   * hydration). Until settled a centered spinner renders.
   */
  ready?: Promise<unknown> | Array<Promise<unknown>>;
  /** Theme configuration forwarded to `SimplixThemeProvider`. */
  theme?: Omit<SimplixThemeProviderProps, "children">;
  children: ReactNode;
}

/**
 * Root provider of a simplix-react-native app: safe area, query client,
 * i18n, theme tokens, overlay portal, toast host, and the global error
 * dialog — the native mirror of the web app-providers composition.
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * export default function RootLayout() {
 *   return (
 *     <SimplixNativeProvider
 *       queryClient={queryClient}
 *       i18nAdapter={i18n.adapter}
 *       ready={[i18n.i18nReady, tokenStore.hydrate()]}
 *     >
 *       <Stack />
 *     </SimplixNativeProvider>
 *   );
 * }
 * ```
 */
export function SimplixNativeProvider({
  queryClient,
  i18nAdapter,
  ready,
  theme,
  children,
}: SimplixNativeProviderProps) {
  const gates = Array.isArray(ready) ? ready : ready ? [ready] : [];
  const [isReady, setIsReady] = useState(gates.length === 0);
  const [bootError, setBootError] = useState<Error | null>(null);

  useEffect(() => {
    if (gates.length === 0) return;
    let cancelled = false;
    Promise.all(gates)
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBootError(error instanceof Error ? error : new Error(String(error)));
        }
      });
    return () => {
      cancelled = true;
    };
    // The gate list is fixed for the app lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bootError) {
    // Boot gates failing (storage unreadable, i18n init crash) is not a
    // recoverable in-app state — surface it instead of rendering a broken app.
    throw bootError;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider adapter={i18nAdapter}>
          <SimplixThemeProvider {...theme}>
            {isReady ? (
              children
            ) : (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
              </View>
            )}
            <ToastHost />
            <ErrorDialogHost />
            <OverlayPortalHost />
          </SimplixThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
