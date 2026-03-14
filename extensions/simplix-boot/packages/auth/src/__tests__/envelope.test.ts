import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  envelopeSchema,
  unwrapEnvelope,
  wrapEnvelope,
} from "../envelope.js";
import { ApiResponseError } from "../api-response-error.js";

describe("wrapEnvelope", () => {
  it("wraps data in Boot envelope format", () => {
    const data = { id: 1, name: "Buddy" };
    const result = wrapEnvelope(data);

    expect(result.type).toBe("SUCCESS");
    expect(result.message).toBe("OK");
    expect(result.body).toEqual(data);
    expect(result.errorCode).toBeNull();
    expect(result.errorDetail).toBeNull();
    expect(result.timestamp).toBeDefined();
    // Verify timestamp is a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it("wraps null body", () => {
    const result = wrapEnvelope(null);
    expect(result.body).toBeNull();
    expect(result.type).toBe("SUCCESS");
  });

  it("wraps array body", () => {
    const data = [1, 2, 3];
    const result = wrapEnvelope(data);
    expect(result.body).toEqual([1, 2, 3]);
  });

  it("wraps primitive body", () => {
    const result = wrapEnvelope("hello");
    expect(result.body).toBe("hello");
  });
});

describe("unwrapEnvelope", () => {
  // ── SUCCESS envelope ──

  it("extracts body from envelope", () => {
    const envelope = {
      type: "SUCCESS",
      message: "OK",
      body: { id: 1, name: "Buddy" },
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: null,
      errorDetail: null,
    };

    expect(unwrapEnvelope<{ id: number; name: string }>(envelope)).toEqual({ id: 1, name: "Buddy" });
  });

  it("extracts null body", () => {
    const envelope = {
      type: "SUCCESS",
      message: "OK",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(unwrapEnvelope(envelope)).toBeNull();
  });

  it("extracts array body", () => {
    const envelope = {
      type: "SUCCESS",
      message: "OK",
      body: [1, 2, 3],
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(unwrapEnvelope<number[]>(envelope)).toEqual([1, 2, 3]);
  });

  it("roundtrips with wrapEnvelope", () => {
    const data = { id: 1, items: [1, 2] };
    expect(unwrapEnvelope(wrapEnvelope(data))).toEqual(data);
  });

  // ── FAILURE envelope ──

  it("throws ApiResponseError for non-SUCCESS type", () => {
    const envelope = {
      type: "FAILURE",
      message: "Controller not found",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: "NOT_FOUND",
      errorDetail: null,
    };

    expect(() => unwrapEnvelope(envelope)).toThrow(ApiResponseError);
    try {
      unwrapEnvelope(envelope);
    } catch (e) {
      const err = e as ApiResponseError;
      expect(err.status).toBe(400);
      expect(err.type).toBe("FAILURE");
      expect(err.errorMessage).toBe("Controller not found");
      expect(err.errorCode).toBe("NOT_FOUND");
    }
  });

  it("throws ApiResponseError with validation errorDetail", () => {
    const envelope = {
      type: "ERROR",
      message: "Validation failed",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: "VALIDATION",
      errorDetail: [{ field: "name", message: "Required" }],
    };

    expect(() => unwrapEnvelope(envelope)).toThrow(ApiResponseError);
    try {
      unwrapEnvelope(envelope);
    } catch (e) {
      const err = e as ApiResponseError;
      expect(err.errorDetail).toEqual([{ field: "name", message: "Required" }]);
    }
  });

  it("throws for failure without errorCode/errorDetail", () => {
    const envelope = {
      type: "FAILURE",
      message: "Something went wrong",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(() => unwrapEnvelope(envelope)).toThrow(ApiResponseError);
    try {
      unwrapEnvelope(envelope);
    } catch (e) {
      const err = e as ApiResponseError;
      expect(err.errorCode).toBeUndefined();
      expect(err.errorDetail).toBeUndefined();
    }
  });

  it("throws for failure with non-null body (409 conflict case)", () => {
    const envelope = {
      type: "FAILURE",
      message: "Sync execution is already running",
      body: { status: "RUNNING", startedAt: "2024-01-01T00:00:00Z" },
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(() => unwrapEnvelope(envelope)).toThrow(ApiResponseError);
    try {
      unwrapEnvelope(envelope);
    } catch (e) {
      const err = e as ApiResponseError;
      expect(err.errorMessage).toBe("Sync execution is already running");
    }
  });

  // ── Non-envelope passthrough ──

  it("passes through plain objects", () => {
    const plain = { id: 1, name: "Buddy" };
    expect(unwrapEnvelope(plain)).toEqual(plain);
  });

  it("passes through objects with only type (no body/message/timestamp)", () => {
    expect(unwrapEnvelope({ type: "DOG", breed: "Poodle" })).toEqual({ type: "DOG", breed: "Poodle" });
  });

  it("passes through objects with only body (no type/message/timestamp)", () => {
    expect(unwrapEnvelope({ body: "content", extra: 1 })).toEqual({ body: "content", extra: 1 });
  });

  it("passes through objects with type+body but missing message/timestamp", () => {
    const partial = { type: "DOG", body: "large", name: "Rex" };
    expect(unwrapEnvelope(partial)).toEqual(partial);
  });

  it("passes through primitive values", () => {
    expect(unwrapEnvelope("hello")).toBe("hello");
    expect(unwrapEnvelope(42)).toBe(42);
    expect(unwrapEnvelope(true)).toBe(true);
  });

  it("passes through null and undefined", () => {
    expect(unwrapEnvelope(null)).toBeNull();
    expect(unwrapEnvelope(undefined)).toBeUndefined();
  });

  it("passes through arrays", () => {
    expect(unwrapEnvelope([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe("envelopeSchema", () => {
  it("validates a valid envelope with object body", () => {
    const schema = envelopeSchema(z.object({ name: z.string() }));
    const data = {
      type: "SUCCESS",
      message: "OK",
      body: { name: "Buddy" },
      timestamp: "2024-01-01T00:00:00Z",
    };

    const result = schema.parse(data);
    expect(result.body.name).toBe("Buddy");
  });

  it("validates envelope with errorCode and array errorDetail", () => {
    const schema = envelopeSchema(z.null());
    const data = {
      type: "ERROR",
      message: "Validation failed",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: "VALIDATION",
      errorDetail: [{ field: "name", message: "Required" }],
    };

    const result = schema.parse(data);
    expect(result.errorCode).toBe("VALIDATION");
    expect(result.errorDetail).toEqual([{ field: "name", message: "Required" }]);
  });

  it("validates envelope with record errorDetail", () => {
    const schema = envelopeSchema(z.null());
    const data = {
      type: "ERROR",
      message: "Error",
      body: null,
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: "UNKNOWN",
      errorDetail: { reason: "something" },
    };

    const result = schema.parse(data);
    expect(result.errorDetail).toEqual({ reason: "something" });
  });

  it("allows null errorCode and errorDetail", () => {
    const schema = envelopeSchema(z.string());
    const data = {
      type: "SUCCESS",
      message: "OK",
      body: "hello",
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: null,
      errorDetail: null,
    };

    const result = schema.parse(data);
    expect(result.errorCode).toBeNull();
    expect(result.errorDetail).toBeNull();
  });

  it("allows omitted errorCode and errorDetail", () => {
    const schema = envelopeSchema(z.number());
    const data = {
      type: "SUCCESS",
      message: "OK",
      body: 42,
      timestamp: "2024-01-01T00:00:00Z",
    };

    const result = schema.parse(data);
    expect(result.errorCode).toBeUndefined();
    expect(result.errorDetail).toBeUndefined();
  });

  it("rejects invalid body", () => {
    const schema = envelopeSchema(z.object({ name: z.string() }));
    const data = {
      type: "SUCCESS",
      message: "OK",
      body: { name: 123 },
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(() => schema.parse(data)).toThrow();
  });

  it("rejects missing required fields", () => {
    const schema = envelopeSchema(z.string());
    const data = {
      type: "SUCCESS",
      body: "hello",
      timestamp: "2024-01-01T00:00:00Z",
    };

    expect(() => schema.parse(data)).toThrow();
  });
});
