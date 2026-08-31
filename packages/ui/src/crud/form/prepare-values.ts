import { applyI18nFallback } from "./i18n-submit-helper";

/**
 * What a form declares happens to its values on the way to the DTO.
 *
 * <p><b>Everything not named here passes through untouched.</b> That is the whole point: a form
 * that lists its fields to build the DTO has written the field list a second time, and a key left
 * out of that literal is a value that never leaves the browser while the request still answers 200.
 * Measured on one console, 168 such assignments did four mechanical things and 73 of them copied a
 * field across so the object would be complete.
 */
export interface DeclaredFields {
  /** Text fields whose surrounding space is not part of the value. */
  readonly trim?: readonly string[];
  /**
   * Fields where an empty box means「not given」rather than the empty string.
   *
   * <p>Applied after `trim`, so a box holding only spaces is not given either.
   */
  readonly emptyToUndefined?: readonly string[];
  /** Form-only state — a picker's open tab, a confirmation checkbox — that is not a DTO field. */
  readonly omit?: readonly string[];
}

/** Which map each translated column is derived from: i18n field name → plain field name. */
export type I18nFieldPairs = Record<string, string>;

/**
 * Turns a form's values into the DTO, by the declaration rather than by hand.
 *
 * <p><b>Exported because not every screen submits through {@link useCrudFormSubmit}.</b> A form
 * whose save is a mutation called directly — a wizard step, a record page that owns its own
 * lifecycle — cannot reach the hook's declaration, and without this it writes the same four
 * transforms again in its own body. That copy is the thing being ended, so it must not be the
 * price of not using the hook.
 *
 * <p>The order is the order a reader would do it by hand: tidy each value, decide which empty boxes
 * mean「not given」, then derive the base columns from their maps. The derivation comes last of the
 * three because it reads the maps as they will be stored, and a map carrying stray space would
 * otherwise put that space in the column every read projection resolves the reader's language out
 * of. Dropping the form's own state comes after all of it, so a field can be transformed and then
 * omitted without the order mattering to the caller.
 *
 * @param values the form's state
 * @param options what to do to it — every field not named passes through
 * @returns the DTO to send
 */
export function prepareValues<T>(
  values: T,
  options: {
    fields?: DeclaredFields;
    i18nFields?: I18nFieldPairs;
    locales?: ReadonlyArray<{ value: string }>;
  },
): T {
  const { fields, i18nFields, locales } = options;
  if (!fields && !i18nFields) return values;
  const next: Record<string, unknown> = { ...(values as Record<string, unknown>) };
  for (const name of fields?.trim ?? []) {
    const value = next[name];
    if (typeof value === "string") next[name] = value.trim();
  }
  for (const name of fields?.emptyToUndefined ?? []) {
    if (next[name] === "" || next[name] === null) next[name] = undefined;
  }
  if (i18nFields && locales) {
    for (const [i18nField, plainField] of Object.entries(i18nFields)) {
      const i18nValue = next[i18nField] as Record<string, string> | null | undefined;
      next[plainField] = applyI18nFallback(i18nValue, locales);
    }
  }
  for (const name of fields?.omit ?? []) delete next[name];
  return next as T;
}
