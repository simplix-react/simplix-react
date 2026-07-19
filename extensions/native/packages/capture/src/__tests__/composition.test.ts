import { describe, expect, it } from "vitest";

import { evaluateComposition } from "../composition";

const centered = { x: 0.35, y: 0.35, width: 0.3, height: 0.3 };

describe("evaluateComposition", () => {
  it("fails with no-face when nothing is detected", () => {
    expect(evaluateComposition([])).toEqual({ ok: false, reason: "no-face" });
  });

  it("passes a centered, properly sized face", () => {
    const result = evaluateComposition([centered]);
    expect(result.ok).toBe(true);
    expect(result.face).toBe(centered);
  });

  it("fails off-center faces", () => {
    const result = evaluateComposition([{ x: 0.0, y: 0.0, width: 0.3, height: 0.3 }]);
    expect(result).toMatchObject({ ok: false, reason: "off-center" });
  });

  it("fails too-small faces", () => {
    const result = evaluateComposition([{ x: 0.46, y: 0.46, width: 0.08, height: 0.08 }]);
    expect(result).toMatchObject({ ok: false, reason: "too-small" });
  });

  it("fails too-large faces", () => {
    const result = evaluateComposition([{ x: 0.1, y: 0.1, width: 0.8, height: 0.8 }]);
    expect(result).toMatchObject({ ok: false, reason: "too-large" });
  });

  it("judges the largest face when several are detected", () => {
    const small = { x: 0.05, y: 0.05, width: 0.1, height: 0.1 };
    const result = evaluateComposition([small, centered]);
    expect(result.ok).toBe(true);
    expect(result.face).toBe(centered);
  });

  it("honors custom thresholds", () => {
    const result = evaluateComposition([centered], { minFaceRatio: 0.5 });
    expect(result).toMatchObject({ ok: false, reason: "too-small" });
  });
});
