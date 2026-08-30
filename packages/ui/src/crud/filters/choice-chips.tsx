import { type ReactNode } from "react";

import { Flex } from "../../primitives";
import { CheckIcon, CircleIcon } from "../shared/icons";
import { cn } from "../../utils/cn";

/** One option of a {@link ChoiceChips} row. */
export interface ChoiceChipOption<T extends string | number = string> {
  /** The value this chip stands for. */
  value: T;
  /** Display label. */
  label: string;
  /**
   * Replaces the chosen/unchosen mark with something else — a colour dot, a count.
   *
   * <p>Supplying one gives up the mark that says whether this chip is on, so only pass it where
   * the chip's own colour already carries that.
   */
  icon?: ReactNode;
  /** Whether this option can be chosen right now. */
  disabled?: boolean;
  /**
   * Why it cannot be, in the reader's words.
   *
   * <p><b>A chip that is there and refuses teaches something a chip that vanished cannot.</b> An
   * option removed from the row says the product does not offer it; an option standing there
   * disabled says this account has not set it up — and only the second is usually true. The
   * sentence is what makes the difference legible, so a disabled chip without one is a dead end.
   */
  disabledReason?: string;
}

/** Props for {@link ChoiceChips}. */
export interface ChoiceChipsProps<T extends string | number = string> {
  /** What is chosen now, `null` while nothing is. */
  value: T | null;
  /** Called with the pressed option's value. Pressing the lit chip does nothing. */
  onChange: (value: T) => void;
  /** The options, in the order they are drawn. */
  options: ChoiceChipOption<T>[];
  /** Names the group for assistive technology — 「인증 수단」. */
  label: string;
  /** Space between chips. @defaultValue "xs" */
  gap?: "none" | "xs" | "sm" | "md" | "lg";
}

/**
 * A pill row where exactly one option is lit.
 *
 * <p><b>Why this is a component of its own rather than {@link ChipFilter} with one value.</b> A
 * chip filter narrows a set: pressing a second chip widens the narrowing and pressing a lit one
 * drops it, so a row where only one chip can be lit answers to a press differently from how it
 * looks. That difference is invisible until the reader presses — which is why `ChipFilter` refuses
 * the single-select case rather than offering a flag for it. This row is the other thing: it says
 * in its name, in its `role`, and to a screen reader that exactly one of these is chosen, and it
 * draws as pills because that is what the choice looks like.
 *
 * <p><b>It is not a tab strip either.</b> A tab strip switches what a region shows and nothing is
 * submitted; this chooses a value the surrounding form then acts on. Where the press changes the
 * panel below it and nothing else, use tabs.
 *
 * @example
 * ```tsx
 * <ChoiceChips
 *   label={t("mfa.methodGroup")}
 *   value={method}
 *   onChange={setMethod}
 *   options={[
 *     { value: "PASSKEY", label: t("mfa.method.PASSKEY") },
 *     { value: "TOTP", label: t("mfa.method.TOTP"), disabled: true, disabledReason: t("mfa.unavailable.NOT_ENROLLED") },
 *   ]}
 * />
 * ```
 */
export function ChoiceChips<T extends string | number = string>({
  value,
  onChange,
  options,
  label,
  gap = "xs",
}: ChoiceChipsProps<T>) {
  return (
    <Flex wrap gap={gap} align="center" role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            type="button"
            key={String(opt.value)}
            role="radio"
            aria-checked={isActive}
            // Disabled rather than `disabled`: a disabled button is skipped by the tab order and
            // swallows the pointer, so the reason attached to it is unreachable by either route —
            // and the reason is the whole point of leaving the option on the row.
            aria-disabled={opt.disabled || undefined}
            title={opt.disabled ? opt.disabledReason : undefined}
            onClick={() => {
              if (opt.disabled || isActive) return;
              onChange(opt.value);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !opt.disabled && !isActive
                && "border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              !opt.disabled && isActive
                && "border-transparent bg-primary text-primary-foreground",
              opt.disabled
                && "border-transparent bg-muted/50 text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            {opt.icon ?? (
              isActive
                ? <CheckIcon className="size-3.5 shrink-0" />
                : <CircleIcon className="size-3.5 shrink-0 opacity-50" />
            )}
            <span className={cn(opt.disabled && "line-through opacity-50")}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </Flex>
  );
}
