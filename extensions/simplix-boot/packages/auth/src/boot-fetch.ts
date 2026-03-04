import { createAppFetch, type OrvalMutator, type ResponseAdapter } from "@simplix-react/api";
import { ApiResponseError } from "./api-response-error.js";
import type { BootEnvelope } from "./envelope.js";

export const bootResponseAdapter: ResponseAdapter = {
  toError: (raw: unknown, status: number): Error => {
    if (raw && typeof raw === "object" && "type" in raw) {
      const env = raw as BootEnvelope;
      return new ApiResponseError(
        status,
        env.type,
        env.message,
        env.timestamp,
        env.errorCode ?? undefined,
        (env.errorDetail as Record<string, unknown>) ?? undefined,
      );
    }
    return new ApiResponseError(
      status,
      "ERROR",
      `HTTP ${status}`,
      new Date().toISOString(),
    );
  },
};

export interface BootFetchOptions {
  baseUrl?: string;
  getToken?: () => string | null;
}

/** HTTP + Boot error conversion only (no envelope unwrap) */
export function createBootHttpFetch(options?: BootFetchOptions): OrvalMutator {
  return createAppFetch({
    baseUrl: options?.baseUrl,
    getToken: options?.getToken,
    responseAdapter: { toError: bootResponseAdapter.toError },
  });
}
