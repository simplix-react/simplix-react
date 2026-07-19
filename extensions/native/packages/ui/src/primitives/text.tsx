import { type VariantProps, cva } from "class-variance-authority";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useThemeFonts } from "../theme/theme-provider";
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
      sans: "",
      display: "",
      mono: "",
    },
  },
  defaultVariants: { size: "base", tone: "default" },
});

/** Variant props extracted from {@link textVariants}. */
export type TextVariants = VariantProps<typeof textVariants>;

/** Props for the {@link Text} component. */
export interface TextProps extends RNTextProps, TextVariants {}

/**
 * Typography primitive for body text with a consistent type scale — the same
 * prop language as the web `Text`. Brand fonts resolve through the theme
 * provider's `fonts` seam.
 *
 * @example
 * ```tsx
 * <Text size="lg">Body text large for emphasis</Text>
 * <Text size="sm" tone="muted">Secondary info</Text>
 * <Text font="mono" size="sm">const x = 42;</Text>
 * ```
 */
export function Text({ className, size, tone, font, style, ...rest }: TextProps) {
  const fonts = useThemeFonts();
  const fontFamily = font ? fonts[font] : fonts.sans;

  return (
    <RNText
      className={cn(textVariants({ size, tone, font }), className)}
      style={[fontFamily ? { fontFamily } : undefined, style]}
      {...rest}
    />
  );
}

export { textVariants };
