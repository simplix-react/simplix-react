import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
} from "react";

import { createSelfResolving } from "../provider/self-resolving";
import { cn } from "../utils/cn";

/** CVA variants for the Text component body typography scale. */
const textVariants = cva("font-normal", {
  variants: {
    size: {
      lg: "text-lg",
      base: "text-base",
      sm: "text-sm",
      caption: "text-xs",
      /**
       * Take the size of whatever encloses it. The default, so a Text that was not asked for a
       * size does not impose one.
       *
       * <p>A typography primitive that defaults to a fixed size cannot compose: a table cell
       * declares its record text at `text-sm` and the Text inside it silently renders at
       * `text-base`, so the size the cell set never appears on screen. Nothing errors, the diff
       * reads correctly, and the row is simply a size larger than every other row on the page.
       * Inheriting makes the enclosing context the answer, which is what a caller who named no
       * size meant.
       */
      inherit: "",
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
    /**
     * How heavy the text is.
     *
     * <p>Inherits by default, for the reason `size` does: a primitive that imposes a weight cannot
     * sit inside a heading or a cell that already set one. Named here because a caller who wants
     * emphasis has nowhere else to say it — two dozen screens of one product were writing
     * `className="font-medium"`, which reaches past the primitive to the stylesheet and stops
     * moving when the type scale does.
     */
    weight: {
      inherit: "",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: { size: "inherit", tone: "default", weight: "inherit" },
});

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
  ({ className, size, tone, font, as, children, ...rest }, ref) => {
    const Tag = as ?? (font === "mono" ? "code" : "p");
    return (
      <Tag
        ref={ref as ComponentPropsWithRef<typeof Tag>["ref"]}
        className={cn(textVariants({ size, tone, font }), className)}
        {...(rest as ComponentPropsWithRef<ElementType>)}
      >
        {children}
      </Tag>
    );
  },
);
TextBase.displayName = "Text";

export const Text = createSelfResolving("Text", TextBase);

export { textVariants };
