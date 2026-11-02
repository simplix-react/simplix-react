import { type ClipboardEvent, type ComponentPropsWithoutRef, type KeyboardEvent, useRef } from "react";

import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { codeBackspace, codeFocusable, codePaste, codeType, type CodeEdit } from "./code-input-model";
import { codeInputCellStyle, codeInputStyle } from "./code-input.style";

/** Props for {@link CodeInput}. */
export interface CodeInputProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "children" | "defaultValue"> {
  /** The digits typed so far, from the first cell. */
  value: string;
  /** Called with the next digits after every edit. */
  onValueChange: (value: string) => void;
  /** Called once with the code when the last cell is filled. */
  onComplete?: (code: string) => void;
  /** The code's name, read for the group of cells ("Verification code"). */
  label: string;
  /**
   * How many digits the code has.
   * @defaultValue 6
   */
  length?: number;
  /** The code was refused: every cell draws the error border and reports `aria-invalid`. */
  invalid?: boolean;
  disabled?: boolean;
  /**
   * The accessible name of one cell. Defaults to the package catalogue's "Digit 1 of 6" in the
   * current language.
   */
  cellLabel?: (position: number, length: number) => string;
  /**
   * Attributes every cell carries besides its own slot, such as a design kit's part marks
   * (`partAttributes`), so a kit can draw the cells without reaching into this component.
   */
  cellAttributes?: Record<string, string>;
}

/**
 * Renders a one-time code entered one digit per square cell.
 *
 * @remarks
 * Typing a digit fills the cell and moves on; Backspace on an empty cell moves back and clears that
 * cell; the arrow keys move between cells; a pasted or autofilled code fills every cell. The focus
 * never lands past the first empty cell, so the code stays contiguous. The first cell asks the
 * browser for `one-time-code` autofill. The cells shrink evenly in a narrow container.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { CodeInput } from "@simplix-react/ui";
 *
 * export function VerifyStep({ onVerify }: { onVerify: (code: string) => void }) {
 *   const [code, setCode] = useState("");
 *   return <CodeInput label="Verification code" value={code} onValueChange={setCode} onComplete={onVerify} />;
 * }
 * ```
 *
 * @see {@link codeType}, {@link codeBackspace}, {@link codePaste} for the editing rules it applies.
 */
export function CodeInput({
  value,
  onValueChange,
  onComplete,
  label,
  length = 6,
  invalid = false,
  disabled = false,
  cellLabel,
  cellAttributes,
  ...rest
}: CodeInputProps) {
  const { t } = useTranslation("simplix/ui");
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number) => cells.current[index]?.focus();
  const apply = (edit: CodeEdit) => {
    if (edit.value !== value) {
      onValueChange(edit.value);
      if (edit.value.length === length && value.length < length) onComplete?.(edit.value);
    }
    focus(edit.focus);
  };
  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // A typed digit replaces the cell's digit; onChange is left to autofill and IME input.
      event.preventDefault();
      apply(codeType(value, index, event.key, length));
    } else if (event.key === "Backspace") {
      event.preventDefault();
      apply(codeBackspace(value, index, length));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(codeFocusable(value, index - 1, length));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(codeFocusable(value, index + 1, length));
    }
  };
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const edit = codePaste(event.clipboardData.getData("text"), length);
    if (edit === null) return;
    event.preventDefault();
    apply(edit);
  };
  const nameOf = cellLabel ?? ((position: number, total: number) => t("codeInput.digit", { position, length: total }));
  return (
    <div role="group" aria-label={label} aria-disabled={disabled || undefined} {...rest} {...slotAttributes(codeInputStyle, {})}>
      {Array.from({ length }, (_, index) => (
        <input
          // The cells are fixed positions: the index is their identity.
          key={`digit-${index + 1}`}
          ref={(element) => {
            cells.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={value[index] ?? ""}
          aria-label={nameOf(index + 1, length)}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onFocus={(event) => {
            const at = codeFocusable(value, index, length);
            if (at !== index) focus(at);
            else event.target.select();
          }}
          onChange={(event) => apply(codeType(value, index, event.target.value, length))}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          {...cellAttributes}
          {...slotAttributes(codeInputCellStyle, { invalid })}
        />
      ))}
    </div>
  );
}
