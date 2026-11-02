/**
 * The next state of a code entered one digit per cell: the code typed so far and the cell that
 * takes the focus.
 *
 * @remarks
 * The value is contiguous from the first cell: cell `i` shows `value[i]`, and the first empty cell
 * is `value.length`. Every editing rule below returns one of these.
 */
export interface CodeEdit {
  /** The digits typed so far, from the first cell. */
  value: string;
  /** The cell that takes the focus after the edit. */
  focus: number;
}

function digitsOf(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Returns the cell a focus at `index` lands on: never past the first empty cell or the last cell.
 *
 * @param value - The digits typed so far.
 * @param index - The cell the focus was asked to move to.
 * @param length - How many cells the code has.
 * @returns The cell index that may take the focus.
 *
 * @example
 * ```ts
 * import { codeFocusable } from "@simplix-react/ui";
 *
 * codeFocusable("12", 5, 6); // 2: the first empty cell
 * ```
 */
export function codeFocusable(value: string, index: number, length: number): number {
  return Math.max(0, Math.min(index, value.length, length - 1));
}

/**
 * Applies digits typed into cell `index`.
 *
 * @remarks
 * A run of digits (a one-time-code autofill into one cell) fills forward from that cell, and the
 * focus moves to the cell after the last one filled. Characters that are not digits are dropped.
 *
 * @param value - The digits typed so far.
 * @param index - The cell typed into.
 * @param raw - What was typed or autofilled.
 * @param length - How many cells the code has.
 * @returns The next value and the cell to focus.
 *
 * @example
 * ```ts
 * import { codeType } from "@simplix-react/ui";
 *
 * codeType("12", 2, "3", 6); // { value: "123", focus: 3 }
 * ```
 */
export function codeType(value: string, index: number, raw: string, length: number): CodeEdit {
  const digits = digitsOf(raw);
  const at = codeFocusable(value, index, length);
  if (digits === "") return { value, focus: at };
  const next = (value.slice(0, at) + digits + value.slice(at + digits.length)).slice(0, length);
  return { value: next, focus: Math.min(at + digits.length, length - 1) };
}

/**
 * Applies Backspace in cell `index`.
 *
 * @remarks
 * A filled cell loses its digit and the later digits close up; an empty cell moves the focus back
 * one and clears that cell.
 *
 * @param value - The digits typed so far.
 * @param index - The cell Backspace was pressed in.
 * @param length - How many cells the code has.
 * @returns The next value and the cell to focus.
 *
 * @example
 * ```ts
 * import { codeBackspace } from "@simplix-react/ui";
 *
 * codeBackspace("123", 3, 6); // { value: "12", focus: 2 }
 * ```
 */
export function codeBackspace(value: string, index: number, length: number): CodeEdit {
  const at = codeFocusable(value, index, length);
  if (at < value.length) return { value: value.slice(0, at) + value.slice(at + 1), focus: at };
  if (at === 0) return { value, focus: 0 };
  return { value: value.slice(0, at - 1), focus: at - 1 };
}

/**
 * Applies pasted text: its digits replace the whole code, so a pasted full code fills every cell.
 *
 * @param raw - The pasted text.
 * @param length - How many cells the code has.
 * @returns The next value and the cell to focus, or `null` when the text holds no digit.
 *
 * @example
 * ```ts
 * import { codePaste } from "@simplix-react/ui";
 *
 * codePaste("Your code: 482 913", 6); // { value: "482913", focus: 5 }
 * ```
 */
export function codePaste(raw: string, length: number): CodeEdit | null {
  const digits = digitsOf(raw).slice(0, length);
  if (digits === "") return null;
  return { value: digits, focus: Math.min(digits.length, length - 1) };
}
