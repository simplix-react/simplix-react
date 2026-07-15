import type { ReactNode } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import type { IconComponent, StatusTone } from "../../base/status-tone";
import { StatusBadge } from "../../base/display/status-badge";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailStatusField} component. */
export interface DetailStatusFieldProps extends CommonDetailFieldProps {
  /**
   * Resolved semantic tone for the status pill. Look this up via a shared tone
   * map (e.g. `@pacs-studio/pacs-ui` `cardholderStatusToTone[value] ?? "neutral"`)
   * — never hand-write an enum→color map at the call site.
   */
  tone: StatusTone;
  /** Already-translated status label shown inside the pill. */
  value: ReactNode;
  /** Render a leading {@link StatusDot} of the same tone (mutually exclusive with `icon`). */
  showDot?: boolean;
  /** Optional leading icon (mutually exclusive with `showDot`). */
  icon?: IconComponent;
  /** Pill appearance; defaults to `outline`. */
  appearance?: "filled" | "outline";
  /** Pill size; defaults to `sm` (detail density). */
  badgeSize?: "xs" | "sm" | "default";
  /** Fallback text when value is null, undefined, or empty string. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only status display field. Renders a tone-driven {@link StatusBadge}
 * inside the standard detail field wrapper, with the same no-value-badge
 * empty fallback as other `DetailFields.*` components.
 *
 * Unlike {@link DetailBadgeField} (which maps values to legacy Badge variants),
 * this field takes a resolved {@link StatusTone}, so semantic status/severity
 * coloring stays centralized in the shared tone maps.
 *
 * @example
 * ```tsx
 * <DetailFields.DetailStatusField
 *   label={fieldLabel("status")}
 *   tone={cardholderStatusToTone[displayData.status] ?? "neutral"}
 *   value={enumLabel("CardholderStatus", displayData.status)}
 *   showDot
 * />
 * ```
 */
export function DetailStatusField({
  tone,
  value,
  showDot,
  icon,
  appearance = "outline",
  badgeSize = "sm",
  fallback,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailStatusFieldProps) {
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
        <StatusBadge
          tone={tone}
          label={value}
          showDot={showDot}
          icon={icon}
          appearance={appearance}
          size={badgeSize}
        />
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
