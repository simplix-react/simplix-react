import { useEffect, useState } from "react";
import type * as Libphonenumber from "libphonenumber-js";

/** The full `libphonenumber-js` module surface, loaded on demand. */
export type LibphonenumberModule = typeof Libphonenumber;

let cached: LibphonenumberModule | null = null;
let pending: Promise<LibphonenumberModule> | null = null;

/** Loads (and caches) the libphonenumber-js module. */
export function loadLibphonenumber(): Promise<LibphonenumberModule> {
  if (cached) return Promise.resolve(cached);
  pending ??= import("libphonenumber-js").then((m) => {
    cached = m;
    return m;
  });
  return pending;
}

/**
 * Lazily loads `libphonenumber-js` and re-renders once it is available.
 *
 * The library ships a large metadata payload, so it must never be statically
 * imported from component modules — screens without a phone value would pay
 * for it in the initial bundle. Callers receive `null` until the module is
 * ready and fall back to rendering the raw value.
 */
export function useLibphonenumber(): LibphonenumberModule | null {
  const [lib, setLib] = useState(cached);

  useEffect(() => {
    if (lib) return;
    let mounted = true;
    void loadLibphonenumber().then((m) => {
      if (mounted) setLib(m);
    });
    return () => {
      mounted = false;
    };
  }, [lib]);

  return lib;
}
