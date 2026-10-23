import type { ReactNode } from "react";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";
import {
  statCardBodyStyle,
  statCardDescriptionStyle,
  statCardFooterStyle,
  statCardHeaderStyle,
  statCardIconStyle,
  statCardStyle,
  statCardTitleStyle,
  statCardTrendStyle,
  statCardValueStyle,
} from "./stat-card.style";

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
      className={cn(highlighted && tone ? tones[tone].surface : undefined, className)}
      {...slotAttributes(statCardStyle, { tinted: highlighted && !!tone })}
    >
      {/* Three rows — what it is called, the figure, what the figure was read from — and the shape
          beside the figure rather than under it, which is how the wireframe board draws the same
          tile. The label owns its own row so a long one is not competing with the figure for the
          width, and the figure starts at the card's left edge where the eye already is after
          reading the label. */}
      <div className="flex min-w-0 items-center" {...slotAttributes(statCardHeaderStyle, {})}>
        <p className="truncate" {...slotAttributes(statCardTitleStyle, {})}>{title}</p>
        {headerExtra}
        {icon && <span className="shrink-0" {...slotAttributes(statCardIconStyle, {})}>{icon}</span>}
      </div>
      <div className="flex items-end justify-between" {...slotAttributes(statCardBodyStyle, {})}>
        <p className="min-w-0 truncate" {...slotAttributes(statCardValueStyle, {})}>{value}</p>
        {/* 84px is the width the wireframe board draws a sparkline at, so a plot moved from a frame
            into a tile arrives at the size it was drawn. Nothing is rendered where there is no plot
            — the figure is left-aligned either way, so an empty box would reserve a column that
            already looks reserved, on the 94% of tiles that carry no plot at all. */}
        {chart && <div className="w-[84px] shrink-0">{chart}</div>}
      </div>
      {(description || trend) && (
        <div className="flex items-baseline justify-between" {...slotAttributes(statCardFooterStyle, {})}>
          {description ? (
            <p className="min-w-0" {...slotAttributes(statCardDescriptionStyle, {})}>{description}</p>
          ) : (
            <span />
          )}
          {trend && (
            <p
              className={cn("shrink-0", trend.value >= 0 ? tones.success.icon : tones.danger.icon)}
              {...slotAttributes(statCardTrendStyle, {})}
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
