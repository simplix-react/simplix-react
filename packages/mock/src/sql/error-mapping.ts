/**
 * Represents a mapped database error with an HTTP-friendly status code.
 *
 * Produced by {@link mapPgError} from raw PostgreSQL/PGlite exceptions.
 *
 * @see {@link mapPgError} - Creates instances from raw errors.
 */
export interface MockError {
  /** The HTTP status code corresponding to the error type. */
  status: number;
  /** A machine-readable error code (e.g. `"unique_violation"`, `"not_found"`). */
  code: string;
  /** A human-readable error description. */
  message: string;
}

/**
 * Maps a raw PostgreSQL/PGlite error to an HTTP-friendly {@link MockError}.
 *
 * Inspects the error message to classify the error:
 *
 * | Pattern                  | Code                    | HTTP Status |
 * | ------------------------ | ----------------------- | ----------- |
 * | unique / duplicate       | `unique_violation`      | 409         |
 * | foreign key              | `foreign_key_violation` | 422         |
 * | not-null / null value    | `not_null_violation`    | 422         |
 * | not found / no rows      | `not_found`             | 404         |
 * | (unrecognized)           | `query_error`           | 500         |
 *
 * @param err - The raw error thrown by a PGlite query.
 * @returns A structured {@link MockError} with status, code, and message.
 *
 * @example
 * ```ts
 * import { mapPgError } from "@simplix-react/mock";
 *
 * try {
 *   await db.query("INSERT INTO tasks ...");
 * } catch (err) {
 *   const mapped = mapPgError(err);
 *   console.error(mapped.code, mapped.status); // e.g. "unique_violation" 409
 * }
 * ```
 */
export function mapPgError(err: unknown): MockError {
  if (err instanceof Error) {
    const message = err.message;

    // Unique / duplicate violation
    if (message.includes("unique") || message.includes("duplicate")) {
      return {
        status: 409,
        code: "unique_violation",
        message: "A record with this value already exists",
      };
    }

    // Foreign key violation
    if (message.includes("foreign key") || message.includes("violates foreign key")) {
      return {
        status: 422,
        code: "foreign_key_violation",
        message: "Referenced record does not exist",
      };
    }

    // Not null violation
    if (message.includes("not-null") || message.includes("null value")) {
      return {
        status: 422,
        code: "not_null_violation",
        message: "Required field is missing",
      };
    }

    // Not found (custom)
    if (message.includes("not found") || message.includes("no rows")) {
      return {
        status: 404,
        code: "not_found",
        message: "Record not found",
      };
    }
  }

  return {
    status: 500,
    code: "query_error",
    message: err instanceof Error ? err.message : "Unknown database error",
  };
}
