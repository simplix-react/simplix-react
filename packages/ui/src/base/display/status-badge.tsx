import { type ComponentPropsWithRef, type ReactNode, forwardRef } from "react";

import { type IconComponent, type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";
import { StatusDot } from "./status-dot";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { statusBadgeStyle } from "./status-badge.style";

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
  /** Animate the leading dot/icon (passes `animation="ping"` to the inner dot). */
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
 * (and pulses when `pulse` is set).
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
      ...rest
    },
    ref,
  ) => {
    const token = useStatusTones()[tone];
    const appearanceClass = appearance === "filled" ? token.badge : token.outline;
    const iconTone = appearance === "outline" ? token.icon : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap",
          appearanceClass,
          className,
        )}
        {...rest}
        {...slotAttributes(statusBadgeStyle, { size, appearance })}
      >
        {Icon ? (
          <Icon
            aria-hidden="true"
            className={cn("size-3.5 shrink-0", iconTone)}
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
