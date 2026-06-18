import { cn } from "../../utils/cn";

/** Props for the {@link ColorDot} component. */
export interface ColorDotProps {
  /** CSS color (hex / rgb / named) used for the dot fill. */
  color: string;
  /** Diameter token; defaults to `sm` (size-3). */
  size?: "xs" | "sm" | "md";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<ColorDotProps["size"]>, string> = {
  xs: "size-2",
  sm: "size-3",
  md: "size-4",
};

/**
 * Small circular swatch filled with an arbitrary CSS color. Use for
 * user-defined / data-driven colors (e.g. a holiday-type palette) where the
 * tone-based {@link StatusDot} does not apply. Centralizes the
 * `rounded-full` + inline `backgroundColor` span so call sites stop
 * re-implementing it.
 *
 * @example
 * ```tsx
 * <ColorDot color={holidayType.color} />
 * ```
 */
export function ColorDot({ color, size = "sm", className }: ColorDotProps) {
  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", SIZE_CLASS[size], className)}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
