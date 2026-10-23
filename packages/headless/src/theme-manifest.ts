/**
 * Registry of the themes shipped by @simplix-react/ui. A theme sets colour, and may also set the
 * corner radius, the typeface and the card fill it was drawn with.
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
  /** The `--radius` the theme sets, in px; absent when it keeps the base radius. */
  radius?: number;
  /** The typeface the theme sets, by family name; absent when it keeps the base face. */
  font?: string;
  /**
   * How summary cards are filled under this theme: `plain` white cards, `outline` borders only,
   * `raised` shadow without a border, `tint` an accent wash, `lead` the important card filled
   * with the accent. Absent keeps the design's own fill. Read by a design stylesheet through
   * `data-fill` on the document element.
   */
  fill?: "plain" | "outline" | "raised" | "tint" | "lead";
  /** Which group a picker lists the theme under. */
  group?: "calm" | "bright";
}

export const THEMES: ColorTheme[] = [
  { value: "default", label: "Default", primaryColor: "oklch(0.208 0.042 265.755)" },
  { value: "blue", label: "Blue", primaryColor: "oklch(0.546 0.245 262.881)" },
  { value: "green", label: "Green", primaryColor: "oklch(0.596 0.145 163.225)" },
  { value: "krds", label: "KRDS", primaryColor: "oklch(0.576 0.229 262.35)" },
  { value: "orange", label: "Orange", primaryColor: "oklch(0.666 0.179 58.318)" },
  { value: "rose", label: "Rose", primaryColor: "oklch(0.645 0.246 16.439)" },
  { value: "violet", label: "Violet", primaryColor: "oklch(0.606 0.25 292.717)" },
  { value: "graphite", label: "Graphite", primaryColor: "oklch(0.3 0.015 265)", radius: 2, font: "IBM Plex Sans KR", fill: "outline", group: "calm" },
  { value: "cobalt", label: "Cobalt", primaryColor: "oklch(0.52 0.16 255)", radius: 6, font: "Pretendard Variable", fill: "plain", group: "calm" },
  { value: "forest", label: "Forest", primaryColor: "oklch(0.45 0.11 160)", radius: 8, font: "Spoqa Han Sans Neo", fill: "raised", group: "calm" },
  { value: "clear", label: "Clear", primaryColor: "oklch(0.53 0.19 248)", radius: 10, font: "SUIT Variable", fill: "tint", group: "bright" },
  { value: "fresh", label: "Fresh", primaryColor: "oklch(0.5 0.11 178)", radius: 10, font: "Pretendard Variable", fill: "lead", group: "bright" },
  { value: "grape", label: "Grape", primaryColor: "oklch(0.5 0.15 292)", radius: 12, font: "Wanted Sans Variable", fill: "lead", group: "bright" },
];
