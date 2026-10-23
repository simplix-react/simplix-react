import { defineSlotStyle } from "../../design/slot-style";

/** The status pill. The tone's own colours arrive as classes from the status tone context. */
export const statusBadgeStyle = defineSlotStyle({
  slot: "status-badge",
  base: "rounded-full font-medium",
  variants: {
    /** Text size token: text size, padding and the gap to the leading dot or icon. */
    size: {
      xs: "text-[0.625rem] px-1.5 py-0.5 gap-1",
      sm: "text-xs px-2 py-0.5 gap-1",
      default: "text-sm px-2.5 py-1 gap-1.5",
    },
    /** `outline` draws a border over a transparent background; `filled` takes the tone's soft fill. */
    appearance: { outline: "border bg-transparent", filled: "" },
    /** The tone, so a design can draw each one its own way; the classic colours come from the tone context. */
    tone: { success: "", warning: "", danger: "", info: "", neutral: "", pending: "", processing: "" },
  },
  defaultVariants: { size: "sm", appearance: "outline", tone: "neutral" },
});
