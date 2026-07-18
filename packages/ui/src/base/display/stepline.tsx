import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** One entry of {@link Stepline}. */
export interface SteplineItem {
  /** Stable key (also the value {@link SteplineProps.current} points at). */
  key: string;
  /** Step label. */
  label: ReactNode;
}

/** Props for the {@link Stepline} component. */
export interface SteplineProps {
  /** Ordered steps. */
  items: SteplineItem[];
  /** Key of the active step; steps before it render as done. */
  current?: string;
  /**
   * Keys rendered as done regardless of position — for flows whose completion
   * is judged out of order (e.g. server-reported step states).
   */
  completedKeys?: string[];
  className?: string;
}

/**
 * Vertical step indicator for short guided flows: done steps show a filled
 * dot, the active step is emphasized, upcoming steps stay muted. Purely
 * presentational — the caller owns which step is active.
 *
 * @example
 * ```tsx
 * <Stepline
 *   items={[
 *     { key: "register", label: "Register" },
 *     { key: "sign", label: "Sign agreements" },
 *     { key: "training", label: "Complete training" },
 *   ]}
 *   current="sign"
 * />
 * ```
 */
export function Stepline({ items, current, completedKeys, className }: SteplineProps) {
  const currentIndex = current ? items.findIndex((item) => item.key === current) : -1;
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        const isCurrent = item.key === current;
        const isDone =
          !isCurrent &&
          ((currentIndex >= 0 && index < currentIndex) || completedKeys?.includes(item.key) === true);
        return (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-2 text-sm",
              isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-4 shrink-0 rounded-full border-2",
                isCurrent && "border-foreground bg-foreground",
                isDone && "border-muted-foreground bg-muted",
                !isCurrent && !isDone && "border-muted-foreground",
              )}
            />
            {item.label}
          </li>
        );
      })}
    </ol>
  );
}
