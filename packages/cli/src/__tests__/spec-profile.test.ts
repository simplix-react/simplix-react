import { describe, it, expect } from "vitest";
import { resolveSpecConfig } from "../openapi/orchestration/resolve-spec-config.js";
import {
  registerSpecProfile,
  registerResponseAdapterPreset,
  getSpecProfile,
  getResponseAdapterPreset,
  registerPlugin,
  registerSchemaAdapter,
  getSchemaAdapters,
} from "../openapi/plugin-registry.js";
import type { SpecProfile } from "../openapi/orchestration/spec-profile.js";
import type { ResponseAdapterPreset } from "../openapi/adaptation/response-adapter.js";

// ── resolveSpecConfig ───────────────────────────────────────

describe("resolveSpecConfig", () => {
  it("returns raw adapter when no profile", () => {
    const result = resolveSpecConfig({
      spec: "api.json",
      domains: { test: ["Test"] },
    });
    expect(result.responseAdapter).toBe("raw");
    expect(result.naming).toBeUndefined();
  });

  it("uses config-level overrides over profile", () => {
    const customNaming = {
      resolveEntityName: () => "custom",
      resolveOperation: () => ({ role: "get", hookName: "getCustom" }),
    };

    const result = resolveSpecConfig({
      spec: "api.json",
      domains: { test: ["Test"] },
      naming: customNaming,
      responseAdapter: "boot",
    });
    expect(result.naming).toBe(customNaming);
    expect(result.responseAdapter).toBe("boot");
  });
});

// ── Plugin Registry ─────────────────────────────────────────

describe("plugin registry", () => {
  it("registers and retrieves spec profile", () => {
    const profile: SpecProfile = {
      naming: {
        resolveEntityName: () => "entity",
        resolveOperation: () => ({ role: "get", hookName: "getEntity" }),
      },
      responseAdapter: "raw",
    };

    registerSpecProfile("test-profile-unique", profile);
    const retrieved = getSpecProfile("test-profile-unique");
    expect(retrieved).toBe(profile);
  });

  it("registers and retrieves response adapter preset", () => {
    const preset: ResponseAdapterPreset = {
      unwrapExpression: "data?.body",
      mockResponseWrapper: "wrapBody",
    };

    registerResponseAdapterPreset("test-adapter-unique", preset);
    const retrieved = getResponseAdapterPreset("test-adapter-unique");
    expect(retrieved).toBe(preset);
  });

  it("returns undefined for unregistered profile", () => {
    expect(getSpecProfile("nonexistent-99")).toBeUndefined();
  });

  it("returns undefined for unregistered preset", () => {
    expect(getResponseAdapterPreset("nonexistent-99")).toBeUndefined();
  });

  it("registerPlugin registers both specs and adapters", () => {
    const profile: SpecProfile = {
      naming: {
        resolveEntityName: () => "entity",
        resolveOperation: () => ({ role: "get", hookName: "getEntity" }),
      },
      responseAdapter: "raw",
    };

    const preset: ResponseAdapterPreset = {
      unwrapExpression: "data?.result",
    };

    registerPlugin({
      id: "test-plugin-unique",
      specs: { "plugin-profile-unique": profile },
      responseAdapters: { "plugin-adapter-unique": preset },
    });

    expect(getSpecProfile("plugin-profile-unique")).toBe(profile);
    expect(getResponseAdapterPreset("plugin-adapter-unique")).toBe(preset);
  });

  it("registerSchemaAdapter adds adapter to list", () => {
    const adapter = {
      id: "test-schema-adapter-unique",
      canUnwrap: (schema: Record<string, unknown>) => !!schema["x-test"],
      unwrap: (schema: Record<string, unknown>) => schema["x-test"] as Record<string, unknown>,
    };

    const initialLength = getSchemaAdapters().length;
    registerSchemaAdapter(adapter);
    expect(getSchemaAdapters().length).toBe(initialLength + 1);
    expect(getSchemaAdapters().some((a) => a.id === "test-schema-adapter-unique")).toBe(true);
  });
});
