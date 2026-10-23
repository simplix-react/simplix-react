import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { slotAttributes, slotClassNames } from "../design/slot-style";
import { headingStyle } from "./heading.style";

/** Class string of the heading scale, drawn from {@link headingStyle}. */
const headingVariants = slotClassNames(headingStyle);

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
 * <Heading level={3} id="section-title">Section Title</Heading>
 * <Heading level={5} as="h2">Visually small but semantically h2</Heading>
 * ```
 */
export const HeadingBase = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, tone, font, as, children, ...rest }, ref) => {
    const Tag = as ?? levelToTag[level as HeadingLevel];
    return (
      <Tag
        ref={ref}
        className={className}
        {...rest}
        {...slotAttributes(headingStyle, { level: String(level), tone, font })}
      >
        {children}
      </Tag>
    );
  },
);
HeadingBase.displayName = "Heading";

export const Heading = createSelfResolving("Heading", HeadingBase);

export { headingVariants };
