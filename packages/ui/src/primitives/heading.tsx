import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";

/** CVA variants for the Heading component typography scale. */
const headingVariants = cva("tracking-tight", {
  variants: {
    level: {
      1: "text-4xl font-bold",
      2: "text-3xl font-semibold",
      3: "text-2xl font-semibold",
      4: "text-xl font-semibold",
      5: "text-lg font-medium",
      6: "text-base font-medium",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    font: {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    },
  },
  defaultVariants: { level: 1, tone: "default" },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const levelToTag: Record<HeadingLevel, HeadingTag> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

/** Variant props extracted from {@link headingVariants}. */
export type HeadingVariants = VariantProps<typeof headingVariants>;

/** Props for the {@link Heading} component. */
export interface HeadingProps
  extends ComponentPropsWithRef<"h1">,
    HeadingVariants {
  /** Override the rendered HTML tag (default: matches level). */
  as?: HeadingTag;
}

/**
 * Typography primitive for headings (h1–h6) with a consistent type scale.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={3} className="mb-6">Section Title</Heading>
 * <Heading level={5} as="h2">Visually small but semantically h2</Heading>
 * ```
 */
const HeadingBase = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, tone, font, as, children, ...rest }, ref) => {
    const Tag = as ?? levelToTag[level as HeadingLevel];
    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ level, tone, font }), className)}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
HeadingBase.displayName = "Heading";

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Heading) {
      return <ctx.Heading {...props} />;
    }
    return <HeadingBase ref={ref} {...props} />;
  },
);
Heading.displayName = "Heading";

export { headingVariants };
