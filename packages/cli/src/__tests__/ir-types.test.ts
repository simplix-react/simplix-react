import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import type { DtoMeta, TypeRef } from "../meta/ir-types.js";

const fixturePath = fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url));

// No `as` anywhere in this file: JSON.parse returns `any`, and `any` is assignable to the
// declared return type without a cast — so this is where DtoMeta meets the real payload.
function loadFixture(): DtoMeta {
  return JSON.parse(readFileSync(fixturePath, "utf-8"));
}

const meta = loadFixture();

function collectContainerNames(type: TypeRef, seen: Set<string>): void {
  if (type.kind === "container") {
    seen.add(type.name);
    for (const arg of type.args) collectContainerNames(arg, seen);
  } else if (type.kind === "ref" && type.args) {
    for (const arg of type.args) collectContainerNames(arg, seen);
  }
}

describe("DtoMeta IR fixture", () => {
  it("has version 1", () => {
    expect(meta.version).toBe(1);
  });

  it("has 637 types, 133 enums, 694 operations", () => {
    expect(Object.keys(meta.types)).toHaveLength(637);
    expect(Object.keys(meta.enums)).toHaveLength(133);
    expect(meta.operations).toHaveLength(694);
  });

  it("gives every field a boolean required and nullable", () => {
    for (const type of Object.values(meta.types)) {
      for (const field of type.fields) {
        expect(typeof field.required).toBe("boolean");
        expect(typeof field.nullable).toBe("boolean");
      }
    }
  });

  it("gives every type an array typeParams", () => {
    for (const type of Object.values(meta.types)) {
      expect(Array.isArray(type.typeParams)).toBe(true);
    }
  });

  it("has exactly 104 types carrying extends", () => {
    const withExtends = Object.values(meta.types).filter((type) => type.extends !== undefined);
    expect(withExtends).toHaveLength(104);
  });

  it("labels more than 100 enums, every value of which carries a labelKey", () => {
    const labeled = Object.values(meta.enums).filter((enumMeta) => enumMeta.labeled);
    expect(labeled.length).toBeGreaterThan(100);

    for (const enumMeta of labeled) {
      for (const value of enumMeta.values) {
        expect(typeof value.labelKey).toBe("string");
      }
    }
  });

  it("uses only List, Map, Page, and SimpliXApiResponse as container names", () => {
    const allowed = new Set(["List", "Map", "Page", "SimpliXApiResponse"]);
    const seen = new Set<string>();

    for (const type of Object.values(meta.types)) {
      for (const field of type.fields) collectContainerNames(field.type, seen);
    }
    for (const operation of meta.operations) {
      if (operation.response) collectContainerNames(operation.response, seen);
      for (const param of operation.request.query) collectContainerNames(param.type, seen);
      for (const param of operation.request.path) collectContainerNames(param.type, seen);
    }

    expect(seen.size).toBeGreaterThan(0);
    for (const name of seen) {
      expect(allowed.has(name)).toBe(true);
    }
  });
});
