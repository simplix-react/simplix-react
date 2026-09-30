import {
  type CSSProperties,
  type ComponentPropsWithRef,
  type ReactNode,
  forwardRef,
} from "react";

import { type IconComponent, type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";
import { StatusDot } from "./status-dot";
import { cn } from "../../utils/cn";

/** Text size token → Tailwind text + padding classes for the pill. */
const SIZE_CLASS: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  xs: "text-[0.625rem] px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1",
  default: "text-sm px-2.5 py-1 gap-1.5",
};

export interface StatusBadgeProps
  extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** Semantic tone driving the pill color. */
  tone: StatusTone;
  /** Already-translated label content. */
  label: ReactNode;
  /** Optional leading icon component (mutually exclusive with `showDot`). */
  icon?: IconComponent;
  /** Render a leading {@link StatusDot} of the same tone. */
  showDot?: boolean;
  /**
   * Animate the badge. With a leading dot, the dot pings (`animation="ping"`); with a leading
   * icon, the whole badge glows in its tone and keeps glowing for as long as it stands.
   */
  pulse?: boolean;
  /** `filled` solid badge or `outline` bordered badge (default `outline`). */
  appearance?: "filled" | "outline";
  /** Text sizing token (default `sm`, matching list/detail badge density). */
  size?: "xs" | "sm" | "default";
}

/**
 * Compact status pill combining a tone-colored label with an optional leading
 * dot or icon.
 *
 * `appearance="filled"` uses the tone's soft filled background; `outline` draws
 * a tone-colored border over a transparent background. A leading icon adopts the
 * tone's standalone icon color in outline mode; a leading dot mirrors the tone
 * (and pulses when `pulse` is set). An icon has no ring of its own, so `pulse` with an icon glows
 * the badge itself.
 *
 * @example
 * ```tsx
 * <StatusBadge tone="success" label="Active" showDot />
 * <StatusBadge tone="danger" label="Failed" appearance="filled" />
 * ```
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      tone,
      label,
      icon: Icon,
      showDot = false,
      pulse = false,
      appearance = "outline",
      size = "sm",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const token = useStatusTones()[tone];
    const appearanceClass =
      appearance === "filled"
        ? token.badge
        : cn("border bg-transparent", token.outline);
    // The glow reads the tone's own color in each scheme (theme/base.css picks one by `.dark`).
    const glow = Boolean(Icon) && pulse;
    const glowStyle = glow
      ? ({
          "--status-glow-light": token.chart,
          "--status-glow-dark": token.chartDark,
          ...style,
        } as CSSProperties)
      : style;

    return (
      <span
        ref={ref}
        data-slot="badge"
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium",
          SIZE_CLASS[size],
          appearanceClass,
          glow && "animate-status-glow",
          className,
        )}
        style={glowStyle}
        {...rest}
      >
        {Icon ? (
          <Icon
            aria-hidden="true"
            className={cn("size-3.5 shrink-0", appearance === "outline" && token.icon)}
          />
        ) : showDot ? (
          <StatusDot
            tone={tone}
            size="sm"
            animation={pulse ? "ping" : "none"}
          />
        ) : null}
        <span>{label}</span>
      </span>
    );
  },
);

StatusBadge.displayName = "StatusBadge";
