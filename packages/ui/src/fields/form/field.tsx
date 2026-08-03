import type { CommonFieldProps } from "../../crud/shared/types";
import { FieldWrapper, type FieldWrapperChildren } from "../shared/field-wrapper";

/** Props for the generic {@link Field} form wrapper. */
export interface FormFieldProps extends CommonFieldProps {
  children: FieldWrapperChildren;
}

/**
 * Generic field wrapper for custom content. Provides label, error,
 * and description display around arbitrary children.
 *
 * Take the render-function form when the content has a control of its own —
 * it hands over the ids the label needs, which is what gives the control an
 * accessible name.
 *
 * @example
 * ```tsx
 * <Field label="Custom Widget" error={errors.widget}>
 *   {({ id }) => <MyCustomWidget id={id} value={val} onChange={setVal} />}
 * </Field>
 * ```
 */
export function Field({
  children,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: FormFieldProps) {
  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      {children}
    </FieldWrapper>
  );
}
