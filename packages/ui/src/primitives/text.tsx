import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
  useContext,
} from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";

/** CVA variants for the Text component body typography scale. */
const textVariants = cva("font-normal", {
  variants: {
    size: {
      lg: "text-lg",
      base: "text-base",
      sm: "text-sm",
      caption: "text-xs",
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
  defaultVariants: { size: "base", tone: "default" },
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
 * @example
 * ```tsx
 * <Text size="lg">Body text large for emphasis</Text>
 * <Text>Default body text for content</Text>
 * <Text size="sm">Smaller text for secondary info</Text>
 * <Text size="caption">Caption text for labels and hints</Text>
 * <Text font="mono" size="sm">const x = 42;</Text>
 * <Text font="display">Display font text</Text>
 * ```
 */
const TextBase = forwardRef<HTMLParagraphElement, TextProps>(
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

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Text) {
      return <ctx.Text {...props} />;
    }
    return <TextBase ref={ref} {...props} />;
  },
);
Text.displayName = "Text";

export { textVariants };
