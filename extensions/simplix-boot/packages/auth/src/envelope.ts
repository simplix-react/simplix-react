import { z } from "zod";

export interface BootEnvelope<T = unknown> {
  type: string;
  message: string;
  body: T;
  timestamp: string;
  errorCode?: string | null;
  errorDetail?: Record<string, unknown> | null;
}

export function envelopeSchema<T extends z.ZodType>(bodySchema: T) {
  return z.object({
    type: z.string(),
    message: z.string(),
    body: bodySchema,
    timestamp: z.string(),
    errorCode: z.string().nullable().optional(),
    errorDetail: z.record(z.string(), z.unknown()).nullable().optional(),
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

export function unwrapEnvelope<T>(wire: unknown): T {
  return (wire as BootEnvelope<T>).body;
}
