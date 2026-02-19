import type { ReactNode } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the generic {@link DetailField} wrapper. */
export interface DetailFieldProps extends CommonDetailFieldProps {
  children: ReactNode;
}

/**
 * Generic detail field wrapper for custom content.
 * Provides label display around arbitrary children.
 *
 * @example
 * ```tsx
 * <DetailField label="Permissions">
 *   <PermissionsList permissions={user.permissions} />
 * </DetailField>
 * ```
 */
export function DetailField({
  children,
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailFieldProps) {
  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      {children}
    </DetailFieldWrapper>
  );
}
