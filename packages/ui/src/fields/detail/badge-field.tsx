import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

type BadgeVariant = NonNullable<
  import("class-variance-authority").VariantProps<
    typeof import("../../base/badge").badgeVariants
  >["variant"]
>;

/** Props for the {@link DetailBadgeField} component. */
export interface DetailBadgeFieldProps<T extends string = string>
  extends CommonDetailFieldProps {
  /** The current status/category value (used for variant lookup). */
  value: T;
  /** Translated or formatted text to display inside the badge. Falls back to {@link value} when omitted. */
  displayValue?: string;
  /** Mapping from value to badge variant for visual differentiation. */
  variants: Record<T, BadgeVariant>;
}

/**
 * Read-only badge display field. Maps values to badge color variants.
 *
 * @example
 * ```tsx
 * <DetailBadgeField
 *   label="Status"
 *   value={user.status}
 *   variants={{ active: "success", inactive: "secondary", banned: "destructive" }}
 * />
 * ```
 */
export function DetailBadgeField<T extends string = string>({
  value,
  displayValue,
  variants,
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailBadgeFieldProps<T>) {
  const { Badge } = useUIComponents();
  const variant = variants[value] ?? "default";

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      <Badge variant={variant}>{displayValue ?? value}</Badge>
    </DetailFieldWrapper>
  );
}
