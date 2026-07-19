import { type VariantProps, cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";

import { cn } from "../utils/cn";

/** CVA variants for the Card component visual configuration. */
const cardVariants = cva("rounded-lg border border-border bg-card shadow-sm", {
  variants: {
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: { padding: "md" },
});

/** Variant props extracted from {@link cardVariants}. */
export type CardVariants = VariantProps<typeof cardVariants>;

/** Props for the {@link Card} component. */
export interface CardProps extends ViewProps, CardVariants {
  /** Renders as a pressable card with press feedback. */
  onPress?: PressableProps["onPress"];
  children?: ReactNode;
}

/**
 * Visual container primitive with border, background, and shadow.
 * Passing `onPress` renders a pressable card with touch feedback.
 *
 * @example
 * ```tsx
 * <Card>Static content card</Card>
 * <Card onPress={handlePress} padding="sm">Tappable card</Card>
 * ```
 */
export function Card({ className, padding, onPress, children, ...rest }: CardProps) {
  const classes = cn(cardVariants({ padding }), className);

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(classes, "active:opacity-80")}
        accessibilityRole="button"
        {...(rest as PressableProps)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...rest}>
      {children}
    </View>
  );
}

export { cardVariants };
