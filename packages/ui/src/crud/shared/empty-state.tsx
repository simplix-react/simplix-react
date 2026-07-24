import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * Vertical weight. `"default"` fills an empty page or table body; `"sm"` is for
   * a panel section, where a full-height placeholder pushes the real content
   * off-screen for a state that carries no information.
   */
  size?: "default" | "sm";
  className?: string;
}

export function EmptyState({ icon, title, description, action, size = "default", className }: EmptyStateProps) {
  const compact = size === "sm";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border px-6 text-center",
        compact ? "py-5" : "py-16",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "rounded-full bg-muted text-muted-foreground",
            compact ? "mb-2 p-2 [&_svg]:size-5" : "mb-3 p-4 [&_svg]:size-8",
          )}
        >
          {icon}
        </div>
      )}
      <p className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{title}</p>
      {description && (
        <p className={cn("mt-1 w-full text-muted-foreground", compact ? "text-xs" : "text-sm")}>{description}</p>
      )}
      {action && <div className={compact ? "mt-2" : "mt-4"}>{action}</div>}
    </div>
  );
}
