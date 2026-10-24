import { useCallback } from "react";
import type { TranslationValues } from "../types.js";
import { useTranslation } from "./use-translation.js";

/** Values interpolated into a translation, matching the framework translator's second argument. */

/** What {@link useOptionalTranslation} hands back — the standard translator plus {@link tOr}. */
export interface OptionalTranslation {
  /** Translates a key that the catalogue is known to carry. */
  t: (key: string, values?: TranslationValues) => string;
  /** Whether the catalogue carries an entry for the key. */
  exists: (key: string) => boolean;
  /**
   * Translates a key that the catalogue may not carry, printing `fallback` when it does not.
   *
   * @param key the entry to look for
   * @param fallback what to print instead — a value the reader can act on, never the key
   * @param values interpolated into the entry when one exists
   */
  tOr: (key: string, fallback: string, values?: TranslationValues) => string;
}

/**
 * Translation for keys built from a server value, where the catalogue may have no entry yet.
 *
 * @remarks
 * The framework translator takes interpolation values as its second argument and no options, so
 * `t(key, { defaultValue: x })` does not fall back — the object is read as interpolation values,
 * `defaultValue` matches no placeholder, and a missing entry prints the key itself. A status, an
 * entity type, or a permission group the server named since the last release then reaches the
 * screen as `auditEvent.entityType.LicenseSeat`, which tells the reader nothing and cannot be
 * quoted to anybody.
 *
 * @remarks
 * Every such lookup goes through here so the fallback is decided once. The fallback is the raw
 * value the key was built from, because that is what the server calls the thing and what an
 * operator can put in a question.
 *
 * @param namespace the translation namespace to scope lookups to
 * @returns the translator, its existence check, and the falling-back {@link OptionalTranslation.tOr}
 */
export function useOptionalTranslation(namespace: string): OptionalTranslation {
  const { t, exists } = useTranslation(namespace);

  const tOr = useCallback(
    (key: string, fallback: string, values?: TranslationValues) => {
      if (!exists(key)) return fallback;
      const translated = t(key, values);
      // An entry deliberately left empty — a counting word a language does not use — resolves
      // to the key itself, because the adapter is configured not to return empty strings. It
      // exists, so the check above passes, and the key lands in the sentence beside a number.
      return translated === key ? fallback : translated;
    },
    [t, exists],
  );

  return { t, exists, tOr };
}
