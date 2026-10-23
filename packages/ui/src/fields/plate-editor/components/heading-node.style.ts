import { defineSlotStyle } from "../../../design/slot-style";

/** A heading element; `level` is 1 to 3. */
export const plateHeadingStyle = defineSlotStyle({
  slot: "plate-heading",
  base: "first:mt-0",
  variants: {
    level: {
      "1": "text-2xl font-bold mb-4 mt-6",
      "2": "text-xl font-semibold mb-3 mt-5",
      "3": "text-lg font-semibold mb-2 mt-4",
    },
  },
  defaultVariants: {},
});
