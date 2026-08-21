import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { type ComponentPropsWithRef, type ReactNode, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { createSelfResolving } from "../../provider/self-resolving";

// `disabled:pointer-events-none` is deliberately absent. A disabled button is exactly the one a
// reader needs an explanation for, and both of this framework's ways of giving them one are hover
// mechanisms: `title` on the button (`CrudDetail.DefaultActions`'s `editDisabledReason` /
// `deleteDisabledReason`) and a Radix tooltip wrapping it (`RowActions`'s icon variant). Taken out
// of hit-testing the button never reports a hover, so neither fires — the reason is written, the
// prop is passed, and nothing appears. A greyed pencil then says only 「no」, never 「why」.
// Nothing is lost by allowing the hover: `disabled` on a real `<button>` already suppresses
// activation, and the pointer never reached the button before either — the click fell through to
// whatever is under it, and still does. `disabled:cursor-not-allowed` keeps the pointer saying so.
const buttonVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 min-w-32",
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
       * How the label sits in the button's width.
       *
       * <p>Centred by default, which is what a button is. `start` is for the case where buttons
       * are a LIST rather than a row of actions — a tree of choices, a menu drawn as buttons —
       * and a centred label there makes a column of ragged text that reads as broken alignment
       * rather than as a list.
       */
      /**
       * Take the whole width of whatever holds it.
       *
       * <p>For a button that is the ONLY thing on its line and means it — a sign-in submit, a
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
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      justify: "center",
      fill: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ComponentPropsWithRef<"button">,
    ButtonVariants {
  /** Show loading spinner and disable button. */
  loading?: boolean;
  /** Text to show while loading. Replaces children if provided. */
  loadingText?: ReactNode;
  /**
   * Append a trailing chevron-down caret so the button reads as a menu/dropdown
   * trigger. Use on a `DropdownMenuTrigger` button. Suppressed while loading and
   * in `asChild` mode.
   */
  dropdown?: boolean;
  /**
   * Render the single child element instead of a `<button>`, merging the
   * button styling and behavior onto it (e.g. wrap a router `<Link>`). The
   * loading spinner is not composed in this mode.
   */
  asChild?: boolean;
}

const spinnerSizeMap: Record<string, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  default: "h-4 w-4",
  lg: "h-5 w-5",
  icon: "h-4 w-4",
  "icon-sm": "h-3.5 w-3.5",
  "icon-xs": "h-3 w-3",
};

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, loadingText, dropdown, disabled, asChild, children, ...rest }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    // Composition mode: render the consumer's element with button styling.
    // Slot accepts a single child, so the loading spinner is not composed here.
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} aria-busy={loading || undefined} {...rest}>
          {children}
        </Slot>
      );
    }

    const isIconOnly = typeof size === "string" && size.startsWith("icon");
    const spinnerSize = spinnerSizeMap[size ?? "default"] ?? "h-4 w-4";

    const spinner = loading ? (
      <span
        className={cn(spinnerSize, "animate-spin rounded-full border-2 border-current border-t-transparent")}
        aria-hidden="true"
      />
    ) : null;

    return (
      <button
        ref={ref}
        // Default to type="button": an untyped <button> inside a <form> is an implicit
        // submit button per the HTML spec. An explicit `type` in rest overrides this.
        type="button"
        className={classes}
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          isIconOnly ? spinner : (
            <>
              {spinner}
              {loadingText ?? children}
            </>
          )
        ) : dropdown ? (
          <>
            {children}
            <span className="-mr-2 -ml-0.5 flex items-center self-stretch border-l border-current/30 pl-1">
              <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

ButtonBase.displayName = "Button";

export const Button = createSelfResolving("Button", ButtonBase);

export { buttonVariants };
