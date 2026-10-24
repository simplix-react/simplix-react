import { describe, expect, it } from "vitest";
import { arrowStep, overflowEdges } from "../base/navigation/tab-overflow";

describe("overflowEdges", () => {
  it("reports no overflow when everything fits", () => {
    expect(overflowEdges(0, 600, 600)).toEqual({ start: false, end: false });
  });
  it("reports the end when the strip starts at its beginning and runs past the view", () => {
    expect(overflowEdges(0, 600, 900)).toEqual({ start: false, end: true });
  });
  it("reports both ends in the middle", () => {
    expect(overflowEdges(120, 600, 900)).toEqual({ start: true, end: true });
  });
  it("reports only the start at the far end", () => {
    expect(overflowEdges(300, 600, 900)).toEqual({ start: true, end: false });
  });
  it("ignores sub-pixel scroll positions", () => {
    expect(overflowEdges(0.5, 600, 900.6)).toEqual({ start: false, end: true });
    expect(overflowEdges(299.5, 600, 900)).toEqual({ start: true, end: false });
  });
});

describe("arrowStep", () => {
  it("moves most of a view and never less than one tab", () => {
    expect(arrowStep(600)).toBe(480);
    expect(arrowStep(40)).toBe(48);
  });
});
