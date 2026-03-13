/**
 * Fetch function signature used by Orval-generated API clients.
 *
 * @typeParam T - Expected response body type.
 *
 * @example
 * ```ts
 * const fetcher: OrvalMutator = async (url, options) => {
 *   const res = await fetch(url, options);
 *   if (!res.ok) throw new HttpError(res.status, res.statusText);
 *   return res.json();
 * };
 * ```
 */
export type OrvalMutator = <T>(url: string, options?: RequestInit) => Promise<T>;

/**
 * HTTP error with status code and optional response data.
 *
 * @remarks
 * Thrown by mutator implementations when the server returns a non-2xx response.
 * The `status` field enables error classification via {@link classifyError}.
 *
 * @example
 * ```ts
 * throw new HttpError(404, "Pet not found", { errorCode: "PET_NOT_FOUND" });
 * ```
 */
export class HttpError extends Error {
  /**
   * @param status - HTTP status code (e.g. 400, 401, 500).
   * @param message - Human-readable error message.
   * @param data - Optional response body or structured error payload.
   */
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const _registry = new Map<string, OrvalMutator>();

// ── Request Locale ──────────────────────────────────────────

let _locale: string | undefined;

/**
 * Set the locale for API requests.
 *
 * When set, {@link getMutator} automatically injects an `Accept-Language`
 * header into every outgoing request. Typically wired to your i18n adapter's
 * locale-change callback.
 *
 * @param locale - BCP 47 locale code (e.g. `"ko"`, `"en-US"`).
 *
 * @example
 * ```ts
 * import { setRequestLocale } from "@simplix-react/api";
 *
 * // Wire to i18n adapter
 * i18nAdapter.onLocaleChange(setRequestLocale);
 * ```
 */
export function setRequestLocale(locale: string): void {
  _locale = locale;
}

/**
 * Returns the currently configured request locale, or `undefined` if not set.
 */
export function getRequestLocale(): string | undefined {
  return _locale;
}

/**
 * Returns the client's IANA timezone identifier (e.g. `"Asia/Seoul"`).
 *
 * @remarks
 * Auto-detected from the browser/OS via `Intl.DateTimeFormat`.
 * `X-Timezone` header is injected at the `createFetch()` layer
 * so all HTTP requests include it automatically.
 */
export function getRequestTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Register a fetch function for Orval-generated API clients.
 *
 * @remarks
 * Supports named strategies for multi-backend setups.
 * When called with a single argument, registers under the `"default"` strategy.
 *
 * @example
 * ```ts
 * // Default strategy
 * configureMutator(myFetcher);
 *
 * // Named strategy for multi-backend
 * configureMutator("admin", adminFetcher);
 * ```
 */
export function configureMutator(fetch: OrvalMutator): void;
export function configureMutator(strategy: string, fetch: OrvalMutator): void;
export function configureMutator(
  fetchOrStrategy: OrvalMutator | string,
  fetch?: OrvalMutator,
): void {
  if (typeof fetchOrStrategy === "string") {
    _registry.set(fetchOrStrategy, fetch!);
  } else {
    _registry.set("default", fetchOrStrategy);
  }
}

/**
 * Retrieve a previously registered mutator by strategy name.
 *
 * @param strategy - Strategy name (defaults to `"default"`).
 * @returns The registered {@link OrvalMutator} function.
 * @throws {Error} When the requested strategy has not been configured.
 *
 * @example
 * ```ts
 * const fetcher = getMutator();          // default
 * const admin = getMutator("admin");     // named strategy
 * ```
 */
export function getMutator(strategy = "default"): OrvalMutator {
  const mutator = _registry.get(strategy);
  if (!mutator) {
    throw new Error(
      `Mutator "${strategy}" not configured. Call configureMutator() first.`,
    );
  }
  if (!_locale) return mutator;

  return <T>(url: string, options?: RequestInit): Promise<T> => {
    const existing = (options?.headers ?? {}) as Record<string, string>;
    if (existing["Accept-Language"]) {
      return mutator<T>(url, options);
    }
    return mutator<T>(url, {
      ...options,
      headers: { ...existing, "Accept-Language": _locale! },
    });
  };
}

/**
 * Error wrapper type used by Orval-generated code.
 *
 * @typeParam T - Optional typed error payload.
 */
export type ErrorType<T = unknown> = Error & { data?: T };

/**
 * Identity type alias used by Orval for request body parameters.
 *
 * @typeParam T - The request body type.
 */
export type BodyType<T> = T;

export {
  type ValidationFieldError,
  type ErrorCategory,
  type ServerErrorEvent,
  getValidationErrors,
  getErrorMessage,
  getErrorCode,
  getHttpStatus,
  classifyError,
  createMutationErrorHandler,
} from "./error-utils.js";
