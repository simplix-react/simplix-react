import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
  type ReactNode,
  useContext,
} from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";

/** CVA variants for the Card component visual configuration. */
const cardVariants = cva(
  "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:border-primary/30 hover:shadow-md transition-all",
        false: "",
      },
    },
    defaultVariants: { padding: "md", interactive: false },
  },
);

/** Variant props extracted from {@link cardVariants}. */
export type CardVariants = VariantProps<typeof cardVariants>;

type CardTag = "div" | "button" | "article";

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
const CardBase = forwardRef<HTMLElement, CardProps>(
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

export const Card = forwardRef<HTMLElement, CardProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Card) {
      return <ctx.Card {...props} />;
    }
    return <CardBase ref={ref} {...props} />;
  },
);
Card.displayName = "Card";

export { cardVariants };
