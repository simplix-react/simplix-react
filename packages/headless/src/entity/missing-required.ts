/**
 * How many of a form's required values are still empty.
 *
 * <p><b>A required field's asterisk is a claim the form has to keep.</b> Marked required and left
 * empty, the press goes to the server, the server refuses it, and what the reader gets back is a
 * round trip and an error summary — for a fact the screen already had. Worse, a form whose 저장 is
 * live over an empty required field has told the reader the field is optional after all.
 *
 * <p><b>Counted rather than judged true or false</b> because {@link SaveButton} draws the count on
 * the button: the reader is told how many are missing before they go looking for which.
 *
 * <p>Empty means absent, null, or a string of nothing but spaces. A `false` is a value — an
 * unticked switch is an answer — and a `0` is a value too.
 *
 * @param values what the form holds now
 * @param required the fields it draws an asterisk on
 * @returns how many of them are empty
 */
export function missingRequired<T extends object>(
  values: T,
  required: readonly (keyof T & string)[],
): number {
  return required.filter((field) => {
    const held = values[field];
    return held === undefined || held === null || (typeof held === "string" && !held.trim());
  }).length;
}
