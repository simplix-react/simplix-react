/**
 * One amount and the unit it is counted in, as a reader says it — 「12개월」, 「50인」, 「3회」.
 *
 * @remarks
 * <b>The unit's word travels with the number rather than beside it.</b> A value and a separately
 * drawn unit read as two facts and wrap apart at a narrow column; one string is one measurement.
 *
 * @remarks
 * <b>The unit arrives two ways and this takes both, because both are in the tree.</b> A boot enum
 * the server resolved carries its own `label`, and a caller holding the catalogue resolves the
 * constant itself. Pass `unitLabel` where the screen already has the catalogue bound — the word
 * then follows the catalogue into every language rather than following whatever the server's
 * locale was — and leave it out where the server's label is what the screen has.
 *
 * @remarks
 * <b>Absent stays absent, and the caller says what absent looks like.</b> A cell of its own draws
 * `EmptyValue`; a slot inside a sentence needs a character the translator can place, because
 * `t()` reorders its named parts per language and a node in one breaks it into fragments nothing
 * can reorder. Picking one here would pick for both.
 *
 * @param amount the number, absent where nothing set one
 * @param unit the unit beside it — a boot enum object, its bare constant, or nothing
 * @param unitLabel what turns that constant into the reader's own word, where the caller has it
 * @returns the two as one string, or `undefined` where there is no number
 */
export function unitAmount(
  amount: number | undefined | null,
  unit: unknown,
  unitLabel?: (constant: string) => string,
): string | undefined {
  if (amount === undefined || amount === null) return undefined;
  const boxed = unit as { label?: string; value?: string } | string | undefined | null;
  const constant = typeof boxed === "string" ? boxed : boxed?.value;
  const word = unitLabel && constant
    ? unitLabel(constant)
    : typeof boxed === "string"
      ? undefined
      : boxed?.label;
  return word ? `${amount}${word}` : String(amount);
}
