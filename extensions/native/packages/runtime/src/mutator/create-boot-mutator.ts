import {
  HttpError,
  configureMutator,
  getRequestLocale,
  type OrvalMutator,
} from "@simplix-react/api";
import { unwrapEnvelope } from "@simplix-react-ext/simplix-boot-auth";

/** Context handed to the unauthorized handler. */
export interface UnauthorizedContext {
  /** HTTP status that signalled the rejection (401). */
  status: number;
  /** Request URL that was rejected. */
  url: string;
}

/** Options for {@link createNativeBootMutator}. */
export interface NativeBootMutatorOptions {
  /** API origin (e.g. `"http://10.0.2.2:8080"`). Native apps always need an absolute origin. */
  baseUrl: string;
  /** Supplies the current auth token, typically from a hydrated {@link NativeTokenStore}. */
  getToken?: () => string | null;
  /** Header carrying the token. Defaults to `"Authorization"`. */
  tokenHeader?: string;
  /** Scheme prefix for the token value. Defaults to `"Bearer"`; pass `null` for a raw token header. */
  tokenScheme?: string | null;
  /**
   * Called when the server rejects the request as unauthenticated (401).
   * Native apps register their own recovery (kiosk: device re-registration
   * screen) — there is no login page to redirect to.
   */
  onUnauthorized?: (context: UnauthorizedContext) => void;
}

/**
 * Builds the `boot`-strategy mutator for React Native apps. Reuses the web
 * Boot-envelope logic unchanged — only the token source is adapted:
 *
 * - attaches the token from `getToken` (Bearer `Authorization` by default),
 * - propagates the request locale as `Accept-Language`,
 * - unwraps the Boot envelope (non-SUCCESS envelopes throw),
 * - routes 401 to `onUnauthorized`, throws `HttpError` for other failures.
 *
 * @example
 * ```ts
 * configureMutator("boot", createNativeBootMutator({
 *   baseUrl: process.env.EXPO_PUBLIC_API_URL!,
 *   getToken: () => tokenStore.get("access_token"),
 *   onUnauthorized: () => router.replace("/register-device"),
 * }));
 * ```
 */
export function createNativeBootMutator(
  options: NativeBootMutatorOptions,
): OrvalMutator {
  const {
    baseUrl,
    getToken,
    tokenHeader = "Authorization",
    tokenScheme = "Bearer",
    onUnauthorized,
  } = options;

  return async <T>(url: string, init?: RequestInit): Promise<T> => {
    const headers = new Headers(init?.headers);
    const token = getToken?.();
    if (token) {
      headers.set(tokenHeader, tokenScheme ? `${tokenScheme} ${token}` : token);
    }
    const locale = getRequestLocale();
    if (locale && !headers.has("Accept-Language")) {
      headers.set("Accept-Language", locale);
    }

    const response = await fetch(`${baseUrl}${url}`, { ...init, headers });
    const text = await response.text();
    let wire: unknown = null;
    if (text) {
      try {
        wire = JSON.parse(text);
      } catch {
        wire = text;
      }
    }

    if (response.status === 401) {
      onUnauthorized?.({ status: response.status, url });
    }
    if (!response.ok) {
      const message =
        wire && typeof wire === "object" && "message" in wire && typeof wire.message === "string"
          ? wire.message
          : response.statusText;
      throw new HttpError(response.status, message, wire);
    }
    return unwrapEnvelope(wire) as T;
  };
}

/**
 * Convenience: build and register the `boot`-strategy mutator in one call.
 * Generated domain packages resolve it via `getMutator("boot")`.
 */
export function configureNativeBootMutator(options: NativeBootMutatorOptions): void {
  configureMutator("boot", createNativeBootMutator(options));
}
