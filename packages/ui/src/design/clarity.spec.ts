import { baseSlots } from "./clarity/base";
import { dashboardSlots } from "./clarity/dashboard";
import { listSlots } from "./clarity/list";
import { shellSlots } from "./clarity/shell";
import type { DesignSpec } from "./design-spec";

/**
 * The clarity design: hairline borders on a near-white canvas, one accent that marks where the
 * reader is and what they can press, hierarchy from type weight and spacing rather than from
 * colour. Radii follow use (controls, surfaces, overlays, round badges) and shadows are quiet.
 *
 * <p>Drawn by `theme/designs/clarity.css`, which build-design-css writes from every slot
 * declaration with these replacements and overrides; its tokens are in
 * `theme/designs/clarity-tokens.css`.
 */
export const CLARITY_REPLACE: Record<string, string> = {
  // Radius by use.
  "rounded-sm": "rounded-[calc(var(--radius-control)-2px)]",
  "rounded-md": "rounded-[var(--radius-control)]",
  "rounded-lg": "rounded-[var(--radius-surface)]",
  "rounded-xl": "rounded-[var(--radius-overlay)]",
  "rounded-t-lg": "rounded-t-[var(--radius-surface)]",
  "rounded-b-md": "rounded-b-[var(--radius-control)]",
  // Quiet shadows.
  "shadow-sm": "shadow-[var(--shadow-1)]",
  shadow: "shadow-[var(--shadow-1)]",
  "shadow-md": "shadow-[var(--shadow-2)]",
  "shadow-lg": "shadow-[var(--shadow-3)]",
  "shadow-xl": "shadow-[var(--shadow-3)]",
  // Hairlines and grounds.
  "border-input": "border-[var(--border-strong)]",
  "bg-muted/40": "bg-[var(--table-head)]",
  "bg-muted/50": "bg-[var(--surface-2)]",
  "bg-muted/30": "bg-[var(--surface-2)]",
  "hover:bg-muted/40": "hover:bg-[var(--hover-bg)]",
  "hover:bg-muted/50": "hover:bg-[var(--hover-bg)]",
  "hover:bg-accent": "hover:bg-[var(--hover-bg-strong)]",
  "focus:bg-accent": "focus:bg-[var(--hover-bg-strong)]",
  "focus-visible:ring-ring": "focus-visible:ring-[color-mix(in_oklch,var(--primary)_45%,transparent)]",
  "focus-visible:border-foreground": "focus-visible:border-primary",
  "focus:border-foreground": "focus:border-primary",
  // One motion everywhere.
  "transition-colors": "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
  "transition-all": "transition-all duration-[var(--dur-base)] ease-[var(--ease)]",
  "duration-200": "duration-[var(--dur-base)]",
};

const spec: DesignSpec = {
  id: "clarity",
  replace: CLARITY_REPLACE,
  slots: { ...baseSlots, ...shellSlots, ...listSlots, ...dashboardSlots },
};

export default spec;
