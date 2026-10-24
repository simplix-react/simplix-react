/**
 * The language a multilingual value falls back to when the reader's has no entry.
 *
 * <p>It decides two things on screen: which language tab a record's existing base value is
 * seeded into when a form opens, and which language's text stands in the placeholder of a tab
 * the operator has left blank.
 *
 * <p>It does NOT decide the language the server picks when it resolves a locale map for an API
 * response — that is `simplix.i18n.default-locale`, a deployment setting. The two can differ,
 * and the settings screen says so rather than implying one switch moves both.
 *
 * Source precedence:
 * 1. The deployment's own setting, installed by {@link configureFallbackLocale} from the site
 *    settings read at startup.
 * 2. {@link DEFAULT_FALLBACK_LOCALE}, so a console that has not read the settings yet — or one
 *    running before an installation exists — still seeds and prompts in a known language.
 *
 * The framework's locale display order is deliberately NOT used as the fallback. That order
 * opens on whichever language the app happens to list first, which is a presentation decision;
 * reading a record's base value out of a different language than the one it was written into
 * shows the operator a name that belongs to another tab.
 */

import { create } from "zustand";

/** What the fallback is before a deployment has said otherwise. */
export const DEFAULT_FALLBACK_LOCALE = "en";

const useConfiguredLocaleStore = create<{ configured: string | undefined }>(() => ({
  configured: undefined,
}));

/**
 * Install the deployment's fallback language.
 *
 * <p>Call once at startup from the site settings. Every {@link useFallbackLocale} consumer
 * re-renders; the non-hook readers pick it up on their next call, which for a form is the next
 * time it opens. A blank or nullish value clears back to {@link DEFAULT_FALLBACK_LOCALE}.
 *
 * @param locale the language code the deployment chose, e.g. `ko`
 */
export function configureFallbackLocale(locale: string | null | undefined): void {
  const next = typeof locale === "string" && locale.trim() ? locale.trim() : undefined;
  if (useConfiguredLocaleStore.getState().configured === next) return;
  useConfiguredLocaleStore.setState({ configured: next });
}

/**
 * @return the deployment's fallback language, or the built-in default until one is installed
 */
export function useFallbackLocale(): string {
  const configured = useConfiguredLocaleStore((s) => s.configured);
  return configured ?? DEFAULT_FALLBACK_LOCALE;
}

/** Non-hook accessor for the same resolution as {@link useFallbackLocale}. */
export function getFallbackLocale(): string {
  return useConfiguredLocaleStore.getState().configured ?? DEFAULT_FALLBACK_LOCALE;
}
