import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  headerExtra?: ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
  children?: ReactNode;
}

export function StatCard({ title, value, description, icon, headerExtra, trend, className, children }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 text-card-foreground shadow-sm", className)}>
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
          <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%{trend.label ? ` ${trend.label}` : ""}
          </p>
        )}
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
