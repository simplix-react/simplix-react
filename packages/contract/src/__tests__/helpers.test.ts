import { describe, it, expect } from "vitest";
import { buildPath } from "../helpers/path-builder.js";
import { camelToKebab, camelToSnake } from "../helpers/case-transform.js";
import { simpleQueryBuilder } from "../helpers/query-builders.js";
import type { ListParams } from "../helpers/query-types.js";

describe("buildPath", () => {
  it("substitutes single param", () => {
    expect(buildPath("/topologies/:topologyId/controllers", { topologyId: "abc" }))
      .toBe("/topologies/abc/controllers");
  });

  it("substitutes multiple params", () => {
    expect(buildPath("/a/:x/b/:y", { x: "1", y: "2" }))
      .toBe("/a/1/b/2");
  });

  it("encodes special characters", () => {
    expect(buildPath("/:id", { id: "hello world" }))
      .toBe("/hello%20world");
  });

  it("returns template unchanged when no params", () => {
    expect(buildPath("/items")).toBe("/items");
  });
});

describe("camelToKebab", () => {
  it("converts camelCase to kebab-case", () => {
    expect(camelToKebab("doorReader")).toBe("door-reader");
  });

  it("handles single word", () => {
    expect(camelToKebab("door")).toBe("door");
  });

  it("handles multiple uppercase transitions", () => {
    expect(camelToKebab("accessPointController")).toBe("access-point-controller");
  });
});

describe("camelToSnake", () => {
  it("converts camelCase to snake_case", () => {
    expect(camelToSnake("doorReader")).toBe("door_reader");
  });

  it("handles single word", () => {
    expect(camelToSnake("door")).toBe("door");
  });
});

describe("simpleQueryBuilder", () => {
  it("serializes filters", () => {
    const params: ListParams = {
      filters: { status: "pending", type: "door" },
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("status")).toBe("pending");
    expect(sp.get("type")).toBe("door");
  });

  it("serializes sort", () => {
    const params: ListParams = {
      sort: { field: "createdAt", direction: "desc" },
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("sort")).toBe("createdAt:desc");
  });

  it("serializes multiple sorts", () => {
    const params: ListParams = {
      sort: [
        { field: "name", direction: "asc" },
        { field: "createdAt", direction: "desc" },
      ],
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("sort")).toBe("name:asc,createdAt:desc");
  });

  it("serializes offset pagination", () => {
    const params: ListParams = {
      pagination: { type: "offset", page: 2, limit: 10 },
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("page")).toBe("2");
    expect(sp.get("limit")).toBe("10");
  });

  it("serializes cursor pagination", () => {
    const params: ListParams = {
      pagination: { type: "cursor", cursor: "abc123", limit: 20 },
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("cursor")).toBe("abc123");
    expect(sp.get("limit")).toBe("20");
  });

  it("ignores undefined/null filter values", () => {
    const params: ListParams = {
      filters: { status: "active", type: undefined as unknown as string },
    };
    const sp = simpleQueryBuilder.buildSearchParams(params);
    expect(sp.get("status")).toBe("active");
    expect(sp.has("type")).toBe(false);
  });

  it("returns empty URLSearchParams when no params", () => {
    const sp = simpleQueryBuilder.buildSearchParams({});
    expect(sp.toString()).toBe("");
  });
});
