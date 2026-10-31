import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
} from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { slotAttributes, slotClassNames } from "../design/slot-style";
import { textStyle } from "./text.style";

/** Class string of the text scale, drawn from {@link textStyle}. */
const textVariants = slotClassNames(textStyle);

/** Variant props extracted from {@link textVariants}. */
export type TextVariants = VariantProps<typeof textVariants>;

export type TextTag = "p" | "span" | "div" | "label" | "code";

/** Props for the {@link Text} component. */
export interface TextProps
  extends ComponentPropsWithRef<"p">,
    TextVariants {
  /** Override the rendered HTML tag (default: "p", "code" when font="mono"). */
  as?: TextTag;
}

/**
 * Typography primitive for body text with a consistent type scale.
 *
 * <p><b>With no `size`, it takes the size of what encloses it</b> — the application's body size in
 * a page, the cell's size in a table row, the caption size in a footer. State a size only where
 * the text is meant to differ from its surroundings.
 *
 * @example
 * ```tsx
 * <Text size="lg">Body text large for emphasis</Text>
 * <Text>Body text at whatever size the context sets</Text>
 * <Text size="sm">Smaller text for secondary info</Text>
 * <Text size="caption">Caption text for labels and hints</Text>
 * <Text font="mono" size="sm">const x = 42;</Text>
 * <Text font="display">Display font text</Text>
 * ```
 */
export const TextBase = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, tone, font, weight, align, as, children, ...rest }, ref) => {
    const Tag = as ?? (font === "mono" ? "code" : "p");
    return (
      <Tag
        ref={ref as ComponentPropsWithRef<typeof Tag>["ref"]}
        className={className}
        {...(rest as ComponentPropsWithRef<ElementType>)}
        {...slotAttributes(textStyle, { size, tone, font, weight, align })}
      >
        {children}
      </Tag>
    );
  },
);
TextBase.displayName = "Text";

export const Text = createSelfResolving("Text", TextBase);

export { textVariants };
