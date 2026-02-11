import { ApiError } from "@simplix-react/contract";
import type { AnyFormApi } from "@tanstack/react-form";

interface RailsErrorBody {
  errors: Record<string, string[]>;
}

interface JsonApiError {
  field: string;
  message: string;
}

interface JsonApiErrorBody {
  errors: JsonApiError[];
}

/**
 * Maps 422 validation errors from the server to TanStack Form field errors.
 *
 * @remarks
 * Parses the `body` of an `ApiError` with status 422 and sets per-field
 * error messages into each field's `errorMap.onSubmit` slot.
 *
 * Supports two server error formats:
 * - **Rails:** `{ errors: { [field]: string[] } }`
 * - **JSON:API:** `{ errors: [{ field, message }] }`
 *
 * Non-`ApiError` instances, non-422 status codes, and unparseable bodies
 * are silently ignored (no-op).
 *
 * @param error - The error thrown by the mutation (any type)
 * @param form - The TanStack Form instance to set field errors on
 *
 * @example
 * ```ts
 * import { mapServerErrorsToForm } from "@simplix-react/form";
 *
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   mapServerErrorsToForm(error, form);
 * }
 * ```
 *
 * @see {@link ApiError} from `@simplix-react/contract`
 */
export function mapServerErrorsToForm(
  error: unknown,
  form: AnyFormApi,
): void {
  if (!(error instanceof ApiError) || error.status !== 422) return;

  let body: unknown;
  try {
    body = JSON.parse(error.body);
  } catch {
    return;
  }

  if (!body || typeof body !== "object") return;

  // Rails format: { errors: { [field]: string[] } }
  if (isRailsErrorBody(body)) {
    for (const [field, messages] of Object.entries(body.errors)) {
      setFieldServerErrors(form, field, messages);
    }
    return;
  }

  // JSON:API format: { errors: [{ field, message }] }
  if (isJsonApiErrorBody(body)) {
    const grouped: Record<string, string[]> = {};
    for (const err of body.errors) {
      if (!grouped[err.field]) grouped[err.field] = [];
      grouped[err.field].push(err.message);
    }
    for (const [field, messages] of Object.entries(grouped)) {
      setFieldServerErrors(form, field, messages);
    }
  }
}

function setFieldServerErrors(
  form: AnyFormApi,
  field: string,
  messages: string[],
): void {
  form.setFieldMeta(field, (meta) => ({
    ...meta,
    errorMap: {
      ...meta.errorMap,
      onSubmit: messages.join(", "),
    },
  }));
}

function isRailsErrorBody(body: unknown): body is RailsErrorBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!b.errors || typeof b.errors !== "object" || Array.isArray(b.errors))
    return false;
  return true;
}

function isJsonApiErrorBody(body: unknown): body is JsonApiErrorBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.errors)) return false;
  return b.errors.every(
    (e: unknown) =>
      typeof e === "object" &&
      e !== null &&
      "field" in e &&
      "message" in e,
  );
}
