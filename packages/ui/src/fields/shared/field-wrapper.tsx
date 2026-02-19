import { type VariantProps, cva } from "class-variance-authority";
import { type ReactNode, useId } from "react";

import { type FieldVariant, useFieldVariant } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn, toTestId } from "../../utils/cn";

const fieldWrapperVariants = cva("", {
  variants: {
    labelPosition: {
      top: "flex flex-col gap-1.5",
      left: "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1",
      hidden: "flex flex-col gap-1.5",
    },
    size: {
      sm: "[&_label]:text-xs [&_input]:h-8 [&_input]:text-sm",
      md: "[&_label]:text-sm [&_input]:h-10 [&_input]:text-base",
      lg: "[&_label]:text-base [&_input]:h-12 [&_input]:text-lg",
    },
  },
  defaultVariants: { labelPosition: "top", size: "md" },
});

/** Variant props extracted from {@link fieldWrapperVariants}. */
export type FieldWrapperVariants = VariantProps<typeof fieldWrapperVariants>;

/** Props for the {@link FieldWrapper} component. */
export interface FieldWrapperProps extends Partial<FieldVariant> {
  /** Visible label text for the field. */
  label?: string;
  /** i18n key for label resolution. */
  labelKey?: string;
  /** Error message displayed below the field. */
  error?: string;
  /** Help text displayed below the field. */
  description?: string;
  /** Whether the field is required (shows asterisk). */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a form input with label, description, and error display.
 * Handles label positioning, accessibility attributes, and field variants.
 */
export function FieldWrapper({
  label,
  error,
  description,
  required,
  className,
  children,
  ...variantOverride
}: FieldWrapperProps) {
  const { labelPosition, size } = useFieldVariant(variantOverride);
  const { Label } = useUIComponents();
  const id = useId();

  const isHidden = labelPosition === "hidden";
  const testId = label ? `form-field-${toTestId(label)}` : undefined;

  return (
    <fieldset
      className={cn(
        fieldWrapperVariants({ labelPosition, size }),
        className,
      )}
      disabled={variantOverride.disabled ?? undefined}
      data-testid={testId}
      aria-label={isHidden && label ? label : undefined}
    >
      {label && !isHidden && (
        <Label htmlFor={id}>
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}

      {isHidden && label ? (
        <span className="sr-only" id={`${id}-label`}>
          {label}
        </span>
      ) : null}

      {/* Content area - spans full width in left layout for description/error */}
      {labelPosition === "left" ? (
        <>
          {children}
          {/* Description and error occupy the second column */}
          {description && (
            <>
              <span />
              <p className="text-muted-foreground text-sm">{description}</p>
            </>
          )}
          {error && (
            <>
              <span />
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            </>
          )}
        </>
      ) : (
        <>
          {children}
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </fieldset>
  );
}

export { fieldWrapperVariants };
