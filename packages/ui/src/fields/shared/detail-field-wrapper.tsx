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
      // Label and value on one line, in two grid tracks.
      //
      // **The label is a track, so a container can share one across every field it holds.** A
      // field standing alone owns the track, which is its own label's width, and the value sits
      // directly after it. Inside a `CrudDetail.Section` the track is `subgrid`: every field in
      // that section column draws its label in one track and its value in the next, so the values
      // of that column all start at one x however wide each label is. A field that is not the
      // section's direct child keeps its own track and renders as it does alone. Per-field `auto`
      // is what a shared column replaces — `auto` is one field's label, so a panel of them draws
      // as many label columns as it has rows.
      //
      // **No spread.** Pushing the value to the far edge is `trailing`'s job, and it is done there
      // by a rendered spacer rather than by a justify rule. Inside a two-column detail section a
      // cell is about 250px, so spreading puts a short value two hundred pixels from its label and
      // hard against the cell's right edge — which reads as a label with nothing after it, and
      // does so exactly where the value is shortest and most easily missed.
      //
      // **Start, not baseline, and not center.** A value whose first content is a replaced element
      // — the picture `DetailImageField` draws, an avatar, an icon leading a `Flex` — puts the
      // block's first baseline at that element's bottom edge, so baseline alignment drops the
      // label to the bottom of the picture: measured at 12px below the value's text for a 32px
      // avatar, and the picture's full height for a 96px image. Center fails the opposite case, a
      // value that wraps: the label then sits beside the middle of the block rather than beside
      // its first line, measured at 11px below it for two lines.
      inline: "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3",
      // Settings-row style: the label stays left and the value is pushed to the right edge of the
      // row by a blank gap — no leader rule between them. The gap is the spacer this component
      // renders for this layout, which is what keeps the spread here and only here.
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
  const showLabel = layout !== "hidden" && Boolean(displayLabel);

  return (
    <span
      className={cn(
        detailFieldWrapperVariants({ layout, size }),
        className,
      )}
      data-testid={testId}
      // The section that holds the fields reads this to give the label-in-a-track layouts its
      // shared column, and to leave everything else it holds alone.
      data-field-layout={layout}
      aria-label={layout === "hidden" && displayLabel ? displayLabel : undefined}
    >
      {showLabel && (
        <span className="field-label shrink-0 text-muted-foreground">
          {displayLabel}
        </span>
      )}
      {layout === "trailing" && displayLabel ? (
        <span aria-hidden="true" className="min-w-4 flex-1 self-center" />
      ) : null}
      <span
        className={cn(
          "field-value min-w-0 break-words text-foreground",
          // With no label drawn there is no first track to fill, and a value left to flow into it
          // would be measured as a label — in a shared column that is every other row's label
          // width. Spanning the pair puts it where a label-less field has always put it, at the
          // start of the row, and keeps it out of the column's measurement.
          !showLabel && "col-span-2",
        )}
      >
        {children}
      </span>
    </span>
  );
}

export { detailFieldWrapperVariants };
