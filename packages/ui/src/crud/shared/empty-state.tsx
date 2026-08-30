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
  /**
   * The tint the icon's badge is painted with, where the KIND of state has a colour.
   *
   * <p>A caller wanting one used to wrap the icon in a badge of its own, which landed inside the
   * badge this already draws — two nested circles, the inner one an inline element that a
   * `rounded-full` stretches into an oval. The tint belongs to the badge that exists rather than
   * to a second one.
   */
  iconClassName?: string;
  /**
   * A quiet line under the actions — a status number, a correlation id, whatever support reads and
   * the operator does not act on.
   */
  footer?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "default",
  iconClassName,
  footer,
  className,
}: EmptyStateProps) {
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
            // `inline-flex` with the glyph centred, so the badge is a circle whatever is put in
            // it. As a plain block with padding it took the icon's own line box, and an icon of a
            // different aspect drew an oval.
            "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground",
            compact ? "mb-2 size-9 [&_svg]:size-5" : "mb-3 size-16 [&_svg]:size-8",
            iconClassName,
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
      {footer && (
        <p className={cn("text-muted-foreground", compact ? "mt-2 text-xs" : "mt-4 text-xs")}>
          {footer}
        </p>
      )}
    </div>
  );
}
