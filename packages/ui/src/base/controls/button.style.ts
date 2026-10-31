import { defineSlotStyle } from "../../design/slot-style";

/** The button's classic look. Drawn by `theme/designs/classic.css`; see {@link defineSlotStyle}. */
export const buttonStyle = defineSlotStyle({
  slot: "button",
  base: "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,scale] duration-[var(--dur-fast)] ease-[var(--ease)] enabled:active:scale-(--press-scale) focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-visible:shadow-[var(--focus-halo)]",

    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      /**
       * How loudly the label is coloured.
       *
       * <p>`muted` is for a control that is on the row without claiming it - a breadcrumb above a
       * title, a way back out of a screen reached from somewhere else. It is a tone rather than a
       * variant because it composes: a quiet link and a quiet ghost are both wanted, and a variant
       * per pairing doubles the list for one axis.
       */
      tone: {
        default: "",
        muted: "text-muted-foreground hover:text-foreground",
      },
      /**
       * How the label sits in the button's width.
       *
       * <p>Centred by default, which is what a button is. `start` is for the case where buttons
       * are a LIST rather than a row of actions - a tree of choices, a menu drawn as buttons -
       * and a centred label there makes a column of ragged text that reads as broken alignment
       * rather than as a list.
       */
      /**
       * Take the whole width of whatever holds it.
       *
       * <p>For a button that is the ONLY thing on its line and means it - a sign-in submit, a
       * single primary in a narrow dialog. A row of actions never uses it: several full-width
       * buttons stack into a wall in which nothing is primary.
       */
      fill: { true: "w-full", false: "" },

      justify: {
        center: "justify-center",
        start: "justify-start",
      },

      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
        /**
         * A link's metrics rather than a button's: no box, so no height and no padding.
         *
         * <p>`variant="link"` takes the box away visually and the size variants put it back in
         * space - an xs link still reserves 28px of height and 10px either side, so a breadcrumb
         * sits low and indented under a title it is supposed to head. Pair this with that variant.
         */
        link: "h-auto p-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      tone: "default",
      justify: "center",
      fill: false,
    }
});

/** The spinner a loading button draws in place of, or beside, its label. */
export const buttonSpinnerStyle = defineSlotStyle({
  slot: "button-spinner",
  base: "animate-spin rounded-full border-2 border-current border-t-transparent",
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-3.5 w-3.5",
      default: "h-4 w-4",
      lg: "h-5 w-5",
      icon: "h-4 w-4",
      "icon-sm": "h-3.5 w-3.5",
      "icon-xs": "h-3 w-3",
      link: "h-4 w-4",
    },
  },
  defaultVariants: { size: "default" },
});

/** The trailing caret that marks a button as a menu trigger. */
export const buttonCaretStyle = defineSlotStyle({
  slot: "button-caret",
  base: "-mr-2 -ml-0.5 flex items-center self-stretch border-l border-current/30 pl-1 [&>svg]:opacity-70",
  variants: {},
  defaultVariants: {},
});
