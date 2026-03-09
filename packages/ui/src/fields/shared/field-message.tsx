import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../../utils/cn";

const fieldMessageVariants = cva("text-sm", {
  variants: {
    variant: {
      error: "text-destructive",
      warning: "text-warning",
      info: "text-info",
      description: "text-muted-foreground",
    },
  },
  defaultVariants: { variant: "error" },
});

/** Props for the {@link FieldMessage} component. */
export interface FieldMessageProps extends VariantProps<typeof fieldMessageVariants> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline message for form fields supporting error, warning, info, and description variants.
 *
 * @example
 * ```tsx
 * <FieldMessage variant="error">This field is required</FieldMessage>
 * <FieldMessage variant="warning">SCP Number already in use</FieldMessage>
 * <FieldMessage variant="info">Range: 1–1024</FieldMessage>
 * ```
 */
export function FieldMessage({ variant, children, className }: FieldMessageProps) {
  const role =
    variant === "error" ? "alert" : variant === "warning" || variant === "info" ? "status" : undefined;

  return (
    <p className={cn(fieldMessageVariants({ variant }), className)} role={role}>
      {children}
    </p>
  );
}

export { fieldMessageVariants };
