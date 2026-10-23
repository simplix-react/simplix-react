import { defineSlotStyle } from "../../design/slot-style";

/** The detail field wrapper's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailFieldWrapperStyle = defineSlotStyle({
  slot: "field-detail-wrapper",
  base: "py-0.5",
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
      // is what a shared column replaces - `auto` is one field's label, so a panel of them draws
      // as many label columns as it has rows.
      //
      // **No spread.** Pushing the value to the far edge is `trailing`'s job, and it is done there
      // by a rendered spacer rather than by a justify rule. Inside a two-column detail section a
      // cell is about 250px, so spreading puts a short value two hundred pixels from its label and
      // hard against the cell's right edge, which reads as a label with nothing after it, and
      // does so exactly where the value is shortest and most easily missed.
      //
      // **Start, not baseline, and not center.** A value whose first content is a replaced element
      // (the picture `DetailImageField` draws, an avatar, an icon leading a `Flex`) puts the
      // block's first baseline at that element's bottom edge, so baseline alignment drops the
      // label to the bottom of the picture: measured at 12px below the value's text for a 32px
      // avatar, and the picture's full height for a 96px image. Center fails the opposite case, a
      // value that wraps: the label then sits beside the middle of the block rather than beside
      // its first line, measured at 11px below it for two lines.
      inline: "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3",
      // Settings-row style: the label stays left and the value is pushed to the right edge of the
      // row by a blank gap, with no leader rule between them. The gap is the spacer this component
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

/** The label of a detail field. */
export const detailFieldLabelStyle = defineSlotStyle({
  slot: "field-detail-label",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The value of a detail field. */
export const detailFieldValueStyle = defineSlotStyle({
  slot: "field-detail-value",
  base: "text-foreground",
  variants: {},
  defaultVariants: {},
});
