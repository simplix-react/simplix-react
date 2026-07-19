import { createContext, useContext, type ReactNode } from "react";

// ── Ambient default display zone ──
//
// One app-level IANA zone that datetime renderers fall back to when no explicit
// `displayZone` is given, replacing the implicit browser zone. Multi-site
// deployments mount it once (with the site-context / app zone) so an audit
// stamp or a list cell can never silently render in the viewer's browser zone.
// Explicit `displayZone` props always win — mixed-zone lists keep per-row zones.

const DisplayZoneContext = createContext<string | undefined>(undefined);

/** Props for {@link DisplayZoneProvider}. */
export interface DisplayZoneProviderProps {
  /** Default IANA display zone; `undefined` keeps the browser-zone behavior. */
  zone: string | undefined;
  children: ReactNode;
}

/**
 * Provides the ambient default display zone for datetime rendering. Consumed by
 * `CrudList.Column format="datetime"`, `DetailDateField format="datetime"`, and
 * `CrudDetail.AuditFooter` whenever their own `displayZone` prop is absent.
 */
export function DisplayZoneProvider({ zone, children }: DisplayZoneProviderProps) {
  return <DisplayZoneContext.Provider value={zone}>{children}</DisplayZoneContext.Provider>;
}

/** The ambient default display zone (`undefined` → browser zone). */
export function useDefaultDisplayZone(): string | undefined {
  return useContext(DisplayZoneContext);
}
