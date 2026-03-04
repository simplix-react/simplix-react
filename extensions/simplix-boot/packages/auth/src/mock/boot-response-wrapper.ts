import type { MockResponseWrapper } from "@simplix-react/mock";
import { wrapEnvelope } from "../envelope.js";

/**
 * Mock response wrapper that produces the SimpliX Boot envelope format.
 *
 * Wraps mock data in `{ type, message, body, timestamp }` so that
 * {@link createBootHttpFetch}'s error handler can process Boot error responses correctly.
 *
 * @example
 * ```ts
 * import { deriveMockHandlers } from "@simplix-react/mock";
 * import { bootResponseWrapper } from "@simplix-react-ext/simplix-boot-auth/mock";
 * import { petApi } from "./contract";
 *
 * const handlers = deriveMockHandlers(petApi.config, undefined, {
 *   responseWrapper: bootResponseWrapper,
 * });
 * ```
 */
export const bootResponseWrapper: MockResponseWrapper = {
  success: (data) => ({ ...wrapEnvelope(data) }),
  error: (error) => ({
    type: "ERROR",
    message: error?.message ?? "Error",
    body: null,
    timestamp: new Date().toISOString(),
    errorCode: error?.code ?? "UNKNOWN",
    errorDetail: null,
  }),
};
