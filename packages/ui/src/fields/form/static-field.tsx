import type { ReactNode } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link StaticField} form component. */
export interface StaticFieldProps extends CommonFieldProps {
  /** Text or numeric value to display. */
  value?: string | number | null;
  /** Fallback text when value is null/undefined. Defaults to em-dash. */
  fallback?: string;
  /** Custom content to render instead of value text. */
  children?: ReactNode;
}

/**
 * Read-only display field that uses form-style label.
 * Use this instead of `DetailFields.*` when mixing read-only values
 * with editable fields in a form to keep label styling consistent.
 *
 * @example
 * ```tsx
 * <StaticField label="Address" value={device.osdpAddress} layout="inline" />
 * <StaticField label="Status" layout="inline">
 *   <Badge>Online</Badge>
 * </StaticField>
 * ```
 */
export function StaticField({
  value,
  fallback = "\u2014",
  children,
  label,
  labelKey,
  className,
  ...variantProps
}: StaticFieldProps) {
  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      className={className}
      {...variantProps}
    >
      {children ?? <span className="text-sm">{value ?? fallback}</span>}
    </FieldWrapper>
  );
}
