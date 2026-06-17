import { type ComponentPropsWithRef, type ReactNode, forwardRef } from "react";

import { type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";
import { cn } from "../../utils/cn";

/** Dot size token → Tailwind `size-*` class for both the ring layer and the dot. */
const DOT_SIZE: Record<NonNullable<StatusDotProps["size"]>, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-3",
};

export interface StatusDotProps
  extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** Semantic tone driving the dot/ring color. */
  tone: StatusTone;
  /** Diameter token: `sm`=size-1.5, `md`=size-2 (default), `lg`=size-3. */
  size?: "sm" | "md" | "lg";
  /** Animated ring affordance behind the dot. `none` (default) renders no ring. */
  animation?: "none" | "ping" | "flash";
  /**
   * When `false`, the indicator is dimmed to a neutral dot and the ring is
   * suppressed regardless of `animation`. Defaults to `true`.
   */
  active?: boolean;
  /** Optional foreground (e.g. an icon) rendered in place of the solid dot. */
  children?: ReactNode;
  /** Accessible label exposed via `aria-label`. */
  label?: string;
}

/**
 * Small status indicator dot with an optional animated ring.
 *
 * Renders a solid tone-colored dot (or custom `children`) inside a relatively
 * positioned wrapper. When `animation` is `ping`/`flash` and `active`, an
 * absolutely positioned ring layer pulses behind the foreground. When `active`
 * is `false`, the dot collapses to the neutral tone and no ring is shown.
 *
 * @example
 * ```tsx
 * <StatusDot tone="success" />
 * <StatusDot tone="processing" animation="ping" label="Syncing" />
 * ```
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  (
    {
      tone,
      size = "md",
      animation = "none",
      active = true,
      children,
      label,
      className,
      ...rest
    },
    ref,
  ) => {
    const tones = useStatusTones();
    const sizeClass = DOT_SIZE[size];
    // Inactive indicators read as "off": force neutral hue, drop the ring.
    const dotClass = active ? tones[tone].dot : tones.neutral.dot;
    const showRing = active && animation !== "none";

    return (
      <span
        ref={ref}
        aria-label={label}
        role={label ? "img" : undefined}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          sizeClass,
          !active && "opacity-60",
          className,
        )}
        {...rest}
      >
        {showRing ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-full opacity-75",
              sizeClass,
              tones[tone].ring,
              animation === "ping" ? "animate-ping" : "animate-status-flash",
            )}
          />
        ) : null}
        {children ?? (
          <span
            aria-hidden="true"
            className={cn("relative rounded-full", sizeClass, dotClass)}
          />
        )}
      </span>
    );
  },
);

StatusDot.displayName = "StatusDot";
