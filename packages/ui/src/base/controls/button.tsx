import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { type ComponentPropsWithRef, type ReactNode, forwardRef } from "react";

import { slotAttributes, slotClassNames } from "../../design/slot-style";
import { buttonCaretStyle, buttonSpinnerStyle, buttonStyle } from "./button.style";
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
const buttonVariants = slotClassNames(buttonStyle);

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

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, loadingText, dropdown, disabled, asChild, children, ...rest }, ref) => {
    // tone, justify and fill are not passed through: they take their declared defaults, as the
    // class-string form of this button always drew them.
    const slot = slotAttributes(buttonStyle, { variant, size });

    // Composition mode: render the consumer's element with button styling.
    // Slot accepts a single child, so the loading spinner is not composed here.
    if (asChild) {
      return (
        <Slot ref={ref} className={className} aria-busy={loading || undefined} {...rest} {...slot}>
          {children}
        </Slot>
      );
    }

    const isIconOnly = typeof size === "string" && size.startsWith("icon");

    const spinner = loading ? (
      <span {...slotAttributes(buttonSpinnerStyle, { size })} aria-hidden="true" />
    ) : null;

    return (
      <button
        ref={ref}
        // Default to type="button": an untyped <button> inside a <form> is an implicit
        // submit button per the HTML spec. An explicit `type` in rest overrides this.
        type="button"
        className={className}
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        {...rest}
        {...slot}
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
            <span {...slotAttributes(buttonCaretStyle, {})}>
              <ChevronDown className="size-3.5" aria-hidden="true" />
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
