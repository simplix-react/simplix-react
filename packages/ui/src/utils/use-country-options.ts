import { type ComponentType, useEffect, useMemo, useState } from "react";
import { useLocale } from "@simplix-react/i18n/react";

export interface CountryOption {
  code: string;
  localName: string;
  englishName: string;
  Flag: ComponentType<{ className?: string }>;
}

interface CountryData {
  countries: readonly string[];
  flags: Record<string, ComponentType<{ className?: string }> | undefined>;
}

let cached: CountryData | null = null;
let pending: Promise<CountryData> | null = null;

function loadCountryData(): Promise<CountryData> {
  if (cached) return Promise.resolve(cached);
  pending ??= Promise.all([
    import("country-flag-icons"),
    import("country-flag-icons/react/3x2"),
  ]).then(([{ countries }, flags]) => {
    cached = {
      countries,
      flags: flags as unknown as CountryData["flags"],
    };
    return cached;
  });
  return pending;
}

/**
 * Country options (ISO code, localized/English names, flag component) for
 * pickers and display cells.
 *
 * The flag component catalog is a large payload, so it loads lazily: the hook
 * returns an empty list until the data arrives, then re-renders with the full
 * set. Callers already tolerate an empty options list (async-options gating).
 */
export function useCountryOptions(): CountryOption[] {
  const locale = useLocale();
  const [data, setData] = useState(cached);

  useEffect(() => {
    if (data) return;
    let mounted = true;
    void loadCountryData().then((d) => {
      if (mounted) setData(d);
    });
    return () => {
      mounted = false;
    };
  }, [data]);

  return useMemo(() => {
    if (!data) return [];
    const localDisplayNames = new Intl.DisplayNames([locale], { type: "region" });
    const englishDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

    const options: CountryOption[] = [];
    for (const code of data.countries) {
      const Flag = data.flags[code];
      if (!Flag) continue;

      const localName = localDisplayNames.of(code) ?? code;
      const englishName = englishDisplayNames.of(code) ?? code;
      options.push({ code, localName, englishName, Flag });
    }

    return options.sort((a, b) => a.localName.localeCompare(b.localName, locale));
  }, [locale, data]);
}
