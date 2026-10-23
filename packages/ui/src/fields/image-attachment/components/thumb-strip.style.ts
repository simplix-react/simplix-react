import { defineSlotStyle } from "../../../design/slot-style";

/** The strip of thumbnails. */
export const thumbStripStyle = defineSlotStyle({
  slot: "thumb-strip",
  base: "gap-[10px] mt-[14px] px-1 py-[6px]",
  variants: {},
  defaultVariants: {},
});

/** One thumbnail button. */
export const thumbStripItemStyle = defineSlotStyle({
  slot: "thumb-strip-item",
  base: "rounded border bg-muted p-0 font-[inherit] transition-[outline,transform,border-color]",
  variants: {
    // Active tones replace the resting border and add a glow that has no token (styles.css:218, 231).
    tone: {
      idle: "border-border hover:-translate-y-[1px]",
      error: "border-border",
      active: "outline outline-2 outline-primary outline-offset-2 border-transparent shadow-[0_0_0_4px_rgba(36,107,253,.14),0_6px_16px_rgba(36,107,253,.22),0_2px_6px_rgba(36,107,253,.12)]",
      "active-error": "outline outline-2 outline-destructive outline-offset-2 border-transparent shadow-[0_0_0_4px_rgba(200,53,31,.14),0_6px_16px_rgba(200,53,31,.22),0_2px_6px_rgba(200,53,31,.12)]",
    },
    dragging: { true: "opacity-80", false: "" },
  },
  defaultVariants: { tone: "idle", dragging: false },
});

/** The rounded wrapper that clips the image and overlays. */
export const thumbStripClipStyle = defineSlotStyle({
  slot: "thumb-strip-clip",
  base: "rounded-[inherit]",
  variants: {},
  defaultVariants: {},
});

/** The icon placeholder shown when the thumbnail cannot load. */
export const thumbStripPlaceholderStyle = defineSlotStyle({
  slot: "thumb-strip-placeholder",
  base: "bg-muted text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The thumbnail image; an error image is greyed (styles.css:154-155,226-227). */
export const thumbStripImageStyle = defineSlotStyle({
  slot: "thumb-strip-image",
  base: "",
  variants: {
    error: { true: "grayscale brightness-50", false: "" },
  },
  defaultVariants: { error: false },
});

/** The blue gradient over an uploading thumbnail, no token (styles.css:149,223). */
export const thumbStripUploadingStyle = defineSlotStyle({
  slot: "thumb-strip-uploading",
  base: "rounded-[inherit] bg-[linear-gradient(180deg,rgba(18,104,179,0)_0%,rgba(18,104,179,.55)_100%)]",
  variants: {},
  defaultVariants: {},
});

/** The red overlay over a failed thumbnail, no token (styles.css:154-155,226-227). */
export const thumbStripErrorOverlayStyle = defineSlotStyle({
  slot: "thumb-strip-error-overlay",
  base: "rounded-[inherit] bg-[rgba(200,53,31,.55)]",
  variants: {},
  defaultVariants: {},
});

/** The upload progress track. */
export const thumbStripProgressStyle = defineSlotStyle({
  slot: "thumb-strip-progress",
  base: "rounded-full bg-white/35 shadow-[0_1px_2px_rgba(0,0,0,.2)]",
  variants: {},
  defaultVariants: {},
});

/** The fill of the upload progress track. */
export const thumbStripProgressFillStyle = defineSlotStyle({
  slot: "thumb-strip-progress-fill",
  base: "rounded-full bg-white",
  variants: {},
  defaultVariants: {},
});

/** The representative star badge. */
export const thumbStripStarStyle = defineSlotStyle({
  slot: "thumb-strip-star",
  base: "rounded-full bg-background shadow-sm",
  variants: {},
  defaultVariants: {},
});
