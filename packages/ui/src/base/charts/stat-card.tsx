import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { STATUS_TONES, type StatusTone } from "../status-tone";

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
  return (
    <div
      className={cn(
        "rounded-lg border p-6 text-card-foreground shadow-sm",
        highlighted && tone ? STATUS_TONES[tone].surface : "bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {headerExtra}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              trend.value >= 0 ? STATUS_TONES.success.icon : STATUS_TONES.danger.icon,
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}%{trend.label ? ` ${trend.label}` : ""}
          </p>
        )}
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
