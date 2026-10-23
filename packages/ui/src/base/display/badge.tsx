import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { createSelfResolving } from "../../provider/self-resolving";
import { slotAttributes, slotClassNames } from "../../design/slot-style";
import { badgeStyle } from "./badge.style";

const badgeVariants = slotClassNames(badgeStyle);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export interface BadgeProps
  extends ComponentPropsWithRef<"span">,
    BadgeVariants {
  /**
   * Render the single child element instead of a `<span>`, merging the badge
   * styling onto it (e.g. wrap an `<a>`).
   */
  asChild?: boolean;
}

export const BadgeBase = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, rounded, size, interactive, icon, empty, asChild, ...rest }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        className={className}
        {...rest}
        {...slotAttributes(badgeStyle, { variant, rounded, size, interactive, icon, empty })}
      />
    );
  },
);

BadgeBase.displayName = "Badge";

export const Badge = createSelfResolving("Badge", BadgeBase);

export { badgeVariants };
