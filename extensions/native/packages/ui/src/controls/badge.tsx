import { type VariantProps, cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "flex-row items-center self-start rounded-full px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const badgeTextVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

/** Variant props extracted from {@link badgeVariants}. */
export type BadgeVariants = VariantProps<typeof badgeVariants>;

/** Props for the {@link Badge} component. */
export interface BadgeProps extends ViewProps, BadgeVariants {
  children?: ReactNode;
}

/**
 * Compact label badge with the web variant vocabulary.
 * For semantic status coloring use `StatusBadge` instead.
 */
export function Badge({ className, variant, children, ...rest }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...rest}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text className={badgeTextVariants({ variant })}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { badgeVariants, badgeTextVariants };
