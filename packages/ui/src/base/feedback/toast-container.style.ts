import { defineSlotStyle } from "../../design/slot-style";

/** One toast. */
export const toastStyle = defineSlotStyle({
  slot: "toast",
  base: "rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-200",
  variants: {
    type: {
      success: "border-emerald-200 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/90",
      warning: "border-amber-200 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/90",
      error: "border-red-200 bg-red-50/90 dark:border-red-800 dark:bg-red-950/90",
      info: "border-blue-200 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/90",
    },
    /** Slides in from the right on mount and out again on dismiss. */
    phase: {
      entering: "translate-x-full opacity-0",
      exiting: "translate-x-full opacity-0",
      shown: "translate-x-0 opacity-100",
    },
  },
  defaultVariants: { type: "info", phase: "shown" },
});

/** The leading icon of a toast; it takes the colour of the toast type. */
export const toastIconStyle = defineSlotStyle({
  slot: "toast-icon",
  base: "",
  variants: {
    type: {
      success: "text-emerald-500",
      warning: "text-amber-500",
      error: "text-red-500",
      info: "text-blue-500",
    },
  },
  defaultVariants: { type: "info" },
});

/** The message line. */
export const toastMessageStyle = defineSlotStyle({
  slot: "toast-message",
  base: "text-sm font-medium leading-tight",
  variants: {},
  defaultVariants: {},
});

/** The link under the message. */
export const toastActionStyle = defineSlotStyle({
  slot: "toast-action",
  base: "text-xs font-medium text-primary underline-offset-2 hover:underline",
  variants: {},
  defaultVariants: {},
});

/** The box that pulls the dismiss button into the toast's corner. */
export const toastDismissStyle = defineSlotStyle({
  slot: "toast-dismiss",
  base: "-mt-0.5 -mr-1",
  variants: {},
  defaultVariants: {},
});

/** The stack of toasts in the corner of the screen. */
export const toastContainerStyle = defineSlotStyle({
  slot: "toast-container",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});
