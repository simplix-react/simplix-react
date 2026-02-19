import type { ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the generic {@link Field} form wrapper. */
export interface FormFieldProps extends CommonFieldProps {
  children: ReactNode;
}

/**
 * Generic field wrapper for custom content. Provides label, error,
 * and description display around arbitrary children.
 *
 * @example
 * ```tsx
 * <Field label="Custom Widget" error={errors.widget}>
 *   <MyCustomWidget value={val} onChange={setVal} />
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
