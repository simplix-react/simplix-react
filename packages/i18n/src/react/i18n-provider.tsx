import { createContext, type ReactNode, useContext } from "react";
import type { II18nAdapter } from "../adapter.js";

const I18nContext = createContext<II18nAdapter | null>(null);

/**
 * Props for the {@link I18nProvider} component.
 */
export interface I18nProviderProps {
  /** Child components that will have access to the i18n adapter. */
  children: ReactNode;
  /** The i18n adapter instance to provide via React context. */
  adapter: II18nAdapter;
}

/**
 * Provides an {@link II18nAdapter} instance to descendant components via React context.
 *
 * Wrap your application (or a subtree) with this provider to enable the
 * {@link useTranslation}, {@link useLocale}, and {@link useI18n} hooks.
 *
 * @param props - The provider props.
 *
 * @example
 * ```tsx
 * import { I18nProvider } from "@simplix-react/i18n/react";
 * import { createI18nConfig } from "@simplix-react/i18n";
 *
 * const { adapter, i18nReady } = createI18nConfig({ defaultLocale: "ko" });
 * await i18nReady;
 *
 * function App() {
 *   return (
 *     <I18nProvider adapter={adapter}>
 *       <MyComponent />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({ children, adapter }: I18nProviderProps) {
  return (
    <I18nContext.Provider value={adapter}>{children}</I18nContext.Provider>
  );
}

/**
 * Returns the {@link II18nAdapter} from the nearest {@link I18nProvider}, or `null` if none exists.
 *
 * Prefer {@link useTranslation} or {@link useLocale} for most use cases.
 * Use this hook when you need direct access to the full adapter API.
 */
export function useI18nAdapter(): II18nAdapter | null {
  return useContext(I18nContext);
}
