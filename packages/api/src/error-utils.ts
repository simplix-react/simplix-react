// ── Types ──

export interface ValidationFieldError {
  field: string;
  message: string;
}

export type ErrorCategory =
  | "validation"
  | "auth"
  | "client"
  | "server"
  | "network"
  | "unknown";

export interface ServerErrorEvent {
  category: ErrorCategory;
  status?: number;
  errorCode?: string;
  message: string;
  validationErrors?: ValidationFieldError[];
  raw: unknown;
}

// ── Internal helpers ──

function isValidationFieldErrorArray(
  val: unknown,
): val is ValidationFieldError[] {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every(
      (e) =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as Record<string, unknown>).field === "string" &&
        typeof (e as Record<string, unknown>).message === "string",
    )
  );
}

function isRailsErrorObject(
  val: unknown,
): val is { errors: Record<string, string[]> } {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;
  if (typeof obj.errors !== "object" || obj.errors === null) return false;
  if (Array.isArray(obj.errors)) return false;
  const errors = obj.errors as Record<string, unknown>;
  return Object.values(errors).every(
    (v) => Array.isArray(v) && v.every((m) => typeof m === "string"),
  );
}

function railsErrorsToFieldErrors(
  errors: Record<string, string[]>,
): ValidationFieldError[] {
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })),
  );
}

function extractFromObject(
  obj: unknown,
): ValidationFieldError[] | null {
  if (typeof obj !== "object" || obj === null) return null;
  const rec = obj as Record<string, unknown>;

  // errorDetail array (Spring Boot / ApiResponseError)
  if (isValidationFieldErrorArray(rec.errorDetail)) return rec.errorDetail;

  // errors array ({ field, message }[] shape)
  if (isValidationFieldErrorArray(rec.errors)) return rec.errors;

  // Rails-style { errors: { [field]: string[] } }
  if (isRailsErrorObject(obj)) {
    const result = railsErrorsToFieldErrors(
      obj.errors as Record<string, string[]>,
    );
    return result.length > 0 ? result : null;
  }

  return null;
}

// ── Public utilities ──

/**
 * Extract validation field errors from any error shape using duck typing.
 *
 * Extraction order:
 * 1. Direct properties on error (errorDetail, errors) — ApiResponseError / plain object
 * 2. error.data (HttpError shape)
 * 3. JSON.parse(error.body) fallback (ApiError / string body)
 */
export function getValidationErrors(
  error: unknown,
): ValidationFieldError[] | null {
  if (typeof error !== "object" || error === null) return null;
  const err = error as Record<string, unknown>;

  // 1. Direct properties on error object
  const fromDirect = extractFromObject(error);
  if (fromDirect) return fromDirect;

  // 2. error.data (HttpError shape)
  if (err.data != null) {
    const fromData = extractFromObject(err.data);
    if (fromData) return fromData;
  }

  // 3. JSON.parse(error.body) fallback
  if (typeof err.body === "string") {
    try {
      const parsed: unknown = JSON.parse(err.body);
      const fromParsed = extractFromObject(parsed);
      if (fromParsed) return fromParsed;
    } catch {
      // ignore parse failure
    }
  }

  return null;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

export function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const err = error as Record<string, unknown>;

  if (typeof err.errorCode === "string") return err.errorCode;

  if (typeof err.data === "object" && err.data !== null) {
    const data = err.data as Record<string, unknown>;
    if (typeof data.errorCode === "string") return data.errorCode;
  }

  return null;
}

/** Duck typing: extract status from any error with a numeric `status` property. */
export function getHttpStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  const err = error as Record<string, unknown>;
  if (typeof err.status === "number") return err.status;
  return null;
}

export function classifyError(error: unknown): ServerErrorEvent {
  const status = getHttpStatus(error);
  const message = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const validationErrors = getValidationErrors(error) ?? undefined;

  // Network error: TypeError with no status
  if (error instanceof TypeError && status === null) {
    return {
      category: "network",
      message,
      errorCode: errorCode ?? undefined,
      raw: error,
    };
  }

  if (status !== null) {
    // Auth
    if (status === 401 || status === 403) {
      return {
        category: "auth",
        status,
        message,
        errorCode: errorCode ?? undefined,
        raw: error,
      };
    }

    // Server
    if (status >= 500) {
      return {
        category: "server",
        status,
        message,
        errorCode: errorCode ?? undefined,
        raw: error,
      };
    }

    // Validation (400-499 with validation errors)
    if (status >= 400 && status < 500 && validationErrors) {
      return {
        category: "validation",
        status,
        message,
        errorCode: errorCode ?? undefined,
        validationErrors,
        raw: error,
      };
    }

    // Client (400-499 without validation errors)
    if (status >= 400 && status < 500) {
      return {
        category: "client",
        status,
        message,
        errorCode: errorCode ?? undefined,
        raw: error,
      };
    }
  }

  return {
    category: "unknown",
    status: status ?? undefined,
    message,
    errorCode: errorCode ?? undefined,
    validationErrors,
    raw: error,
  };
}

export function createMutationErrorHandler(config: {
  onValidationError?: (event: ServerErrorEvent) => void;
  onAuthError?: (event: ServerErrorEvent) => void;
  onClientError?: (event: ServerErrorEvent) => void;
  onServerError?: (event: ServerErrorEvent) => void;
  onNetworkError?: (event: ServerErrorEvent) => void;
  onUnknownError?: (event: ServerErrorEvent) => void;
}): (error: Error, variables?: unknown, context?: unknown) => void {
  return (error: Error) => {
    const event = classifyError(error);

    switch (event.category) {
      case "validation":
        config.onValidationError?.(event);
        break;
      case "auth":
        config.onAuthError?.(event);
        break;
      case "client":
        config.onClientError?.(event);
        break;
      case "server":
        config.onServerError?.(event);
        break;
      case "network":
        config.onNetworkError?.(event);
        break;
      case "unknown":
        config.onUnknownError?.(event);
        break;
    }
  };
}
