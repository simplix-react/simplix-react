import { type VariantProps, cva } from "class-variance-authority";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useThemeFonts } from "../theme/theme-provider";
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
      sans: "",
      display: "",
      mono: "",
    },
  },
  defaultVariants: { level: 1, tone: "default" },
});

/** Variant props extracted from {@link headingVariants}. */
export type HeadingVariants = VariantProps<typeof headingVariants>;

/** Props for the {@link Heading} component. */
export interface HeadingProps extends RNTextProps, HeadingVariants {}

/**
 * Typography primitive for headings with a consistent type scale — the same
 * prop language as the web `Heading` (levels 1-6).
 *
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={3}>Section Title</Heading>
 * ```
 */
export function Heading({
  className,
  level = 1,
  tone,
  font,
  style,
  ...rest
}: HeadingProps) {
  const fonts = useThemeFonts();
  const fontFamily = font ? fonts[font] : (fonts.display ?? fonts.sans);

  return (
    <RNText
      accessibilityRole="header"
      className={cn(headingVariants({ level, tone, font }), className)}
      style={[fontFamily ? { fontFamily } : undefined, style]}
      {...rest}
    />
  );
}

export { headingVariants };
