/**
 * Registry of the color themes shipped by @simplix-react/ui.
 *
 * Pure data (no imports) so consumers can read it without pulling the
 * component barrel. The actual token values live in `theme/presets/*.css`
 * (and `theme/base.css` for the neutral `default`); each entry's
 * `primaryColor` mirrors that theme's light `--primary` for picker swatches.
 *
 * `value` maps to the `data-color-theme` attribute. `default` carries no
 * attribute — it is the bare `:root` base; selecting it clears the attribute.
 */
export interface ColorTheme {
  /** Identifier set as `data-color-theme` (`default` = no attribute / base). */
  value: string;
  /** Human-readable picker label. */
  label: string;
  /** Light-mode `--primary` of this theme, for the picker swatch. */
  primaryColor: string;
}

export const THEMES: ColorTheme[] = [
  { value: "default", label: "Default", primaryColor: "oklch(0.208 0.042 265.755)" },
  { value: "blue", label: "Blue", primaryColor: "oklch(0.546 0.245 262.881)" },
  { value: "green", label: "Green", primaryColor: "oklch(0.596 0.145 163.225)" },
  { value: "krds", label: "KRDS", primaryColor: "oklch(0.576 0.229 262.35)" },
  { value: "orange", label: "Orange", primaryColor: "oklch(0.666 0.179 58.318)" },
  { value: "rose", label: "Rose", primaryColor: "oklch(0.645 0.246 16.439)" },
  { value: "violet", label: "Violet", primaryColor: "oklch(0.606 0.25 292.717)" },
];
