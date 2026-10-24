/**
 * The application's default IANA time zone. It anchors date-only picks for
 * absolute-instant fields that are not scoped to a single site (the schedule
 * activation/deactivation times), is the display zone for global entities' audit
 * stamps and statistics in all-sites mode, and is the fallback display zone
 * whenever a site zone cannot be resolved.
 *
 * Source precedence:
 * 1. The backend bootstrap value ({@link configureAppTimeZone}, fed from the
 *    `/config/bootstrap` response — the single backend key
 *    `simplix.date-time.default-timezone`), so frontend and backend can never
 *    see different app zones.
 * 2. The build/runtime config key `VITE_APP_TIME_ZONE` (pre-bootstrap and
 *    standalone runs).
 * 3. `DEFAULT_APP_TIME_ZONE`, a last-resort default so local development runs
 *    without extra setup; its use is warned about in dev.
 *
 * The browser zone (`Intl.resolvedOptions().timeZone`) is deliberately NOT used
 * as the anchor: the stored instant for a given picked day must be identical for
 * every operator, regardless of where their browser sits.
 */

import { create } from "zustand";

/** Last-resort default when `VITE_APP_TIME_ZONE` is unset. Override per deployment. */
const DEFAULT_APP_TIME_ZONE = "Asia/Seoul";

/**
 * Whether this runtime can render a date in a named zone.
 *
 * <p>Asked once where a zone enters, rather than at each use. Every `Intl` call taking a
 * `timeZone` throws a `RangeError` on an id it does not know, and its callers are inside render
 * — so one zone this runtime has not heard of would blank a screen over a preference. Both ways
 * in are checked: the deployment's stored id is validated by the server against a tzdb that is
 * not the reader's browser's, and the build-time one is validated by nobody at all.
 *
 * @param zone the IANA id to try
 * @returns whether this runtime resolves it
 */
function isResolvableZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return false;
  }
}

function readConfiguredZone(): string | undefined {
  // `import.meta.env` is provided by the app bundler; cast locally so this library
  // does not depend on the bundler's global env-type augmentation.
  const env = (import.meta as ImportMeta & { readonly env?: Record<string, string | undefined> }).env;
  const value = env?.VITE_APP_TIME_ZONE;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function resolveAppTimeZone(): string {
  const configured = readConfiguredZone();
  if (configured && isResolvableZone(configured)) return configured;
  if (configured) {
    // Kept out of the accessors rather than handed on. Every consumer passes this to an `Intl`
    // call inside render, and one id the runtime has not heard of throws there — a blank screen
    // over a build-time typo nobody would think to look at.
    console.warn(
      `[console-ui] VITE_APP_TIME_ZONE is set to "${configured}", which is not a zone this `
        + `runtime knows; falling back to "${DEFAULT_APP_TIME_ZONE}".`,
    );
    return DEFAULT_APP_TIME_ZONE;
  }
  const env = (import.meta as ImportMeta & { readonly env?: Record<string, string | undefined> }).env;
  if (env?.DEV) {
    // Surface the reliance on the built-in default so a misconfigured deployment is
    // not silently anchored to another region's midnight.
    console.warn(
      `[console-ui] VITE_APP_TIME_ZONE is not set; falling back to "${DEFAULT_APP_TIME_ZONE}". ` +
        "Set VITE_APP_TIME_ZONE to this deployment's IANA time zone.",
    );
  }
  return DEFAULT_APP_TIME_ZONE;
}

/**
 * Build-time application default IANA time zone (`VITE_APP_TIME_ZONE` → dev
 * default). Fallback only — the backend bootstrap value supplied via
 * {@link configureAppTimeZone} takes precedence; read through
 * {@link useAppTimeZone} / {@link getAppTimeZone}.
 */
export const APP_TIME_ZONE: string = resolveAppTimeZone();

const useConfiguredZoneStore = create<{ configured: string | undefined }>(() => ({
  configured: undefined,
}));

/**
 * Install the backend-delivered application time zone (the bootstrap response's
 * `defaultTimeZone`). Call once at app startup; every {@link useAppTimeZone}
 * consumer re-renders with the new zone. A blank/nullish value clears back to
 * the build-time fallback, and so does one this runtime cannot resolve — said
 * out loud, because the deployment then reckons a day in a zone none of its
 * screens can draw.
 */
export function configureAppTimeZone(zone: string | null | undefined): void {
  const given = typeof zone === "string" && zone.trim() ? zone.trim() : undefined;
  if (given !== undefined && !isResolvableZone(given)) {
    console.warn(
      `[console-ui] This deployment's time zone "${given}" is not one this browser knows, so `
        + `dates are drawn in "${APP_TIME_ZONE}" instead and may fall on a different day than `
        + "the server reckons.",
    );
    return;
  }
  if (useConfiguredZoneStore.getState().configured === given) return;
  useConfiguredZoneStore.setState({ configured: given });
}

/**
 * Returns the application default IANA time zone — the backend bootstrap value
 * when installed, else the build-time fallback.
 */
export function useAppTimeZone(): string {
  const configured = useConfiguredZoneStore((s) => s.configured);
  return configured ?? APP_TIME_ZONE;
}

/** Non-hook accessor for the same resolution as {@link useAppTimeZone}. */
export function getAppTimeZone(): string {
  return useConfiguredZoneStore.getState().configured ?? APP_TIME_ZONE;
}
