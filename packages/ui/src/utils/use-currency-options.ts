import { useMemo } from "react";
import { useLocale } from "@simplix-react/i18n/react";

/** One currency an amount can be written in. */
export interface CurrencyOption {
  /** ISO 4217 code, e.g. "KRW". */
  code: string;
  /** The currency's name in the reader's language, e.g. "대한민국 원". */
  localName: string;
  /** The currency's English name, so a search in either language finds it. */
  englishName: string;
  /**
   * How many decimal places the currency implies — the won has none, the dinar has three.
   * Amounts are commonly stored as integers in the currency's smallest unit, and this is the
   * scale that turns such an integer back into a figure.
   */
  decimalPlaces: number;
}

/**
 * The ISO 4217 codes this runtime knows.
 *
 * <p>Read from the platform rather than kept as a table here: a hardcoded list is a release
 * behind every currency change, and the same data already backs the names below. A runtime
 * without `supportedValuesOf` falls back to the majors, so a picker is never empty.
 */
const ISO_CODES: readonly string[] = (() => {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
  try {
    return intl.supportedValuesOf?.("currency") ?? ["EUR", "GBP", "JPY", "KRW", "USD"];
  } catch {
    return ["EUR", "GBP", "JPY", "KRW", "USD"];
  }
})();

/**
 * How many decimal places a currency implies.
 *
 * <p>Asked of the formatter, which is where the ISO 4217 minor-unit table already lives. A
 * code the runtime does not recognize is treated as two, which is what the standard says for
 * anything unlisted.
 *
 * @param code the ISO 4217 code
 * @returns the number of decimal places
 */
export function currencyDecimalPlaces(code: string): number {
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency: code })
        .resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/**
 * Currency options (ISO code, localized/English names, decimal places) for pickers and
 * display cells.
 *
 * @returns every currency the runtime knows, ordered by its localized name
 */
export function useCurrencyOptions(): CurrencyOption[] {
  const locale = useLocale();

  return useMemo(() => {
    let localNames: Intl.DisplayNames | null = null;
    let englishNames: Intl.DisplayNames | null = null;
    try {
      localNames = new Intl.DisplayNames([locale], { type: "currency" });
      englishNames = new Intl.DisplayNames(["en"], { type: "currency" });
    } catch {
      localNames = null;
      englishNames = null;
    }

    return ISO_CODES.map((code) => ({
      code,
      localName: localNames?.of(code) ?? code,
      englishName: englishNames?.of(code) ?? code,
      decimalPlaces: currencyDecimalPlaces(code),
    })).sort((a, b) => a.localName.localeCompare(b.localName, locale));
  }, [locale]);
}
