import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { FieldVariant } from "../../crud/shared/types";
import { useFieldVariant } from "../../crud/shared/types";
import { slotAttributes, slotClassNames } from "../../design/slot-style";
import { cn, toTestId } from "../../utils/cn";
import {
  detailFieldLabelStyle,
  detailFieldValueStyle,
  detailFieldWrapperStyle,
} from "./detail-field-wrapper.style";

const detailFieldWrapperVariants = slotClassNames(detailFieldWrapperStyle);

/** Variant props extracted from {@link detailFieldWrapperVariants}. */
export type DetailFieldWrapperVariants = VariantProps<
  typeof detailFieldWrapperVariants
>;

/** Props for the {@link DetailFieldWrapper} component. */
export interface DetailFieldWrapperProps extends Partial<FieldVariant> {
  /** Visible label text for the field. */
  label?: string;
  /** i18n key for label resolution. */
  labelKey?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a read-only detail value with label display.
 * Used by all `DetailFields.*` components.
 */
export function DetailFieldWrapper({
  label,
  labelKey,
  layout: layoutOverride,
  size: sizeOverride,
  className,
  children,
}: DetailFieldWrapperProps) {
  const { layout, size } = useFieldVariant({
    layout: layoutOverride,
    size: sizeOverride,
  });

  const displayLabel = label ?? labelKey;
  const testId = displayLabel ? `detail-field-${toTestId(displayLabel)}` : undefined;
  const showLabel = layout !== "hidden" && Boolean(displayLabel);

  return (
    <span
      className={className}
      {...slotAttributes(detailFieldWrapperStyle, { layout, size })}
      data-testid={testId}
      // The section that holds the fields reads this to give the label-in-a-track layouts its
      // shared column, and to leave everything else it holds alone.
      data-field-layout={layout}
      aria-label={layout === "hidden" && displayLabel ? displayLabel : undefined}
    >
      {showLabel && (
        <span className="field-label shrink-0" {...slotAttributes(detailFieldLabelStyle, {})}>
          {displayLabel}
        </span>
      )}
      {layout === "trailing" && displayLabel ? (
        <span aria-hidden="true" className="min-w-4 flex-1 self-center" />
      ) : null}
      <span
        className={cn(
          "field-value min-w-0 break-words",
          // With no label drawn there is no first track to fill, and a value left to flow into it
          // would be measured as a label; in a shared column that is every other row's label
          // width. Spanning the pair puts it where a label-less field has always put it, at the
          // start of the row, and keeps it out of the column's measurement.
          !showLabel && "col-span-2",
        )}
        {...slotAttributes(detailFieldValueStyle, {})}
      >
        {children}
      </span>
    </span>
  );
}

export { detailFieldWrapperVariants };
