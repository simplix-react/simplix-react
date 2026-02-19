import { describe, expect, it } from "vitest";
import { cn, toTestId } from "../../utils/cn";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves conflicting tailwind classes (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, null, undefined, 0, "bar")).toBe("foo bar");
  });

  it("handles conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

describe("toTestId", () => {
  it("converts spaces to hyphens and lowercases", () => {
    expect(toTestId("First Name")).toBe("first-name");
  });

  it("returns lowercase single word as-is", () => {
    expect(toTestId("email")).toBe("email");
  });

  it("removes special characters", () => {
    expect(toTestId("Hello! World@#")).toBe("hello-world");
  });

  it("collapses multiple spaces into one hyphen", () => {
    expect(toTestId("a   b")).toBe("a-b");
  });

  it("trims leading and trailing whitespace", () => {
    expect(toTestId("  padded  ")).toBe("padded");
  });

  it("handles mixed case with numbers", () => {
    expect(toTestId("Step 2 Config")).toBe("step-2-config");
  });
});
