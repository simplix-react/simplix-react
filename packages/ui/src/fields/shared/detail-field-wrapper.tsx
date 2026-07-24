import { type VariantProps, cva } from "class-variance-authority";
import type { ReactNode } from "react";

import type { FieldVariant } from "../../crud/shared/types";
import { useFieldVariant } from "../../crud/shared/types";
import { cn, toTestId } from "../../utils/cn";

const detailFieldWrapperVariants = cva("py-0.5", {
  variants: {
    layout: {
      top: "flex flex-col gap-1",
      left: "grid grid-cols-[auto_1fr] items-baseline gap-x-3",
      // Center, not baseline: a row whose value carries an avatar or a badge is
      // taller than its label, and baseline alignment drops the label out of line.
      inline: "flex items-center justify-between gap-3",
      // Settings-row style: the label stays left and the value is pushed to the
      // right edge of the row by a blank gap — no leader rule between them.
      trailing: "flex items-baseline gap-3",
      hidden: "flex flex-col",
    },
    size: {
      sm: "[&_.field-label]:text-xs [&_.field-value]:text-sm",
      md: "[&_.field-label]:text-sm [&_.field-value]:text-sm",
      lg: "[&_.field-label]:text-base [&_.field-value]:text-base",
    },
  },
  defaultVariants: { layout: "top", size: "sm" },
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

  return (
    <span
      className={cn(
        detailFieldWrapperVariants({ layout, size }),
        className,
      )}
      data-testid={testId}
      aria-label={layout === "hidden" && displayLabel ? displayLabel : undefined}
    >
      {layout !== "hidden" && displayLabel && (
        <span className="field-label shrink-0 text-muted-foreground">
          {displayLabel}
        </span>
      )}
      {layout === "trailing" && displayLabel ? (
        <span aria-hidden="true" className="min-w-4 flex-1 self-center" />
      ) : null}
      <span className="field-value text-foreground">{children}</span>
    </span>
  );
}

export { detailFieldWrapperVariants };
