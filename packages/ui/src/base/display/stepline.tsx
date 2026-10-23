import { Fragment, type ReactNode } from "react";
import { Check } from "lucide-react";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  steplineCircleStyle,
  steplineConnectorStyle,
  steplineItemStyle,
  steplineLabelStyle,
} from "./stepline.style";

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
      className="flex size-7 shrink-0 items-center justify-center"
      {...slotAttributes(steplineCircleStyle, { state })}
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
            <li
              key={item.key}
              className="flex"
              {...slotAttributes(steplineItemStyle, { orientation: "vertical" })}
            >
              <div className="flex flex-col items-center">
                <StepCircle state={state} ordinal={index + 1} />
                {index < items.length - 1 ? (
                  <span
                    aria-hidden
                    className="min-h-4 w-0.5 flex-1"
                    {...slotAttributes(steplineConnectorStyle, {
                      orientation: "vertical",
                      filled: state === "done",
                    })}
                  />
                ) : null}
              </div>
              <span
                {...slotAttributes(steplineLabelStyle, {
                  orientation: "vertical",
                  current: state === "current",
                })}
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
                className="h-0.5 min-w-4 flex-1"
                {...slotAttributes(steplineConnectorStyle, {
                  orientation: "horizontal",
                  filled: reached,
                })}
              />
            ) : null}
            <li
              className="flex max-w-28 flex-col items-center"
              {...slotAttributes(steplineItemStyle, { orientation: "horizontal" })}
            >
              <StepCircle state={state} ordinal={index + 1} />
              <span
                {...slotAttributes(steplineLabelStyle, {
                  orientation: "horizontal",
                  current: state === "current",
                })}
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
