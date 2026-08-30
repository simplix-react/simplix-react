/**
 * Extract string value from Boot API enum objects.
 * Boot returns an enum either as a plain string or as a {@link LabeledEnumValue} — an object
 * carrying `value` and `label`. Anything else is coerced, so a shape this function does not know
 * still yields a string rather than throwing at a call site that only wanted to render it.
 */
export function resolveBootEnum(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "value" in v) {
    return String((v as { value: unknown }).value);
  }
  return String(v);
}
