import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { slotAttributes } from "../../design/slot-style";
import {
  emptyStateActionStyle,
  emptyStateDescriptionStyle,
  emptyStateFooterStyle,
  emptyStateIconStyle,
  emptyStateStyle,
  emptyStateTitleStyle,
} from "./empty-state.style";

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
   * Attributes for the icon's badge beside {@link iconClassName}, such as the `data-part` marks a
   * caller's design declaration draws the tint with (`partAttributes`).
   */
  iconAttributes?: Readonly<Record<string, string>>;
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
  iconAttributes,
  footer,
  className,
}: EmptyStateProps) {
  const compact = size === "sm";
  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      {...slotAttributes(emptyStateStyle, { size })}
    >
      {icon && (
        <div
          className={cn(
            // `inline-flex` with the glyph centred, so the badge is a circle whatever is put in
            // it. As a plain block with padding it took the icon's own line box, and an icon of a
            // different aspect drew an oval.
            "inline-flex items-center justify-center",
            compact ? "size-9 [&_svg]:size-5" : "size-16 [&_svg]:size-8",
            iconClassName,
          )}
          {...iconAttributes}
          {...slotAttributes(emptyStateIconStyle, { size })}
        >
          {icon}
        </div>
      )}
      <p {...slotAttributes(emptyStateTitleStyle, { size })}>{title}</p>
      {description && (
        <p className="w-full" {...slotAttributes(emptyStateDescriptionStyle, { size })}>{description}</p>
      )}
      {action && <div {...slotAttributes(emptyStateActionStyle, { size })}>{action}</div>}
      {footer && (
        <p {...slotAttributes(emptyStateFooterStyle, { size })}>
          {footer}
        </p>
      )}
    </div>
  );
}
