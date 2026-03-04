import type { AnyFormApi } from "@tanstack/react-form";
import {
  getValidationErrors,
  type ValidationFieldError,
} from "@simplix-react/api";

/**
 * Maps server validation errors to TanStack Form field errors using duck typing.
 *
 * @remarks
 * Delegates to `getValidationErrors()` from `@simplix-react/api` for extraction,
 * then sets per-field error messages into each field's `errorMap.onSubmit` slot.
 *
 * Supports:
 * - **Spring Boot:** `{ errorDetail: [{ field, message }] }`
 * - **JSON:API-like:** `{ errors: [{ field, message }] }`
 * - **Rails:** `{ errors: { [field]: string[] } }`
 *
 * @param error - The error thrown by the mutation (any type)
 * @param form - The TanStack Form instance to set field errors on
 * @returns `true` if validation errors were mapped, `false` otherwise
 *
 * @example
 * ```ts
 * import { mapServerErrorsToForm } from "@simplix-react/form";
 *
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   const mapped = mapServerErrorsToForm(error, form);
 *   if (!mapped) {
 *     // Not a validation error -- handle differently
 *   }
 * }
 * ```
 */
export function mapServerErrorsToForm(
  error: unknown,
  form: AnyFormApi,
): boolean {
  const fieldErrors = getValidationErrors(error);
  if (!fieldErrors || fieldErrors.length === 0) return false;

  const grouped = groupByField(fieldErrors);

  for (const [field, messages] of Object.entries(grouped)) {
    form.setFieldMeta(field, (meta) => ({
      ...meta,
      errorMap: {
        ...meta.errorMap,
        onSubmit: messages.join(", "),
      },
    }));
  }

  return true;
}

function groupByField(
  errors: ValidationFieldError[],
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const err of errors) {
    if (!grouped[err.field]) grouped[err.field] = [];
    grouped[err.field].push(err.message);
  }
  return grouped;
}
