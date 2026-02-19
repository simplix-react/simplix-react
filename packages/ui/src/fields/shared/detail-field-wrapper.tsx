import { type VariantProps, cva } from "class-variance-authority";
import type { ReactNode } from "react";

import type { FieldVariant } from "../../crud/shared/types";
import { useFieldVariant } from "../../crud/shared/types";
import { cn, toTestId } from "../../utils/cn";

const detailFieldWrapperVariants = cva("", {
  variants: {
    labelPosition: {
      top: "flex flex-col gap-1",
      left: "grid grid-cols-[auto_1fr] items-baseline gap-x-3",
      hidden: "flex flex-col",
    },
    size: {
      sm: "[&_.field-label]:text-xs [&_.field-value]:text-sm",
      md: "[&_.field-label]:text-sm [&_.field-value]:text-sm",
      lg: "[&_.field-label]:text-base [&_.field-value]:text-base",
    },
  },
  defaultVariants: { labelPosition: "top", size: "md" },
});

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
  labelPosition: labelPositionOverride,
  size: sizeOverride,
  className,
  children,
}: DetailFieldWrapperProps) {
  const { labelPosition, size } = useFieldVariant({
    labelPosition: labelPositionOverride,
    size: sizeOverride,
  });

  const displayLabel = label ?? labelKey;
  const testId = displayLabel ? `detail-field-${toTestId(displayLabel)}` : undefined;

  return (
    <span
      className={cn(
        detailFieldWrapperVariants({ labelPosition, size }),
        className,
      )}
      data-testid={testId}
      aria-label={labelPosition === "hidden" && displayLabel ? displayLabel : undefined}
    >
      {labelPosition !== "hidden" && displayLabel && (
        <span className="field-label text-muted-foreground">
          {displayLabel}
        </span>
      )}
      <span className="field-value">{children}</span>
    </span>
  );
}

export { detailFieldWrapperVariants };
