import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";

export interface StatCardProps {
  /** Card title shown above the value. */
  title: string;
  /** Primary metric value. */
  value: string | number;
  /** Optional supporting text below the value. */
  description?: string;
  /** Optional icon rendered in the header's trailing slot. */
  icon?: ReactNode;
  /** Extra content rendered next to the title (e.g. a badge). */
  headerExtra?: ReactNode;
  /** Optional trend indicator; non-negative values render in the success tone, negative in danger. */
  trend?: { value: number; label?: string };
  /** Status tone for the soft surface tint; only applied when `highlighted` is true. */
  tone?: StatusTone;
  /** When true (and `tone` is set), tints the card surface with the tone instead of the default card background. */
  highlighted?: boolean;
  /** Extra classes merged onto the card root. */
  className?: string;
  /**
   * The shape behind the figure, drawn in the card's reserved right-hand region.
   *
   * <p>The region is held whether or not this is set, so a tile that plots and a tile that does
   * not are the same component rather than two that happen to resemble each other, and the figures
   * down a row of them stay in one column.
   */
  chart?: ReactNode;
  /** Optional content rendered below the value/description block. */
  children?: ReactNode;
}

/**
 * Compact metric card showing a title, a primary value, and optional trend,
 * description, icon, and footer content. Set `highlighted` together with a
 * `tone` to tint the card surface for emphasis.
 *
 * @param props - {@link StatCardProps}
 *
 * @example
 * ```tsx
 * <StatCard title="Active devices" value={128} trend={{ value: 12, label: "vs last week" }} />
 * <StatCard title="Errors" value={3} tone="danger" highlighted />
 * ```
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  headerExtra,
  trend,
  tone,
  highlighted = false,
  className,
  chart,
  children,
}: StatCardProps) {
  const tones = useStatusTones();
  return (
    <div
      className={cn(
        // Card's `sm` step, not its `md`. A figure tile is a card and must not sit taller than the
        // cards beside it; four of them across the top of a list screen is the first thing between
        // the header and the rows, and every row of padding there is a row of the list pushed off
        // the fold. The sides keep the full step — that is the gutter between the border and the
        // first character, and narrowing it makes the text look pressed against the edge.
        "rounded-lg border px-4 py-3 text-card-foreground shadow-sm",
        highlighted && tone ? tones[tone].surface : "bg-card",
        className,
      )}
    >
      {/* Three rows — what it is called, the figure, what the figure was read from — and the shape
          beside the figure rather than under it, which is how the wireframe board draws the same
          tile. The label owns its own row so a long one is not competing with the figure for the
          width, and the figure starts at the card's left edge where the eye already is after
          reading the label. */}
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
        {headerExtra}
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="min-w-0 truncate text-2xl font-bold leading-none">{value}</p>
        {/* Held whether or not anything plots yet: a figure allowed to run to the card's right edge
            leaves a plot nowhere to go, and the tile that later gets one would have to be laid out
            differently from the tiles beside it. 84px is the width the board draws a sparkline at,
            so a plot moved from a frame into a tile arrives at the size it was drawn. */}
        <div className="w-[84px] shrink-0" aria-hidden={chart ? undefined : true}>
          {chart}
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          {description ? (
            <p className="min-w-0 text-xs text-muted-foreground">{description}</p>
          ) : (
            <span />
          )}
          {trend && (
            <p
              className={cn(
                "shrink-0 text-xs font-medium",
                trend.value >= 0 ? tones.success.icon : tones.danger.icon,
              )}
            >
              {trend.value >= 0 ? "+" : ""}{trend.value}%{trend.label ? ` ${trend.label}` : ""}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
