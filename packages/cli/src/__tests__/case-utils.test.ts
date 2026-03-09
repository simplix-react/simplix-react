import { describe, it, expect } from "vitest";
import { toPascalCase, toCamelCase, toKebabCase } from "../utils/case.js";

describe("toPascalCase", () => {
  it("converts kebab-case to PascalCase", () => {
    expect(toPascalCase("my-component")).toBe("MyComponent");
  });

  it("converts snake_case to PascalCase", () => {
    expect(toPascalCase("my_component")).toBe("MyComponent");
  });

  it("converts space-separated to PascalCase", () => {
    expect(toPascalCase("my component")).toBe("MyComponent");
  });

  it("converts camelCase to PascalCase (splits on camelCase boundary)", () => {
    // "myComponent" → insert dash "my-Component" → split → ["my", "Component"]
    // → capitalize first, lowercase rest → "My" + "Component" → "MyComponent"
    expect(toPascalCase("myComponent")).toBe("MyComponent");
  });

  it("handles single word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });

  it("handles already PascalCase", () => {
    // "MyComponent" → insert dash "My-Component" → split → ["My", "Component"]
    // → capitalize first char, lowercase rest → "My" + "Component" → "MyComponent"
    expect(toPascalCase("MyComponent")).toBe("MyComponent");
  });

  it("handles empty string", () => {
    expect(toPascalCase("")).toBe("");
  });
});

describe("toCamelCase", () => {
  it("converts kebab-case to camelCase", () => {
    expect(toCamelCase("my-component")).toBe("myComponent");
  });

  it("converts snake_case to camelCase", () => {
    expect(toCamelCase("my_component")).toBe("myComponent");
  });

  it("converts space-separated to camelCase", () => {
    expect(toCamelCase("my component")).toBe("myComponent");
  });

  it("handles single word", () => {
    expect(toCamelCase("hello")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(toCamelCase("")).toBe("");
  });
});

describe("toKebabCase", () => {
  it("converts camelCase to kebab-case", () => {
    expect(toKebabCase("myComponent")).toBe("my-component");
  });

  it("converts PascalCase to kebab-case", () => {
    expect(toKebabCase("MyComponent")).toBe("my-component");
  });

  it("converts snake_case to kebab-case", () => {
    expect(toKebabCase("my_component")).toBe("my-component");
  });

  it("converts space-separated to kebab-case", () => {
    expect(toKebabCase("my component")).toBe("my-component");
  });

  it("handles single word", () => {
    expect(toKebabCase("hello")).toBe("hello");
  });

  it("handles already kebab-case", () => {
    expect(toKebabCase("my-component")).toBe("my-component");
  });

  it("handles empty string", () => {
    expect(toKebabCase("")).toBe("");
  });
});
