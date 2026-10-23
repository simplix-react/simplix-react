import { defineSlotStyle } from "../../../design/slot-style";

/** The compact dropzone row. */
export const fileDropzoneStyle = defineSlotStyle({
  slot: "file-dropzone",
  base: "gap-2.5 rounded-md border border-dashed px-3 py-2 transition-colors",
  variants: {
    // The dragged-over colours replace the resting ones, so each sits in its own value.
    over: {
      true: "border-primary bg-primary/10",
      false: "border-input bg-muted/60",
    },
    disabled: { true: "opacity-50", false: "" },
  },
  defaultVariants: { over: false, disabled: false },
});

/** The upload icon tile. */
export const fileDropzoneIconStyle = defineSlotStyle({
  slot: "file-dropzone-icon",
  base: "rounded bg-primary/10 text-primary",
  variants: {},
  defaultVariants: {},
});

/** The constraint pills row. */
export const fileDropzoneMetaStyle = defineSlotStyle({
  slot: "file-dropzone-meta",
  base: "gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One constraint pill. */
export const fileDropzonePillStyle = defineSlotStyle({
  slot: "file-dropzone-pill",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The current and maximum file count. */
export const fileDropzoneCountStyle = defineSlotStyle({
  slot: "file-dropzone-count",
  base: "ml-0.5 font-bold tabular-nums text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The allowed extensions pill that opens a tooltip. */
export const fileDropzoneExtensionsStyle = defineSlotStyle({
  slot: "file-dropzone-extensions",
  base: "gap-1 text-muted-foreground transition-colors hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The title line of the extensions tooltip. */
export const fileDropzoneExtensionsTitleStyle = defineSlotStyle({
  slot: "file-dropzone-extensions-title",
  base: "mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-75",
  variants: {},
  defaultVariants: {},
});
