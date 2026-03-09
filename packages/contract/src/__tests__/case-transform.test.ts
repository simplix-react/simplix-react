import { describe, it, expect } from "vitest";
import { camelToSnake } from "../helpers/case-transform.js";

describe("camelToSnake", () => {
  it("converts camelCase", () => {
    expect(camelToSnake("doorReader")).toBe("door_reader");
  });

  it("converts multi-word camelCase", () => {
    expect(camelToSnake("myEntityName")).toBe("my_entity_name");
  });

  it("handles single word", () => {
    expect(camelToSnake("door")).toBe("door");
  });

  it("handles empty string", () => {
    expect(camelToSnake("")).toBe("");
  });

  it("passes through already snake_case", () => {
    expect(camelToSnake("door_reader")).toBe("door_reader");
  });

  it("converts hyphenated strings", () => {
    expect(camelToSnake("some-field")).toBe("some_field");
  });

  it("converts space-separated strings", () => {
    expect(camelToSnake("some field")).toBe("some_field");
  });

  it("handles consecutive uppercase (acronyms)", () => {
    // regex only splits on [a-z0-9][A-Z] boundaries, so "JSON" stays grouped
    expect(camelToSnake("parseJSON")).toBe("parse_json");
  });

  it("lowercases all-uppercase input", () => {
    // no [a-z0-9][A-Z] boundary exists, so just lowercased
    expect(camelToSnake("ABC")).toBe("abc");
  });

  it("handles mixed hyphens and camelCase", () => {
    expect(camelToSnake("my-entityName")).toBe("my_entity_name");
  });

  it("handles numbers adjacent to letters", () => {
    expect(camelToSnake("field2Value")).toBe("field2_value");
  });
});
