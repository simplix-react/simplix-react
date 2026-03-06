import type { FetchFn } from "@simplix-react/contract";
import { createFetch } from "@simplix-react/contract";
import { ApiResponseError } from "./api-response-error.js";
import type { BootEnvelope } from "./envelope.js";

export const bootResponseAdapter = {
  toError: (raw: unknown, status: number): Error => toBootError(raw, status),
};

function toBootError(body: unknown, status: number): Error {
  if (body && typeof body === "object" && "type" in body) {
    const env = body as BootEnvelope;
    return new ApiResponseError(
      status,
      env.type,
      env.message,
      env.timestamp,
      env.errorCode ?? undefined,
      env.errorDetail ?? undefined,
    );
  }
  return new ApiResponseError(
    status,
    "ERROR",
    `HTTP ${status}`,
    new Date().toISOString(),
  );
}

export interface BootFetchOptions {
  baseUrl?: string;
  getToken?: () => string | null;
}

/** HTTP + Boot error conversion only (no envelope unwrap) */
export function createBootHttpFetch(options?: BootFetchOptions): FetchFn {
  return createFetch({
    baseUrl: options?.baseUrl,
    getToken: options?.getToken,
    onError: ({ status, body }) => {
      throw toBootError(body, status);
    },
  });
}
