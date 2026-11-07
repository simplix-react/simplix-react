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
  /** Only a verb of the entity moves it, never the form. */
  readonly verbOnly?: boolean;
}

/**
 * The fields a form writes, read by the form widget and by the story's form panel alike.
 *
 * <p>An i18n pair is written through its map, and the record's own key, server-set fields, the
 * name a reference is shown by, the order a list's drag owns and a value only a verb moves (an
 * enable with its confirmation, frontend invariant #74) are never typed in. A key nobody
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
      !f.verbOnly &&
      f.name !== orderField,
  );
}

/** A field only a verb moves that a new record still has to send: its name and the value it starts at. */
export interface VerbOnlyCreateDefault {
  readonly name: string;
  /** SimpliX Meta's `defaultValue` as a TypeScript literal. */
  readonly defaultLiteral: string;
}

/**
 * The values a create sends for the fields only a verb moves, which the form leaves out: each field
 * the create body carries that states a default starts at it. An edit sends the stored value back
 * from the edit read, so it needs none.
 *
 * @param fields the request fields with their contract flags
 * @param createFields every field the create body carries; absent where the entity has no create
 * @param createRequired the fields the create body requires
 * @returns one entry per field to send, in field order
 * @throws Error when the create body requires such a field and SimpliX Meta states no default for it,
 *   since every create the form sent would be refused for the missing value
 */
export function verbOnlyCreateDefaultsOf(
  fields: ReadonlyArray<{ readonly name: string; readonly verbOnly?: boolean; readonly defaultLiteral?: string }>,
  createFields: readonly string[] | undefined,
  createRequired: readonly string[] = [],
): VerbOnlyCreateDefault[] {
  if (!createFields) return [];
  const out: VerbOnlyCreateDefault[] = [];
  for (const field of fields) {
    if (!field.verbOnly || !createFields.includes(field.name)) continue;
    if (field.defaultLiteral !== undefined) out.push({ name: field.name, defaultLiteral: field.defaultLiteral });
    else if (createRequired.includes(field.name)) {
      throw new Error(
        `${field.name}: only a verb moves it, so the form leaves it out, and the create body requires it with no defaultValue in SimpliX Meta; declare its default on the create DTO`,
      );
    }
  }
  return out;
}
