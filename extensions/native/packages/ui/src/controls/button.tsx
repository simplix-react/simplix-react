import { type VariantProps, cva } from "class-variance-authority";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-background",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        sm: "h-9 px-3",
        default: "h-11 px-4",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
        /** Kiosk-grade touch target: enlarged height, padding, and spacing. */
        touch: "h-16 px-8",
      },
      disabled: {
        true: "opacity-50",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
    },
    size: {
      sm: "text-sm",
      default: "text-base",
      lg: "text-lg",
      icon: "text-base",
      touch: "text-xl",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

/** Variant props extracted from {@link buttonVariants}. */
export type ButtonVariants = VariantProps<typeof buttonVariants>;

/** Props for the {@link Button} component. */
export interface ButtonProps
  extends Omit<PressableProps, "children" | "disabled">,
    Omit<ButtonVariants, "disabled"> {
  /** String children render in the variant's text style; nodes render as-is. */
  children?: ReactNode;
  disabled?: boolean;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  className?: string;
}

/**
 * Pressable button with the web variant vocabulary
 * (default / secondary / outline / ghost / destructive) plus a kiosk-grade
 * `size="touch"` for large touch targets.
 *
 * @example
 * ```tsx
 * <Button onPress={submit}>Save</Button>
 * <Button variant="outline" size="touch" onPress={checkIn}>Check In</Button>
 * ```
 */
export function Button({
  className,
  variant,
  size,
  disabled,
  loading,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, disabled: isDisabled }), className)}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" /> : null}
      {typeof children === "string" ? (
        <Text className={buttonTextVariants({ variant, size })}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { buttonVariants, buttonTextVariants };
