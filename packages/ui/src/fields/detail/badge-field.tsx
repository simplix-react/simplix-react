import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

export type BadgeVariant = NonNullable<
  import("class-variance-authority").VariantProps<
    typeof import("../../base/display/badge").badgeVariants
  >["variant"]
>;

/** Props for the {@link DetailBadgeField} component. */
export interface DetailBadgeFieldProps<T extends string = string>
  extends CommonDetailFieldProps {
  /** The current status/category value (used for variant lookup). */
  value: T | null | undefined;
  /** Translated or formatted text to display inside the badge. Falls back to {@link value} when omitted. */
  displayValue?: string;
  /** Mapping from value to badge variant for visual differentiation. */
  variants: Record<T, BadgeVariant>;
  /** Fallback text when value is null, undefined, or empty string. Defaults to em-dash. */
  fallback?: string;
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
  fallback = "\u2014",
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailBadgeFieldProps<T>) {
  const { Badge } = useUIComponents();
  const hasValue = value != null && value !== "";

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {hasValue ? (
        <Badge variant={variants[value] ?? "default"}>{displayValue ?? value}</Badge>
      ) : (
        <span>{fallback}</span>
      )}
    </DetailFieldWrapper>
  );
}
