import { defineSlotStyle } from "../../design/slot-style";

/** The section container; `variant` picks card, flat or lined. */
export const sectionShellStyle = defineSlotStyle({
  slot: "section-shell",
  base: "",
  variants: {
    variant: {
      card: "rounded-lg border bg-card text-card-foreground shadow-sm",
      // The rule belongs to both sections it separates, so the inset is the same on each side.
      // It was `pb-2` alone, which paid 8px under the content above and nothing over the
      // heading below - the rule then sat against the next title and read as underlining it
      // rather than as ending the section before. The lined variant beside this one had the
      // symmetric form already.
      flat: "gap-2 py-3 border-b border-border/50 first:pt-0 last:border-b-0 last:pb-0",
      lined: "gap-2 py-2",
    },
  },
  defaultVariants: { variant: "card" },
});

/** The section's header strip. */
export const sectionShellHeaderStyle = defineSlotStyle({
  slot: "section-shell-header",
  base: "",
  variants: {
    variant: {
      card: "rounded-t-lg border-b bg-muted/50 pl-4 pr-2 py-0.5",
      flat: "pl-0",
      lined: "pl-0",
    },
  },
  defaultVariants: { variant: "card" },
});

/** The section's title. */
export const sectionShellTitleStyle = defineSlotStyle({
  slot: "section-shell-title",
  base: "gap-1.5 font-semibold tracking-tight",
  variants: {
    variant: {
      card: "text-sm",
      flat: "text-lg",
      lined: "text-sm",
    },
  },
  defaultVariants: { variant: "card" },
});

/** The description under the title. */
export const sectionShellDescriptionStyle = defineSlotStyle({
  slot: "section-shell-description",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The caret of the collapse button. */
export const sectionShellCaretStyle = defineSlotStyle({
  slot: "section-shell-caret",
  base: "transition-transform duration-200",
  variants: {},
  defaultVariants: {},
});

/** The collapsible region that animates open and closed. */
export const sectionShellCollapseStyle = defineSlotStyle({
  slot: "section-shell-collapse",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The section's body. */
export const sectionShellBodyStyle = defineSlotStyle({
  slot: "section-shell-body",
  base: "",
  variants: {
    variant: {
      card: "px-4 py-2",
      flat: "",
      lined: "ml-2 border-l-2 border-border/50 pl-4",
    },
  },
  defaultVariants: { variant: "card" },
});

/** The group title above a section. */
export const sectionShellGroupTitleStyle = defineSlotStyle({
  slot: "section-shell-group-title",
  base: "text-lg font-semibold tracking-tight",
  variants: {},
  defaultVariants: {},
});
