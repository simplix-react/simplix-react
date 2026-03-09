import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  envelopeSchema,
  unwrapEnvelope,
  wrapEnvelope,
} from "../envelope.js";

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
  it("extracts body from envelope", () => {
    const envelope = {
      type: "SUCCESS",
      message: "OK",
      body: { id: 1, name: "Buddy" },
      timestamp: "2024-01-01T00:00:00Z",
      errorCode: null,
      errorDetail: null,
    };

    const result = unwrapEnvelope<{ id: number; name: string }>(envelope);
    expect(result).toEqual({ id: 1, name: "Buddy" });
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
