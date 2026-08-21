import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
  type ReactNode,
} from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { cn } from "../utils/cn";

/** CVA variants for the Card component visual configuration. */
const cardVariants = cva(
  "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      /**
       * Horizontal and vertical padding are set apart, and the vertical one is a step smaller.
       *
       * <p>A card is wider than it is tall and its content is lines of text, so equal padding on
       * all four sides spends the height that lines would use on empty space above and below them
       * — a three-line stat card came out 130px tall, of which 48px was padding. The sides still
       * need the full step: that is the gutter between the border and the first character, and
       * narrowing it makes the text look pressed against the edge.
       */
      padding: {
        none: "",
        sm: "px-4 py-3",
        md: "px-6 py-4",
        lg: "px-8 py-6",
      },
      /** Take the whole width of whatever holds it — a card that IS the column it sits in. */
      fill: { true: "w-full", false: "" },

      interactive: {
        true: "cursor-pointer hover:border-primary/30 hover:shadow-md transition-all",
        false: "",
      },
    },
    defaultVariants: { padding: "md", interactive: false, fill: false },
  },
);

/** Variant props extracted from {@link cardVariants}. */
export type CardVariants = VariantProps<typeof cardVariants>;

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
        className={cn(
          cardVariants({ padding, interactive }),
          Tag === "button" && "w-full text-left",
          className,
        )}
        {...(rest as ComponentPropsWithRef<ElementType>)}
      >
        {children}
      </Tag>
    );
  },
);
CardBase.displayName = "Card";

export const Card = createSelfResolving("Card", CardBase);

export { cardVariants };
