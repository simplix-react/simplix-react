import { defineSlotStyle } from "../../design/slot-style";

/** The code and name of a currency field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailCurrencyFieldValueStyle = defineSlotStyle({
  slot: "detail-currency-field-value",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The ISO 4217 code of a currency field. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const detailCurrencyFieldCodeStyle = defineSlotStyle({
  slot: "detail-currency-field-code",
  base: "font-mono text-xs",
  variants: {},
  defaultVariants: {},
});
