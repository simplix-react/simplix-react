import { useCallback } from "react";
import { useLocale } from "./use-translation.js";

export function useLocalizedText() {
  const locale = useLocale();
  return useCallback(
    (map: Record<string, string> | null | undefined, fallback = ""): string => {
      if (!map) return fallback;
      const current = map[locale];
      if (current && current.trim() !== "") return current;
      const firstNonEmpty = Object.values(map).find((v) => v && v.trim() !== "");
      return firstNonEmpty ?? fallback;
    },
    [locale],
  );
}
