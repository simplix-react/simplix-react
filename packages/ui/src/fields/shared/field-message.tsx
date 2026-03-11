import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../../utils/cn";

const fieldMessageVariants = cva("text-xs leading-3.5", {
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

const hasIcon = (variant: FieldMessageProps["variant"]) =>
  variant === "error" || variant === "warning";

/**
 * Inline message for form fields supporting error, warning, info, and description variants.
 * Error and warning variants display an alert icon for visual emphasis.
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
    <p
      className={cn(
        fieldMessageVariants({ variant }),
        hasIcon(variant) && "flex items-center gap-1",
        className,
      )}
      role={role}
    >
      {hasIcon(variant) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )}
      {children}
    </p>
  );
}

export { fieldMessageVariants };
