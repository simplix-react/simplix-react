import { getValidationErrors } from "@simplix-react/api";

/**
 * Extract and group server-side validation errors by field name.
 *
 * Uses `getValidationErrors` from `@simplix-react/api` to extract field errors,
 * then groups them into a `Record<string, string>` keyed by field name.
 * Multiple messages for the same field are comma-joined to match the
 * `fieldErrors: Record<string, string>` shape used by `useCrudFormSubmit`
 * and all form field components.
 *
 * @param error - Any caught error value (typically from a mutation `onError`).
 * @returns A record mapping field names to their error message string, or `null`
 *   if no validation errors were found.
 *
 * @example
 * ```ts
 * const grouped = groupValidationErrors(error);
 * // { email: "must be valid, already taken", name: "is required" }
 * ```
 */
export function groupValidationErrors(
  error: unknown,
): Record<string, string> | null {
  const errors = getValidationErrors(error);
  if (!errors || errors.length === 0) return null;

  const grouped: Record<string, string> = {};
  for (const e of errors) {
    grouped[e.field] = grouped[e.field]
      ? `${grouped[e.field]}, ${e.message}`
      : e.message;
  }
  return grouped;
}
