import { describe, it, expect } from "vitest";
import {
  registerResponseAdapterPreset,
} from "../openapi/plugin-registry.js";
import { resolveUnwrapExpression } from "../openapi/adaptation/resolve-unwrap-expression.js";

// Register a preset for testing
registerResponseAdapterPreset("test-boot", {
  unwrapExpression: "data?.body",
});

registerResponseAdapterPreset("test-no-expression", {
  mockResponseWrapper: "wrapResponse",
});

describe("resolveUnwrapExpression", () => {
  it('returns "query.data" when adapter is undefined', () => {
    expect(resolveUnwrapExpression(undefined)).toBe("query.data");
  });

  it('returns "query.data" when adapter is "raw"', () => {
    expect(resolveUnwrapExpression("raw")).toBe("query.data");
  });

  it("resolves preset string by looking up registered preset", () => {
    const result = resolveUnwrapExpression("test-boot");
    expect(result).toBe("query.data?.body");
  });

  it('returns "query.data" for unknown preset string', () => {
    const result = resolveUnwrapExpression("nonexistent-preset");
    expect(result).toBe("query.data");
  });

  it('returns "query.data" for preset with no unwrapExpression', () => {
    const result = resolveUnwrapExpression("test-no-expression");
    expect(result).toBe("query.data");
  });

  it("resolves object config with unwrapExpression", () => {
    const result = resolveUnwrapExpression({
      unwrapExpression: "data?.result",
    });
    expect(result).toBe("query.data?.result");
  });

  it("resolves per-role unwrapByRole override", () => {
    const result = resolveUnwrapExpression(
      {
        unwrapExpression: "data?.result",
        unwrapByRole: { list: "data?.result?.items" },
      },
      "list",
    );
    expect(result).toBe("query.data?.result?.items");
  });

  it("falls back to unwrapExpression when role has no override", () => {
    const result = resolveUnwrapExpression(
      {
        unwrapExpression: "data?.result",
        unwrapByRole: { list: "data?.result?.items" },
      },
      "get",
    );
    expect(result).toBe("query.data?.result");
  });

  it("throws when object config uses deprecated unwrap function", () => {
    expect(() =>
      resolveUnwrapExpression({
        unwrap: (d) => d,
      }),
    ).toThrow("unwrap function is not supported in code generation");
  });

  it('returns "query.data" for empty object config', () => {
    const result = resolveUnwrapExpression({});
    expect(result).toBe("query.data");
  });

  it("replaces all occurrences of 'data' in expression", () => {
    const result = resolveUnwrapExpression({
      unwrapExpression: "data?.body?.data",
    });
    // "data" at word boundary → "query.data"
    expect(result).toBe("query.data?.body?.query.data");
  });
});
