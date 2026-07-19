import { describe, expect, it } from "vitest";

import { strokeToPath } from "../stroke-path";

describe("strokeToPath", () => {
  it("returns empty for no points", () => {
    expect(strokeToPath([])).toBe("");
  });

  it("renders a tap as a dot segment", () => {
    expect(strokeToPath([{ x: 10, y: 20 }])).toBe("M10 20l0.1 0.1");
  });

  it("smooths multi-point strokes with quadratic midpoint segments", () => {
    const d = strokeToPath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ]);
    expect(d.startsWith("M0 0")).toBe(true);
    expect(d).toContain("Q10 0 15 5");
    expect(d.endsWith("L20 10")).toBe(true);
  });
});
