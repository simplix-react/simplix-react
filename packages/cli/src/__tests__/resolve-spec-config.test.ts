import { describe, it, expect } from "vitest";
import { registerSpecProfile } from "../openapi/plugin-registry.js";
import { resolveSpecConfig } from "../openapi/orchestration/resolve-spec-config.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";

const mockNaming: OpenApiNamingStrategy = {
  resolveEntityName: () => "testEntity",
  resolveOperation: () => ({ role: "list", hookName: "useList" }),
};

// Register a profile for testing
registerSpecProfile("resolve-test-profile", {
  naming: mockNaming,
  responseAdapter: "boot",
  mutatorHint: {
    errorAdapterImport: 'import { BootError } from "@boot/error"',
    errorAdapterExpression: "BootError",
  },
  mutatorStrategy: "boot",
  dependencies: { "@boot/sdk": "^1.0.0" },
  i18nEndpoint: "/api/i18n",
});

describe("resolveSpecConfig", () => {
  it("returns defaults when no profile and no overrides", () => {
    const result = resolveSpecConfig({
      spec: "openapi.json",
      domains: { main: ["Main"] },
    });

    expect(result.naming).toBeUndefined();
    expect(result.responseAdapter).toBe("raw");
    expect(result.mutatorHint).toBeUndefined();
    expect(result.mutatorStrategy).toBeUndefined();
    expect(result.dependencies).toBeUndefined();
    expect(result.i18nEndpoint).toBeUndefined();
  });

  it("applies profile settings when profile is specified", () => {
    const result = resolveSpecConfig({
      spec: "openapi.json",
      profile: "resolve-test-profile",
      domains: { main: ["Main"] },
    });

    expect(result.naming).toBe(mockNaming);
    expect(result.responseAdapter).toBe("boot");
    expect(result.mutatorHint?.errorAdapterExpression).toBe("BootError");
    expect(result.mutatorStrategy).toBe("boot");
    expect(result.dependencies).toEqual({ "@boot/sdk": "^1.0.0" });
    expect(result.i18nEndpoint).toBe("/api/i18n");
  });

  it("config naming overrides profile naming", () => {
    const customNaming: OpenApiNamingStrategy = {
      resolveEntityName: () => "custom",
      resolveOperation: () => ({ role: "get", hookName: "useGet" }),
    };

    const result = resolveSpecConfig({
      spec: "openapi.json",
      profile: "resolve-test-profile",
      naming: customNaming,
      domains: { main: ["Main"] },
    });

    expect(result.naming).toBe(customNaming);
    // responseAdapter still from profile since not overridden
    expect(result.responseAdapter).toBe("boot");
  });

  it("config responseAdapter overrides profile responseAdapter", () => {
    const result = resolveSpecConfig({
      spec: "openapi.json",
      profile: "resolve-test-profile",
      responseAdapter: { unwrapExpression: "data?.custom" },
      domains: { main: ["Main"] },
    });

    expect(result.responseAdapter).toEqual({ unwrapExpression: "data?.custom" });
    // naming still from profile
    expect(result.naming).toBe(mockNaming);
  });

  it("returns defaults for unknown profile name", () => {
    const result = resolveSpecConfig({
      spec: "openapi.json",
      profile: "nonexistent-profile-xyz",
      domains: { main: ["Main"] },
    });

    expect(result.naming).toBeUndefined();
    expect(result.responseAdapter).toBe("raw");
  });
});
