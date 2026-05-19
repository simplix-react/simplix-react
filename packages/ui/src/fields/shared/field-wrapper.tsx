import { type VariantProps, cva } from "class-variance-authority";
import { type ReactNode, useId } from "react";

import { type FieldVariant, useFieldVariant } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn, toTestId } from "../../utils/cn";
import { FieldMessage } from "./field-message";

const fieldWrapperVariants = cva("py-1", {
  variants: {
    layout: {
      top: "flex flex-col gap-1",
      left: "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1",
      inline: "flex items-center justify-between gap-3",
      hidden: "flex flex-col gap-1.5",
    },
    size: {
      sm: "[&_label]:text-xs [&_input]:h-8 [&_input]:text-sm",
      md: "[&_label]:text-sm [&_input]:h-10 [&_input]:text-base",
      lg: "[&_label]:text-base [&_input]:h-12 [&_input]:text-lg",
    },
  },
  defaultVariants: { layout: "top", size: "sm" },
});

/** Variant props extracted from {@link fieldWrapperVariants}. */
export type FieldWrapperVariants = VariantProps<typeof fieldWrapperVariants>;

/** Props for the {@link FieldWrapper} component. */
export interface FieldWrapperProps extends Partial<FieldVariant> {
  /** Visible label text for the field. */
  label?: string;
  /** i18n key for label resolution. */
  labelKey?: string;
  /** Content rendered at the right side of the label area (e.g., LanguageSelector). */
  labelExtra?: ReactNode;
  /** Error message displayed below the field (highest priority). */
  error?: string;
  /** Warning message displayed below the field (shown when no error). */
  warning?: string;
  /** Help text displayed below the field. */
  description?: string;
  /** Whether the field is required (shows asterisk). */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /**
   * Control rendered on the leading (left in LTR) side of the input, on the same row.
   * Use for IconPicker, ColorPicker, or similar adornments.
   */
  prefixControl?: ReactNode;
  /**
   * Control rendered on the trailing (right in LTR) side of the input, on the same row.
   */
  suffixControl?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a form input with label, description, and error/warning display.
 * Handles label positioning, accessibility attributes, and field variants.
 *
 * Message priority: error > warning > (description is always shown).
 */
export function FieldWrapper({
  label,
  error,
  warning,
  description,
  required,
  prefixControl,
  suffixControl,
  className,
  children,
  ...variantOverride
}: FieldWrapperProps) {
  const { layout, size } = useFieldVariant(variantOverride);
  const { Label } = useFlatUIComponents();
  const id = useId();

  const isHidden = layout === "hidden";
  const testId = label ? `form-field-${toTestId(label)}` : undefined;
  const { labelExtra, disabled, labelKey, ...restVariant } = variantOverride;

  const inputRow = (prefixControl || suffixControl) ? (
    <div className="flex items-center gap-2">
      {prefixControl}
      <div className="flex-1 min-w-0">{children}</div>
      {suffixControl}
    </div>
  ) : (
    children
  );

  // Determine which status message to show (error takes priority over warning)
  const statusMessage = error ?? warning;
  const statusVariant = error ? "error" : warning ? "warning" : undefined;

  const labelElement = label && !isHidden ? (
    <div className="flex items-center justify-between min-h-6">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {labelExtra}
    </div>
  ) : null;

  return (
    <fieldset
      className={cn(
        fieldWrapperVariants({ layout, size }),
        className,
      )}
      disabled={disabled ?? undefined}
      data-testid={testId}
      aria-label={isHidden && label ? label : undefined}
    >
      {labelElement}

      {isHidden && label ? (
        <span className="sr-only" id={`${id}-label`}>
          {label}
        </span>
      ) : null}

      {/* Content area - spans full width in left layout for description/error */}
      {layout === "left" ? (
        <>
          {inputRow}
          {/* Description and status message occupy the second column */}
          {description && (
            <>
              <span />
              <FieldMessage variant="description">{description}</FieldMessage>
            </>
          )}
          {statusMessage && statusVariant && (
            <>
              <span />
              <FieldMessage variant={statusVariant}>{statusMessage}</FieldMessage>
            </>
          )}
        </>
      ) : (
        <>
          {inputRow}
          {description && (
            <FieldMessage variant="description">{description}</FieldMessage>
          )}
          {layout === "top" ? (
            statusMessage && statusVariant ? (
              <FieldMessage variant={statusVariant}>
                {statusMessage}
              </FieldMessage>
            ) : null
          ) : (
            statusMessage && statusVariant && (
              <FieldMessage variant={statusVariant}>
                {statusMessage}
              </FieldMessage>
            )
          )}
        </>
      )}
    </fieldset>
  );
}

export { fieldWrapperVariants };
