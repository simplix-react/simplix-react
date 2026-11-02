/**
 * A field whose record also carries a masked form of it. A DTO that answers with the address
 * decrypted for display and again masked is stating which of the two a screen may show; the screen
 * draws the masked one and leaves the other out.
 */
export interface MaskableField {
  readonly name: string;
  readonly isUnmasked?: boolean;
}

/**
 * The fields with every one that has a masked twin flagged `isUnmasked`.
 *
 * <p>SimpliX Meta carries no marker for personal data, so the pairing is read from the field
 * names: the project says which suffix names the masked form (`scaffold.maskedSuffix`, for
 * example `"Masked"`), and a field `x` is unmasked when `x` plus the suffix is also a field of the
 * same record. The templates leave a flagged field out of the list, the detail and the sample
 * rows. Without a suffix nothing is flagged.
 *
 * @param fields the fields of one record
 * @param suffix the suffix that names a masked form, or undefined for none
 * @returns the fields, the unmasked ones flagged
 */
export function withUnmaskedFlagged<F extends MaskableField>(fields: readonly F[], suffix: string | undefined): F[] {
  if (!suffix) return [...fields];
  const names = new Set(fields.map((field) => field.name));
  return fields.map((field) => (names.has(`${field.name}${suffix}`) ? { ...field, isUnmasked: true } : field));
}
