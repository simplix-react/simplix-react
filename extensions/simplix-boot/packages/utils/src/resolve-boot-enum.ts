/**
 * Extract string value from Boot API enum objects.
 * Boot may return enums as plain strings or as { type, value, label } objects.
 */
export function resolveBootEnum(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "value" in v) {
    return String((v as { value: unknown }).value);
  }
  return String(v);
}
