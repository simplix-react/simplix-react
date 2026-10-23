import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
  type ReactNode,
} from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { slotAttributes, slotClassNames } from "../design/slot-style";
import { cn } from "../utils/cn";
import { cardStyle } from "./card.style";

/** CVA variants for the Card component's structure: width and pointer. */
const cardLayout = cva("", {
  variants: {
    /** Take the whole width of whatever holds it - a card that IS the column it sits in. */
    fill: { true: "w-full", false: "" },
    interactive: { true: "cursor-pointer", false: "" },
  },
  defaultVariants: { interactive: false, fill: false },
});

/** The card's drawn look (surface, padding, hover) as a class-string function. */
const cardLook = slotClassNames(cardStyle);

/** Class string for a card with the given variants: its layout classes plus its drawn look. */
const cardVariants = (props?: CardVariants): string => cn(cardLayout(props), cardLook(props));

/** Variant props extracted from {@link cardVariants}. */
export type CardVariants = VariantProps<typeof cardLayout> & VariantProps<typeof cardLook>;

export type CardTag = "div" | "button" | "article";

/** Props for the {@link Card} component. */
export interface CardProps
  extends ComponentPropsWithRef<"div">,
    CardVariants {
  /** Override the rendered HTML tag (default: "div", "button" when interactive). */
  as?: CardTag;
  children?: ReactNode;
}

/**
 * Visual container primitive with border, background, and shadow.
 *
 * @example
 * ```tsx
 * <Card>Static content card</Card>
 * <Card interactive onClick={handleClick}>Clickable card</Card>
 * <Card padding="lg">Large padding card</Card>
 * ```
 */
export const CardBase = forwardRef<HTMLElement, CardProps>(
  ({ className, padding, interactive, as, children, ...rest }, ref) => {
    const Tag = as ?? (interactive ? "button" : "div");
    return (
      <Tag
        ref={ref as ComponentPropsWithRef<typeof Tag>["ref"]}
        // fill is declared but not drawn and reaches the element as an attribute, as the class-string
        // form of this primitive did; drawing it changes the classic look.
        className={cn(cardLayout({ interactive }), Tag === "button" && "w-full", className)}
        {...(rest as ComponentPropsWithRef<ElementType>)}
        {...slotAttributes(cardStyle, { padding, interactive, button: Tag === "button" })}
      >
        {children}
      </Tag>
    );
  },
);
CardBase.displayName = "Card";

export const Card = createSelfResolving("Card", CardBase);

export { cardVariants };
