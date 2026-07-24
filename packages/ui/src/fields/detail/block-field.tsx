import type { ReactNode } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailBlockField} component. */
export interface DetailBlockFieldProps
  extends Omit<CommonDetailFieldProps, "layout"> {
  /** Plain multi-line text; line breaks are preserved. Ignored when `children` is set. */
  value?: string | null;
  /** Rich block content (e.g. a stack of labeled lines). Takes precedence over `value`. */
  children?: ReactNode;
  /** Fallback text when there is neither a value nor children. Defaults to the shared no-value badge. */
  fallback?: string;
}

/**
 * Read-only field for description or multi-line / multi-entry content, rendered
 * left-aligned inside a subtly shaded box below its label.
 *
 * Use this instead of an inline field when the value spans multiple lines — a
 * reason, a note, a list of requested changes — where an inline right-aligned
 * layout reads as misaligned against the surrounding scalar fields.
 *
 * @example Plain multi-line text
 * ```tsx
 * <DetailBlockField label="Reason" value={data.reason} />
 * ```
 *
 * @example Rich content
 * ```tsx
 * <DetailBlockField label="Requested value">
 *   <Stack gap="xs">
 *     {entries.map((e) => <Text key={e.key} size="sm">{e.label}: {e.value}</Text>)}
 *   </Stack>
 * </DetailBlockField>
 * ```
 */
export function DetailBlockField({
  value,
  children,
  fallback,
  label,
  labelKey,
  size,
  className,
}: DetailBlockFieldProps) {
  const hasContent = children != null || (value != null && value !== "");

  // Empty: fall back to the standard inline row (label left, no-value badge
  // right) so it reads like its scalar siblings instead of a lone badge under
  // the label. Only actual content gets the left-aligned boxed block below.
  if (!hasContent) {
    return (
      <DetailFieldWrapper
        label={label}
        labelKey={labelKey}
        layout="inline"
        size={size}
        className={className}
      >
        {detailFallback(fallback)}
      </DetailFieldWrapper>
    );
  }

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout="top"
      size={size}
      className={className}
    >
      <span className="block rounded-md bg-muted/50 px-3 py-2 text-left text-foreground">
        {children ?? <span className="whitespace-pre-wrap">{value}</span>}
      </span>
    </DetailFieldWrapper>
  );
}
