import { createContext, useContext, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import type { FileFieldConfig } from "../fields/file-attachment/types";
import { FilePolicyContext } from "./file-policy-context";
import type { RemoteConfigQueryDef } from "./types";

/**
 * Creates a typed, app-level configuration provider that runs host-injected
 * queries and distributes their results via context — the framework owns the
 * provider mechanism, the app injects the fetchers (MenuProvider pattern).
 *
 * The `filePolicy` key is **reserved**: when present its value (a
 * {@link FileFieldConfig}) is also published to the internal FilePolicy context
 * so `FileField` / `ImageField` pick it up automatically as the precedence-Y
 * default (no separate provider, no module wiring).
 *
 * @example
 * // app side — instantiate once with the project's config types:
 * export const { AppConfigProvider, useAppConfig, useAppConfigValue } =
 *   createAppConfig<{ filePolicy: FileFieldConfig; siteConfig: SiteConfig }>();
 *
 * // compose — inject the fetchers:
 * <AppConfigProvider queries={{
 *   filePolicy: { queryKey: ["file-policy"], queryFn: fetchFilePolicy, enabled: isAuth },
 *   siteConfig: { queryKey: ["site-config"], queryFn: fetchSiteConfig },
 * }}>
 *
 * // consume — flat shape (minimal churn):
 * const site = useAppConfigValue("siteConfig");
 */
export function createAppConfig<
  T extends { filePolicy?: FileFieldConfig } & Record<string, unknown>,
>() {
  type Queries = { [K in keyof T]: RemoteConfigQueryDef<T[K]> };
  type Value = Partial<T> & { isLoading: boolean };

  const Ctx = createContext<Value | null>(null);

  function AppConfigProvider({
    queries,
    children,
  }: {
    queries: Queries;
    children: ReactNode;
  }) {
    // Keys are static for a given instantiation (fixed config map) → safe.
    const keys = Object.keys(queries) as (keyof T)[];

    const value = useQueries({
      queries: keys.map((k) => {
        const def = queries[k];
        return {
          queryKey: def.queryKey,
          queryFn: ({ signal }: { signal?: AbortSignal }) => def.queryFn({ signal }),
          enabled: def.enabled,
          staleTime: def.staleTime,
        };
      }),
      // react-query memoizes the combined result via structural sharing.
      combine: (results) => {
        const acc: Record<string, unknown> = {};
        let isLoading = false;
        keys.forEach((k, i) => {
          acc[k as string] = results[i]?.data;
          if (results[i]?.isLoading) isLoading = true;
        });
        acc.isLoading = isLoading;
        return acc as Value;
      },
    });

    return (
      <Ctx.Provider value={value}>
        <FilePolicyContext.Provider value={value.filePolicy as FileFieldConfig | undefined}>
          {children}
        </FilePolicyContext.Provider>
      </Ctx.Provider>
    );
  }

  function useAppConfig(): Value {
    const ctx = useContext(Ctx);
    if (!ctx) {
      throw new Error("useAppConfig must be used within its AppConfigProvider");
    }
    return ctx;
  }

  function useAppConfigValue<K extends keyof T>(key: K): T[K] | undefined {
    return useAppConfig()[key] as T[K] | undefined;
  }

  return { AppConfigProvider, useAppConfig, useAppConfigValue };
}
