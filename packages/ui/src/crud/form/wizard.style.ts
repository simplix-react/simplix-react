import { defineSlotStyle } from "../../design/slot-style";

/** The ordered list of step markers. */
export const wizardStepsStyle = defineSlotStyle({
  slot: "wizard-steps",
  base: "gap-0",
  variants: {},
  defaultVariants: {},
});

/** The numbered circle of one step. */
export const wizardStepMarkerStyle = defineSlotStyle({
  slot: "wizard-step-marker",
  base: "rounded-full border-2 text-sm font-medium transition-colors",
  variants: {
    state: {
      active: "border-primary bg-primary text-primary-foreground",
      completed: "border-primary bg-primary/10 text-primary",
      pending: "border-muted-foreground/30 text-muted-foreground",
    },
  },
  defaultVariants: { state: "pending" },
});

/** The title next to a step marker. */
export const wizardStepTitleStyle = defineSlotStyle({
  slot: "wizard-step-title",
  base: "text-sm font-medium",
  variants: { active: { true: "text-foreground", false: "text-muted-foreground" } },
  defaultVariants: { active: false },
});

/** The description under a step title. */
export const wizardStepDescriptionStyle = defineSlotStyle({
  slot: "wizard-step-description",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The line between two step markers. */
export const wizardStepConnectorStyle = defineSlotStyle({
  slot: "wizard-step-connector",
  base: "mx-3",
  variants: { done: { true: "bg-primary", false: "bg-muted-foreground/30" } },
  defaultVariants: { done: false },
});

/** The row holding the navigation buttons. */
export const wizardActionsStyle = defineSlotStyle({
  slot: "wizard-actions",
  as: "part",
  base: "pt-2",
  variants: {},
  defaultVariants: {},
});

/** The button that goes back one step. */
export const wizardPreviousStyle = defineSlotStyle({
  slot: "wizard-previous",
  base: "rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** The button that goes forward one step or completes the wizard. */
export const wizardNextStyle = defineSlotStyle({
  slot: "wizard-next",
  base: "rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
  variants: {},
  defaultVariants: {},
});
