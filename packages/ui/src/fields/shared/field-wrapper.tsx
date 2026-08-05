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
      trailing: "flex flex-col gap-1",
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

/**
 * Identifiers a {@link FieldWrapper} hands to the control it wraps so the label
 * actually names it in the accessibility tree.
 *
 * - `id` — put it on a labelable control (`input`, `textarea`, `select`,
 *   `button`, and Radix primitives that render one). The wrapper's `<Label>`
 *   points its `htmlFor` here, so clicking the label focuses the control.
 * - `labelId` — the id of the rendered label element. Use it with
 *   `aria-labelledby` when the control is a composite with no single labelable
 *   element (radio group, time picker, rich-text editor, tag combobox).
 */
export interface FieldControlProps {
  /** Id for the labelable control the label points at. */
  id: string;
  /**
   * Id of the label element, for `aria-labelledby` on composite controls.
   * `undefined` when the field has no label — pointing `aria-labelledby` at a
   * missing id would blank out a name the control derives from its content.
   */
  labelId: string | undefined;
}

/**
 * Children accepted by {@link FieldWrapper}. Prefer the render-function form —
 * it receives the ids the label needs, which is the only way the control ends
 * up with an accessible name.
 */
export type FieldWrapperChildren =
  | ReactNode
  | ((control: FieldControlProps) => ReactNode);

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
  children: FieldWrapperChildren;
}

/**
 * Wraps a form input with label, description, and error/warning display.
 * Handles label positioning, accessibility attributes, and field variants.
 *
 * Message priority: error > warning > (description is always shown).
 *
 * @example Naming the control
 * ```tsx
 * <FieldWrapper label="Name">
 *   {({ id }) => <Input id={id} value={v} onChange={…} />}
 * </FieldWrapper>
 * ```
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
  const labelId = `${id}-label`;

  const isHidden = layout === "hidden";
  const testId = label ? `form-field-${toTestId(label)}` : undefined;
  const { labelExtra, disabled } = variantOverride;

  // The render-function form is what lets the label reach the control: the ids
  // are generated here, so only the field component knows where to put them.
  const control =
    typeof children === "function"
      ? children({ id, labelId: label ? labelId : undefined })
      : children;

  const inputRow = (prefixControl || suffixControl) ? (
    <div className="flex items-center gap-2">
      {prefixControl}
      <div className="flex-1 min-w-0">{control}</div>
      {suffixControl}
    </div>
  ) : (
    control
  );

  // Determine which status message to show (error takes priority over warning)
  const statusMessage = error ?? warning;
  const statusVariant = error ? "error" : warning ? "warning" : undefined;

  const labelText = label ? (
    <Label id={labelId} htmlFor={id}>
      {label}
      {required && (
        <span className="text-destructive ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  ) : null;

  const labelElement = label && !isHidden && layout !== "trailing" ? (
    <div className="flex items-center justify-between min-h-6">
      {labelText}
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
      // Fallback naming: children that took the ids name their own control, so
      // naming the group too would announce the label twice. Children that did
      // not — a composite with no labelable element, or arbitrary content from
      // a caller — reach the accessibility tree only through the group.
      aria-labelledby={
        label && !isHidden && typeof children !== "function" ? labelId : undefined
      }
    >
      {labelElement}

      {isHidden && label ? (
        <span className="sr-only" id={labelId}>
          {label}
        </span>
      ) : null}

      {/* Content area - spans full width in left layout for description/error */}
      {layout === "trailing" ? (
        <>
          {/* Settings-row style: label left, control right, a dashed leader
              line between the two. Messages start at the label's left edge. */}
          {label ? (
            <div className="flex min-h-6 items-center gap-3">
              {labelText}
              {labelExtra}
              <span
                aria-hidden="true"
                className="min-w-4 flex-1 border-b border-dashed border-border"
              />
              {inputRow}
            </div>
          ) : (
            inputRow
          )}
          {description && (
            <FieldMessage variant="description">{description}</FieldMessage>
          )}
          {statusMessage && statusVariant && (
            <FieldMessage variant={statusVariant}>{statusMessage}</FieldMessage>
          )}
        </>
      ) : layout === "left" ? (
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
