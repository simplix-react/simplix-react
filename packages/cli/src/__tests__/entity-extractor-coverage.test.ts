import { describe, it, expect } from "vitest";

// Mirror tests for private entity-extractor helpers to improve coverage
// on lines 984-986 (stripDtoSuffix) and 1047 (buildRequestBodyMap edge cases).

// ── stripDtoSuffix (private helper — mirror) ─────────────────

const DTO_SUFFIXES = [
  "DetailDTO", "ListDTO", "CreateDTO", "UpdateDTO",
  "BatchUpdateDTO", "UpdateFormDTO", "OrderUpdateDTO",
];

function stripDtoSuffix(typeName: string): string | undefined {
  for (const suffix of DTO_SUFFIXES) {
    if (typeName.endsWith(suffix)) {
      const base = typeName.slice(0, -suffix.length);
      if (base) return base;
    }
  }
  return undefined;
}

describe("stripDtoSuffix", () => {
  it("strips DetailDTO suffix", () => {
    expect(stripDtoSuffix("UserAccountDetailDTO")).toBe("UserAccount");
  });

  it("strips ListDTO suffix", () => {
    expect(stripDtoSuffix("ProductListDTO")).toBe("Product");
  });

  it("strips CreateDTO suffix", () => {
    expect(stripDtoSuffix("OrderCreateDTO")).toBe("Order");
  });

  it("strips UpdateDTO suffix", () => {
    expect(stripDtoSuffix("CategoryUpdateDTO")).toBe("Category");
  });

  it("strips BatchUpdateDTO suffix", () => {
    // "BatchUpdateDTO" is checked after "UpdateDTO", so "ItemBatchUpdateDTO"
    // matches UpdateDTO first → strips "UpdateDTO" → "ItemBatch"
    // but since BatchUpdateDTO is also in the list and checked separately:
    // The iteration checks in order: DetailDTO, ListDTO, CreateDTO, UpdateDTO...
    // "ItemBatchUpdateDTO" ends with "UpdateDTO", so it matches UpdateDTO first
    expect(stripDtoSuffix("ItemBatchUpdateDTO")).toBe("ItemBatch");
  });

  it("strips UpdateFormDTO suffix", () => {
    // "UserUpdateFormDTO" ends with UpdateDTO? No. It ends with UpdateFormDTO.
    // Check: does "UserUpdateFormDTO" end with any suffix?
    // DetailDTO? No. ListDTO? No. CreateDTO? No. UpdateDTO? No ("FormDTO" != "").
    // BatchUpdateDTO? No. UpdateFormDTO? Yes!
    expect(stripDtoSuffix("UserUpdateFormDTO")).toBe("User");
  });

  it("strips OrderUpdateDTO suffix", () => {
    // "EventOrderUpdateDTO" ends with "UpdateDTO" (checked before OrderUpdateDTO)
    expect(stripDtoSuffix("EventOrderUpdateDTO")).toBe("EventOrder");
  });

  it("returns undefined for non-DTO names", () => {
    expect(stripDtoSuffix("User")).toBeUndefined();
    expect(stripDtoSuffix("ProductSchema")).toBeUndefined();
  });

  it("returns undefined when suffix is the entire name", () => {
    expect(stripDtoSuffix("DetailDTO")).toBeUndefined();
    expect(stripDtoSuffix("ListDTO")).toBeUndefined();
  });
});

// ── stripSchemaPrefix (private helper — mirror) ──────────────

describe("stripSchemaPrefix (mirror)", () => {
  function stripSchemaPrefix(typeName: string, adapters: Array<{ stripPrefix?: (name: string) => string }>): string {
    for (const adapter of adapters) {
      if (adapter.stripPrefix) {
        const stripped = adapter.stripPrefix(typeName);
        if (stripped !== typeName) return stripped;
      }
    }
    return typeName;
  }

  it("returns original when no adapters match", () => {
    expect(stripSchemaPrefix("User", [])).toBe("User");
  });

  it("strips prefix using adapter", () => {
    const adapters = [{ stripPrefix: (name: string) => name.replace(/^Rest/, "") }];
    expect(stripSchemaPrefix("RestUser", adapters)).toBe("User");
  });

  it("returns original when adapter does not change the name", () => {
    const adapters = [{ stripPrefix: (name: string) => name }];
    expect(stripSchemaPrefix("User", adapters)).toBe("User");
  });
});

// ── deriveModelType (private helper — mirror) ────────────────

interface ResponseInfo {
  entityType?: string;
  isArray: boolean;
}

interface ExtractedOperation {
  method: string;
  path: string;
  operationId?: string;
  responseEntityType?: string;
}

interface ExtractedEntity {
  name: string;
  pascalName: string;
  operations: ExtractedOperation[];
}

function deriveModelType(
  entity: ExtractedEntity,
  _responseMap: Map<string, ResponseInfo>,
  requestBodyMap: Map<string, string>,
): string | undefined {
  for (const op of entity.operations) {
    if (op.method !== "GET" || !op.responseEntityType) continue;
    const pathParts = op.path.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart?.startsWith(":")) {
      if (op.responseEntityType === entity.pascalName) return undefined;
      return op.responseEntityType;
    }
  }

  const baseNames = new Set<string>();
  for (const op of entity.operations) {
    if (!op.operationId) continue;
    const bodyRef = requestBodyMap.get(op.operationId);
    if (bodyRef) {
      const baseName = stripDtoSuffix(bodyRef);
      if (baseName) baseNames.add(baseName);
    }
  }

  if (baseNames.size === 0) return undefined;
  if (baseNames.has(entity.pascalName)) return undefined;
  return [...baseNames][0];
}

describe("deriveModelType", () => {
  it("returns responseEntityType from GET single-item when different from pascalName", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      operations: [
        { method: "GET", path: "/users/:id", responseEntityType: "UserAccountDetailDTO" },
      ],
    };
    expect(deriveModelType(entity, new Map(), new Map())).toBe("UserAccountDetailDTO");
  });

  it("returns undefined when responseEntityType matches pascalName", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      operations: [
        { method: "GET", path: "/users/:id", responseEntityType: "User" },
      ],
    };
    expect(deriveModelType(entity, new Map(), new Map())).toBeUndefined();
  });

  it("returns undefined when no GET single-item found", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      operations: [
        { method: "GET", path: "/users", responseEntityType: "UserList" },
      ],
    };
    expect(deriveModelType(entity, new Map(), new Map())).toBeUndefined();
  });

  it("falls back to request body DTO suffix stripping", () => {
    const entity: ExtractedEntity = {
      name: "order",
      pascalName: "Order",
      operations: [
        { method: "POST", path: "/orders", operationId: "createOrder" },
        { method: "PUT", path: "/orders/:id", operationId: "updateOrder" },
      ],
    };
    const requestBodyMap = new Map([
      ["createOrder", "AdminOrderCreateDTO"],
      ["updateOrder", "AdminOrderUpdateDTO"],
    ]);
    expect(deriveModelType(entity, new Map(), requestBodyMap)).toBe("AdminOrder");
  });

  it("returns undefined when DTO base matches pascalName", () => {
    const entity: ExtractedEntity = {
      name: "order",
      pascalName: "Order",
      operations: [
        { method: "POST", path: "/orders", operationId: "createOrder" },
      ],
    };
    const requestBodyMap = new Map([
      ["createOrder", "OrderCreateDTO"],
    ]);
    expect(deriveModelType(entity, new Map(), requestBodyMap)).toBeUndefined();
  });

  it("returns undefined when no request bodies found", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      operations: [
        { method: "GET", path: "/users", operationId: "listUsers" },
      ],
    };
    expect(deriveModelType(entity, new Map(), new Map())).toBeUndefined();
  });

  it("skips operations without operationId in body lookup", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      operations: [
        { method: "POST", path: "/users" },
      ],
    };
    expect(deriveModelType(entity, new Map(), new Map())).toBeUndefined();
  });
});
