import { type ComponentType, useMemo } from "react";
import { useLocale } from "@simplix-react/i18n/react";
import { countries } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";

export interface CountryOption {
  code: string;
  localName: string;
  englishName: string;
  Flag: ComponentType<{ className?: string }>;
}

export const flagComponents = Flags as Record<string, ComponentType<{ className?: string }> | undefined>;

export function useCountryOptions(): CountryOption[] {
  const locale = useLocale();

  return useMemo(() => {
    const localDisplayNames = new Intl.DisplayNames([locale], { type: "region" });
    const englishDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

    const options: CountryOption[] = [];
    for (const code of countries) {
      const Flag = flagComponents[code];
      if (!Flag) continue;

      const localName = localDisplayNames.of(code) ?? code;
      const englishName = englishDisplayNames.of(code) ?? code;
      options.push({ code, localName, englishName, Flag });
    }

    return options.sort((a, b) => a.localName.localeCompare(b.localName, locale));
  }, [locale]);
}
