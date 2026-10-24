import { useEffect, useState } from "react";

/**
 * Holds a value back until it has stopped changing, so a per-keystroke value can
 * drive a server round-trip without one request per character.
 *
 * @param value the value that changes as the operator types
 * @param delayMs how long the value must stay unchanged before it is published
 * @returns `value`, updating only after it has been stable for `delayMs`
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
