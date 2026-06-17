import { createContext, useContext, useMemo } from "react";

import { STATUS_TONES, type StatusTone, type StatusToneToken } from "./status-tone";

/**
 * Per-tone, per-slot class overrides supplied through `UIProvider`'s
 * `statusTones` prop. Status tones are palette-literal (not bound to theme
 * variables), so this is the channel for globally retoning status colors
 * without forking components.
 */
export type StatusToneOverrides = Partial<
  Record<StatusTone, Partial<StatusToneToken>>
>;

export const StatusToneContext = createContext<StatusToneOverrides>({});

/**
 * Returns the resolved status tone table, merging any `UIProvider` overrides
 * over the palette-literal defaults. Returns the default table by reference
 * when no overrides are set, so unaffected trees stay allocation-free.
 */
export function useStatusTones(): Record<StatusTone, StatusToneToken> {
  const overrides = useContext(StatusToneContext);

  return useMemo(() => {
    const toneKeys = Object.keys(overrides) as StatusTone[];
    if (toneKeys.length === 0) return STATUS_TONES;

    const result = {} as Record<StatusTone, StatusToneToken>;
    for (const tone of Object.keys(STATUS_TONES) as StatusTone[]) {
      const override = overrides[tone];
      result[tone] = override ? { ...STATUS_TONES[tone], ...override } : STATUS_TONES[tone];
    }
    return result;
  }, [overrides]);
}
