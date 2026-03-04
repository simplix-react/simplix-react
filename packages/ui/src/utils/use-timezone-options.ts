import { useMemo } from "react";
import { useLocale } from "@simplix-react/i18n/react";

export interface TimezoneOption {
  value: string;
  label: string;
  localizedName: string;
  region: string;
}

export const FALLBACK_TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Seoul",
  "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland", "Africa/Cairo",
];

export function getTimezoneList(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

export function useTimezoneOptions(): { groups: Map<string, TimezoneOption[]> } {
  const locale = useLocale();

  return useMemo(() => {
    const timezones = getTimezoneList();
    const groups = new Map<string, TimezoneOption[]>();

    for (const tz of timezones) {
      const slashIdx = tz.indexOf("/");
      const region = slashIdx > 0 ? tz.slice(0, slashIdx) : "Other";

      // Get GMT offset
      let offsetLabel = "";
      try {
        const parts = new Intl.DateTimeFormat(locale, {
          timeZone: tz,
          timeZoneName: "shortOffset",
        }).formatToParts(new Date());
        const tzPart = parts.find((p) => p.type === "timeZoneName");
        offsetLabel = tzPart?.value ?? "";
      } catch {
        // skip invalid timezone
      }

      // Get localized timezone name
      let localizedName = "";
      try {
        const parts = new Intl.DateTimeFormat(locale, {
          timeZone: tz,
          timeZoneName: "long",
        }).formatToParts(new Date());
        const tzPart = parts.find((p) => p.type === "timeZoneName");
        localizedName = tzPart?.value ?? "";
      } catch {
        // skip invalid timezone
      }

      const label = offsetLabel ? `${tz} ${offsetLabel}` : tz;
      const option: TimezoneOption = { value: tz, label, localizedName, region };

      const existing = groups.get(region) ?? [];
      existing.push(option);
      groups.set(region, existing);
    }

    // Sort within each group
    for (const [, opts] of groups) {
      opts.sort((a, b) => a.label.localeCompare(b.label, locale));
    }

    return { groups };
  }, [locale]);
}
