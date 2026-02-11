/**
 * Represents the outcome of a mock repository operation.
 *
 * Encapsulates either a successful result with data or a failure with an error code
 * and message. Used throughout `@simplix-react/mock` to provide consistent return
 * types from all database operations.
 *
 * @typeParam T - The type of the data payload on success.
 *
 * @example
 * ```ts
 * import type { MockResult } from "@simplix-react/mock";
 *
 * function handleResult(result: MockResult<{ id: string; name: string }>) {
 *   if (result.success) {
 *     console.log(result.data?.name);
 *   } else {
 *     console.error(result.error?.code, result.error?.message);
 *   }
 * }
 * ```
 *
 * @see {@link mockSuccess} - Creates a successful result.
 * @see {@link mockFailure} - Creates a failure result.
 */
export interface MockResult<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

/**
 * Creates a successful {@link MockResult} wrapping the given data.
 *
 * @typeParam T - The type of the data payload.
 * @param data - The data to wrap in a success result.
 * @returns A {@link MockResult} with `success: true` and the provided data.
 *
 * @example
 * ```ts
 * import { mockSuccess } from "@simplix-react/mock";
 *
 * const result = mockSuccess({ id: "1", title: "My Task" });
 * // { success: true, data: { id: "1", title: "My Task" } }
 * ```
 */
export function mockSuccess<T>(data: T): MockResult<T> {
  return { success: true, data };
}

/**
 * Creates a failure {@link MockResult} with the given error code and message.
 *
 * @param error - An object containing an error `code` and human-readable `message`.
 * @returns A {@link MockResult} with `success: false` and the provided error.
 *
 * @example
 * ```ts
 * import { mockFailure } from "@simplix-react/mock";
 *
 * const result = mockFailure({ code: "not_found", message: "Task not found" });
 * // { success: false, error: { code: "not_found", message: "Task not found" } }
 * ```
 */
export function mockFailure(error: {
  code: string;
  message: string;
}): MockResult<never> {
  return { success: false, error };
}
