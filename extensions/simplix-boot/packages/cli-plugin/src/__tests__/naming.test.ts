import { describe, expect, it } from "vitest";

import { simplixBootNaming } from "../naming.js";

describe("simplixBootNaming", () => {
  const baseEntityCtx = {
    paths: [] as string[],
    operations: [] as Array<{ operationId: string; method: string; path: string }>,
    schemaNames: [] as string[],
    extensions: {} as Record<string, unknown>,
  };

  describe("resolveEntityName", () => {
    it("extracts entity name from Boot tag convention (scope.crud.Entity)", () => {
      const result = simplixBootNaming.resolveEntityName({
        ...baseEntityCtx,
        tag: "admin.crud.AccessPoint",
      });
      expect(result).toBe("accessPoint");
    });

    it("extracts entity name from two-segment tag (scope.Entity)", () => {
      const result = simplixBootNaming.resolveEntityName({
        ...baseEntityCtx,
        tag: "admin.Pet",
      });
      expect(result).toBe("pet");
    });

    it("handles single-segment tag", () => {
      const result = simplixBootNaming.resolveEntityName({
        ...baseEntityCtx,
        tag: "Order",
      });
      expect(result).toBe("order");
    });

    it("returns empty string when tag is undefined", () => {
      const result = simplixBootNaming.resolveEntityName({ ...baseEntityCtx });
      expect(result).toBe("");
    });
  });

  describe("resolveOperation", () => {
    const baseContext = {
      operationId: "search_1",
      entityName: "pet",
      pathParams: [] as string[],
      queryParams: [] as string[],
      extensions: {} as Record<string, unknown>,
    };

    // --- GET patterns ---

    it("resolves GET /search as list", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet/search",
        pathParams: [],
      });
      expect(result).toEqual({ role: "list", hookName: "listPets" });
    });

    it("resolves GET /{id} as get", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet/{id}",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "get", hookName: "getPet" });
    });

    it("resolves GET /{id}/edit as getForEdit", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet/{id}/edit",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "getForEdit", hookName: "getPetForEdit" });
    });

    it("resolves GET /tree as tree", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet/tree",
        pathParams: [],
      });
      expect(result).toEqual({ role: "tree", hookName: "getPetTree" });
    });

    it("resolves GET /tree/{id} as subtree", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet/tree/{id}",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "subtree", hookName: "getPetSubtree" });
    });

    it("resolves GET with no path param as getAll", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "get",
        path: "/api/v1/pet",
        pathParams: [],
      });
      expect(result).toEqual({ role: "getAll", hookName: "getAllPets" });
    });

    // --- POST patterns ---

    it("resolves POST /create as create", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "post",
        path: "/api/v1/pet/create",
        pathParams: [],
      });
      expect(result).toEqual({ role: "create", hookName: "createPet" });
    });

    it("resolves POST /search as search", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "post",
        path: "/api/v1/pet/search",
        pathParams: [],
      });
      expect(result).toEqual({ role: "search", hookName: "searchPets" });
    });

    it("resolves POST /{id}/unpair as custom action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "accessPoint",
        method: "post",
        path: "/api/v1/access-point/{id}/unpair",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "unpair", hookName: "unpairAccessPoint" });
    });

    it("resolves POST /{id}/pair/{targetId} as custom action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "accessPoint",
        method: "post",
        path: "/api/v1/access-point/{id}/pair/{targetId}",
        pathParams: ["id", "targetId"],
      });
      expect(result).toEqual({ role: "pair", hookName: "pairAccessPoint" });
    });

    it("resolves POST fallback as create", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "post",
        path: "/api/v1/pet",
        pathParams: [],
      });
      expect(result).toEqual({ role: "create", hookName: "createPet" });
    });

    // --- PUT patterns ---

    it("resolves PUT as update", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "put",
        path: "/api/v1/pet/{id}",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "update", hookName: "updatePet" });
    });

    it("resolves PUT /{id}/zones as custom updateZones action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "floor",
        method: "put",
        path: "/api/v1/floor/{id}/zones",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "updateZones", hookName: "updateZonesFloor" });
    });

    it("resolves PUT /{id}/placements as custom updatePlacements action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "floor",
        method: "put",
        path: "/api/v1/floor/{id}/placements",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "updatePlacements", hookName: "updatePlacementsFloor" });
    });

    // --- DELETE patterns ---

    it("resolves DELETE /{id} as delete", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "delete",
        path: "/api/v1/pet/{id}",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "delete", hookName: "deletePet" });
    });

    it("resolves DELETE /batch as batchDelete", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "delete",
        path: "/api/v1/pet/batch",
        pathParams: [],
      });
      expect(result).toEqual({ role: "batchDelete", hookName: "batchDeletePets" });
    });

    it("resolves DELETE sub-resource /entity/{id}/groups/{groupId}", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "user",
        method: "delete",
        path: "/api/v1/user/{id}/groups/{groupId}",
        pathParams: ["id", "groupId"],
      });
      expect(result).toEqual({ role: "deleteGroups", hookName: "deleteGroupsUser" });
    });

    // --- PATCH patterns ---

    it("resolves PATCH /batch as batchUpdate", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "patch",
        path: "/api/v1/pet/batch",
        pathParams: [],
      });
      expect(result).toEqual({ role: "batchUpdate", hookName: "batchUpdatePets" });
    });

    it("resolves PATCH with custom suffix as custom action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "floor",
        method: "patch",
        path: "/api/v1/floor/order",
        pathParams: [],
      });
      expect(result).toEqual({ role: "order", hookName: "orderFloor" });
    });

    it("resolves PATCH /{id}/password as custom action", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "floor",
        method: "patch",
        path: "/api/v1/floor/{id}/password",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "password", hookName: "passwordFloor" });
    });

    it("resolves PATCH /entity (no param) as multiUpdate", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "patch",
        path: "/api/v1/pet",
        pathParams: [],
      });
      expect(result).toEqual({ role: "multiUpdate", hookName: "multiUpdatePets" });
    });

    it("resolves PATCH /{id} as update", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        method: "patch",
        path: "/api/v1/pet/{id}",
        pathParams: ["id"],
      });
      expect(result).toEqual({ role: "update", hookName: "updatePet" });
    });

    // --- GET subpath with mismatched entity name (tag qualifier suffix) ---

    it("resolves GET /policy/summary when entity is policyOverview", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "policyOverview",
        method: "get",
        path: "/api/v1/policy/summary",
        pathParams: [],
      });
      expect(result).toEqual({ role: "summary", hookName: "getPolicyOverviewSummary" });
    });

    it("resolves GET /policy/health when entity is policyOverview", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "policyOverview",
        method: "get",
        path: "/api/v1/policy/health",
        pathParams: [],
      });
      expect(result).toEqual({ role: "health", hookName: "getPolicyOverviewHealth" });
    });

    it("resolves GET /policy/recent-activity when entity is policyOverview", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "policyOverview",
        method: "get",
        path: "/api/v1/policy/recent-activity",
        pathParams: [],
      });
      expect(result).toEqual({ role: "recentActivity", hookName: "getPolicyOverviewRecentActivity" });
    });

    it("resolves GET /policy/relationships when entity is policyOverview", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        entityName: "policyOverview",
        method: "get",
        path: "/api/v1/policy/relationships",
        pathParams: [],
      });
      expect(result).toEqual({ role: "relationships", hookName: "getPolicyOverviewRelationships" });
    });

    // --- Fallback ---

    it("falls back to operationId for unknown methods", () => {
      const result = simplixBootNaming.resolveOperation({
        ...baseContext,
        operationId: "customOp",
        method: "options",
        path: "/api/v1/pet",
        pathParams: [],
      });
      expect(result).toEqual({ role: "customOp", hookName: "customOp" });
    });
  });
});
