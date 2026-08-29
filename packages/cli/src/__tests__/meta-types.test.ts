import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import type { DtoMeta, TypeRef } from "../meta/types.js";

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

describe("DtoMeta SimpliX Meta fixture", () => {
  it("has version 1", () => {
    expect(meta.version).toBe(1);
  });

  it("has 646 types, 133 enums, 694 operations", () => {
    expect(Object.keys(meta.types)).toHaveLength(646);
    expect(Object.keys(meta.enums)).toHaveLength(133);
    expect(meta.operations).toHaveLength(694);
  });

  it("gives every request body a TypeRef, never a bare type name", () => {
    const bodies = meta.operations
      .map((o) => o.request.body)
      .filter((b): b is NonNullable<typeof b> => b !== undefined);
    expect(bodies.length).toBeGreaterThan(0);
    expect(bodies.filter((b) => typeof b !== "object" || !("kind" in b))).toEqual([]);
  });

  it("keeps a collection body's element type", () => {
    // The multi-update and reorder endpoints take Set<XUpdateDTO> / List<XOrderUpdateDTO>.
    // resolve() erased the element and filed the raw collection as a DTO, so the payload
    // contract was unrepresentable and the element type never reached `types` at all.
    const order = meta.operations.find(
      (o) => o.method === "PATCH" && o.path === "/api/v1/admin/org/order",
    );
    expect(order?.request.body).toEqual({
      kind: "container",
      name: "List",
      args: [{ kind: "ref", name: "OrganizationOrderUpdateDTO" }],
    });
    expect(meta.types["OrganizationOrderUpdateDTO"]).toBeDefined();
    expect(meta.types["List"]).toBeUndefined();
    expect(meta.types["Set"]).toBeUndefined();
  });

  it("names a multipart part and types it as a file", () => {
    const upload = meta.operations.find(
      (o) => o.method === "POST" && o.path === "/api/v1/admin/user/account/{userId}/avatar",
    );
    expect(upload?.request.contentType).toBe("multipart");
    expect(upload?.request.query).toEqual([
      { name: "file", type: { kind: "file" }, required: true },
    ]);
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
