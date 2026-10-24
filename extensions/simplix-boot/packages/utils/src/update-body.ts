/**
 * The record an edit read handed back, made into the body its update endpoint accepts.
 *
 * <p><b>Why a helper rather than a spread.</b> Every update endpoint here takes the whole record,
 * so a form that sends only what it edits clears everything it does not show. The answer is to
 * spread what the edit read returned and override the edited fields on top — but the read and the
 * write do not speak quite the same dialect, and two differences bite:
 *
 * <ol>
 *   <li>a boot enum arrives as <code>{ type, value, label }</code> and the write wants the bare
 *       constant, so a record spread as it arrived is refused whole;</li>
 *   <li>the edit DTO carries the audit quartet the update DTO has no field for.</li>
 * </ol>
 *
 * <p>Done by hand at each call site, both are a list somebody has to keep in step with the DTO —
 * which is the enumeration this exists to end. Naming every enum on the record is the same work as
 * naming every field, and the field that gets forgotten is silently blanked.
 */

/** The stamps an edit read adds and an update body has no field for. */
const AUDIT_STAMPS = ["createdBy", "createdAt", "updatedBy", "updatedAt"] as const;

/** Those same four as a type, so the return type says the fields are gone. */
type AuditStamp = (typeof AUDIT_STAMPS)[number];

/**
 * Whether a value is the envelope Boot wraps an enum in.
 *
 * <p>Tested on both `type` and `value` so a translation map — `{ ko: "…", en: "…" }` — cannot
 * match: it is an object on the record too, and it is exactly the kind of field this helper exists
 * to carry across intact.
 */
function isBootEnumEnvelope(value: unknown): value is { type: string; value: unknown } {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && "type" in value
    && "value" in value
  );
}

/**
 * Turns what `useGet<Entity>ForEdit` answered into the body `useUpdate<Entity>` accepts.
 *
 * <p>Spread it first and put the edited fields after it:
 *
 * ```ts
 * await update.mutateAsync({ areaId, data: { ...updateBody(loaded), areaId, areaName } });
 * ```
 *
 * <p><b>An absent record is an empty body, not a crash.</b> A panel that both writes and edits
 * calls this on whatever the edit read answered with, and on the write path that read never ran —
 * so the argument is `undefined` exactly when the form is being used to create. Refusing it there
 * throws `Cannot convert undefined or null to object` inside the submit handler, which React
 * swallows: the button reports nothing, sends nothing, and the operator presses it again. Nothing
 * is underneath a record that does not exist yet, and that is what the empty object says.
 *
 * <p><b>Two signatures, because the caller already knows which case it is in.</b> Hand it a record
 * and every field of that record comes back, which is what an edit body needs — a single
 * `Partial` return would weaken that for every existing caller and make each of them re-state the
 * fields the DTO requires. Hand it something that may be absent and the result is partial, which
 * is the truth on the create path. Widening the argument without splitting the return moved the
 * cost onto callers that had done nothing wrong.
 *
 * @typeParam T the `<Entity>UpdateFormDTO` the edit read answered with
 * @param loaded that record, or nothing when this submit is creating rather than editing
 * @returns the same record with every boot enum resolved to its constant and the audit stamps
 *          dropped — nothing else is added, removed or reordered — or an empty body when there is
 *          no record to put underneath
 */
export function updateBody<T extends object>(loaded: T): Omit<T, AuditStamp>;
export function updateBody<T extends object>(
  loaded: T | null | undefined,
): Partial<Omit<T, AuditStamp>>;
export function updateBody<T extends object>(
  loaded: T | null | undefined,
): Partial<Omit<T, AuditStamp>> {
  const body: Record<string, unknown> = {};
  if (!loaded) {
    return body as Partial<Omit<T, AuditStamp>>;
  }
  for (const [key, value] of Object.entries(loaded)) {
    if ((AUDIT_STAMPS as readonly string[]).includes(key)) continue;
    body[key] = isBootEnumEnvelope(value) ? value.value : value;
  }
  return body as Partial<Omit<T, AuditStamp>>;
}
