import { z } from "zod";
import { ApiResponseError, type ErrorDetail } from "./api-response-error.js";

export interface BootEnvelope<T = unknown> {
  type: string;
  message: string;
  body: T;
  timestamp: string;
  errorCode?: string | null;
  errorDetail?: ErrorDetail | null;
}

export function envelopeSchema<T extends z.ZodType>(bodySchema: T) {
  return z.object({
    type: z.string(),
    message: z.string(),
    body: bodySchema,
    timestamp: z.string(),
    errorCode: z.string().nullable().optional(),
    errorDetail: z
      .union([
        z.array(
          z.object({ field: z.string(), message: z.string() }).passthrough(),
        ),
        z.record(z.string(), z.unknown()),
      ])
      .nullable()
      .optional(),
  });
}

export function wrapEnvelope<T>(body: T): BootEnvelope<T> {
  return {
    type: "SUCCESS",
    message: "OK",
    body,
    timestamp: new Date().toISOString(),
    errorCode: null,
    errorDetail: null,
  };
}

function isBootEnvelope(wire: unknown): wire is BootEnvelope {
  return (
    wire != null &&
    typeof wire === "object" &&
    "type" in wire &&
    "body" in wire &&
    "message" in wire &&
    "timestamp" in wire
  );
}

export function unwrapEnvelope<T>(wire: unknown): T {
  if (isBootEnvelope(wire)) {
    if (wire.type !== "SUCCESS") {
      throw new ApiResponseError(
        400,
        wire.type,
        wire.message,
        wire.timestamp,
        wire.errorCode ?? undefined,
        wire.errorDetail ?? undefined,
      );
    }
    return wire.body as T;
  }
  return wire as T;
}
