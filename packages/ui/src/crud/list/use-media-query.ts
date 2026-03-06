import { useCallback, useEffect, useState } from "react";

/**
 * Responsive breakpoint detection hook using the `matchMedia` API.
 *
 * @param query - CSS media query string (e.g. `"(min-width: 768px)"`).
 * @returns `true` when the query matches, `false` otherwise.
 *
 * @example
 * ```ts
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);

    // Set initial value
    handleChange();

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
