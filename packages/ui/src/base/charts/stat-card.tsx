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
      {/* Two lines, not three. The label and the figure are one thought — 「조직: 39개」 — and
          stacking them spends a line on saying so; the basis underneath is the only thing that
          needs its own. Baseline-aligned so the four tiles read as one row of numbers rather than
          four boxes, and the figure sits at the end where the eye scanning a column of them
          expects it. */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          {headerExtra}
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        </div>
        <p className="shrink-0 text-2xl font-bold leading-none">{value}</p>
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
