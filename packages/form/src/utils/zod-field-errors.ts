import type { z } from "zod";

/**
 * Adapter that turns a failed Zod `safeParse` into the
 * `Record<field, message>` shape used by `@simplix-react/ui`'s
 * `useCrudFormSubmit({ validator })` option.
 *
 * Returns `null` on success — pass-through with no field errors.
 * Returns a record of `dot.joined.path` → first issue message on
 * failure. When the same field has multiple issues, only the FIRST
 * one is kept (Zod typically reports the most relevant issue first,
 * and a single message per field keeps the form UI compact).
 *
 * @param schema - Any Zod schema (object, refined, intersection, etc.)
 * @param values - Form values to validate
 * @returns A field-error record on failure, or `null` on success
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { zodToFieldErrors } from "@simplix-react/form";
 *
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(1),
 * });
 *
 * // Inside a useCrudFormSubmit caller:
 * const { handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
 *   ...,
 *   validator: (v) => zodToFieldErrors(createUserSchema, v),
 * });
 * ```
 *
 * @example nested and array paths
 * ```ts
 * const schema = z.object({
 *   profile: z.object({ phone: z.string().min(1) }),
 *   tags: z.array(z.object({ name: z.string().min(1) })),
 * });
 *
 * zodToFieldErrors(schema, { profile: { phone: "" }, tags: [{ name: "" }] });
 * // { "profile.phone": "...", "tags.0.name": "..." }
 * ```
 */
export function zodToFieldErrors<S extends z.ZodTypeAny>(
  schema: S,
  values: unknown,
): Record<string, string> | null {
  const result = schema.safeParse(values);
  if (result.success) return null;

  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.map(String).join(".");
    if (!out[field]) out[field] = issue.message;
  }
  return out;
}
