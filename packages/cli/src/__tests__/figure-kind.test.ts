import { describe, expect, it } from "vitest";

import { contractKindOf, type FieldInfo } from "../commands/scaffold-crud.js";
import { figureKindOf } from "../meta/scaffold-source.js";

describe("figureKindOf", () => {
  it("names a number's figure format", () => {
    expect(figureKindOf("credits", "number")).toBe("credits");
    expect(figureKindOf("bytes", "number")).toBe("bytes");
    expect(figureKindOf("duration", "number")).toBe("duration");
  });
  it("names a text's excerpt format", () => {
    expect(figureKindOf("excerpt", "string")).toBe("excerpt");
  });
  it("leaves a format the type cannot carry, and any other format, to the type", () => {
    expect(figureKindOf("bytes", "string")).toBeUndefined();
    expect(figureKindOf("excerpt", "number")).toBeUndefined();
    expect(figureKindOf("money", "number")).toBeUndefined();
    expect(figureKindOf(undefined, "number")).toBeUndefined();
  });
});

describe("contractKindOf for a figure", () => {
  it("draws a figure by its kind rather than as a number", () => {
    expect(contractKindOf({ name: "sizeBytes", tsType: "number", figureKind: "bytes", options: [] } as unknown as FieldInfo)).toBe("bytes");
    expect(contractKindOf({ name: "sizeBytes", tsType: "number", options: [] } as unknown as FieldInfo)).toBe("number");
  });
});

describe("figureKindOf for a ledger amount", () => {
  it("draws signedCredits as credits, on a number only", () => {
    expect(figureKindOf("signedCredits", "number")).toBe("credits");
    expect(figureKindOf("signedCredits", "string")).toBeUndefined();
  });
});
