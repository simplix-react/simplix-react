import { Fragment, type ReactNode } from "react";
import { Check } from "lucide-react";
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
  /**
   * Layout direction. Horizontal (default) renders numbered circles joined by
   * connector lines — the classic wizard stepper; vertical stacks the same
   * circles with labels beside them for tall sidebars.
   * @defaultValue "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

type StepState = "done" | "current" | "upcoming";

function stateOf(
  item: SteplineItem,
  index: number,
  currentIndex: number,
  current: string | undefined,
  completedKeys: string[] | undefined,
): StepState {
  if (item.key === current) return "current";
  if ((currentIndex >= 0 && index < currentIndex) || completedKeys?.includes(item.key) === true) {
    return "done";
  }
  return "upcoming";
}

function StepCircle({ state, ordinal }: { state: StepState; ordinal: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
        state === "done" && "border-primary bg-primary text-primary-foreground",
        state === "current" && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
        state === "upcoming" && "border-muted-foreground/40 bg-background text-muted-foreground",
      )}
    >
      {state === "done" ? <Check className="size-4" /> : ordinal}
    </span>
  );
}

/**
 * Wizard step indicator: numbered circles joined by connector lines, so a step
 * reads as a position in a sequence — done steps show a check, the active step
 * is highlighted, upcoming steps stay muted. Purely presentational — the
 * caller owns which step is active.
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
export function Stepline({
  items,
  current,
  completedKeys,
  orientation = "horizontal",
  className,
}: SteplineProps) {
  const currentIndex = current ? items.findIndex((item) => item.key === current) : -1;

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {items.map((item, index) => {
          const state = stateOf(item, index, currentIndex, current, completedKeys);
          return (
            <li key={item.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepCircle state={state} ordinal={index + 1} />
                {index < items.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "min-h-4 w-0.5 flex-1",
                      state === "done" ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "pb-4 pt-1 text-sm",
                  state === "current" ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={cn("flex w-full items-start", className)}>
      {items.map((item, index) => {
        const state = stateOf(item, index, currentIndex, current, completedKeys);
        const reached = currentIndex >= 0 && index <= currentIndex;
        return (
          <Fragment key={item.key}>
            {index > 0 ? (
              <span
                aria-hidden
                className={cn("mt-3.5 h-0.5 min-w-4 flex-1", reached ? "bg-primary" : "bg-border")}
              />
            ) : null}
            <li className="flex max-w-28 flex-col items-center gap-1 px-1">
              <StepCircle state={state} ordinal={index + 1} />
              <span
                className={cn(
                  "text-center text-xs leading-tight",
                  state === "current" ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
