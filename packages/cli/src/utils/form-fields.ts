/** A field as the form reads it: its name and the flags that keep it out of a form. */
export interface FormFieldCandidate {
  readonly name: string;
  readonly isIdentifier?: boolean;
  readonly isOpaqueId?: boolean;
  readonly isI18nPair?: boolean;
  readonly isSystemField?: boolean;
  readonly isReferenceName?: boolean;
  readonly isAuditField?: boolean;
  /** Whether the DTO the field was read from requires it. */
  readonly required?: boolean;
}

/**
 * The fields a form writes, read by the form widget and by the story's form panel alike.
 *
 * <p>An i18n pair is written through its map, and the record's own key, server-set fields, the
 * name a reference is shown by and the order a list's drag owns are never typed in. A key nobody
 * can name stays out unless the create body requires it: left out, every create the form sends is
 * refused for the missing value.
 *
 * @param fields the request fields with their contract flags
 * @param orderField the field a list's drag owns, left out of the form
 */
export function formFieldsOf<F extends FormFieldCandidate>(fields: readonly F[], orderField?: string): F[] {
  return fields.filter(
    (f) =>
      !f.isIdentifier &&
      !(f.isOpaqueId && !f.required) &&
      !f.isI18nPair &&
      !f.isSystemField &&
      !f.isReferenceName &&
      !f.isAuditField &&
      f.name !== orderField,
  );
}
