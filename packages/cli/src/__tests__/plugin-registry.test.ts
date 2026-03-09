import { describe, it, expect, beforeEach } from "vitest";
import {
  registerSpecProfile,
  getSpecProfile,
  registerResponseAdapterPreset,
  getResponseAdapterPreset,
  registerSchemaAdapter,
  getSchemaAdapters,
  registerPlugin,
} from "../openapi/plugin-registry.js";
import type { SpecProfile } from "../openapi/orchestration/spec-profile.js";
import type { ResponseAdapterPreset } from "../openapi/adaptation/response-adapter.js";
import type { SchemaAdapter, CliPlugin } from "../openapi/plugin-registry.js";

// The plugin registry uses globalThis, so entries persist across tests.
// We use unique names per test to avoid collisions.

describe("registerSpecProfile / getSpecProfile", () => {
  it("registers and retrieves a spec profile by name", () => {
    const profile: SpecProfile = {
      naming: {
        resolveEntityName: () => "test",
        resolveOperation: () => ({ role: "list", hookName: "useList" }),
      },
      responseAdapter: "raw",
    };

    registerSpecProfile("test-profile-1", profile);
    const result = getSpecProfile("test-profile-1");

    expect(result).toBe(profile);
  });

  it("returns undefined for unregistered profile", () => {
    expect(getSpecProfile("nonexistent-profile")).toBeUndefined();
  });

  it("overwrites an existing profile with the same name", () => {
    const profile1: SpecProfile = {
      naming: {
        resolveEntityName: () => "first",
        resolveOperation: () => ({ role: "list", hookName: "useList" }),
      },
      responseAdapter: "raw",
    };
    const profile2: SpecProfile = {
      naming: {
        resolveEntityName: () => "second",
        resolveOperation: () => ({ role: "get", hookName: "useGet" }),
      },
      responseAdapter: "boot",
    };

    registerSpecProfile("overwrite-test", profile1);
    registerSpecProfile("overwrite-test", profile2);

    const result = getSpecProfile("overwrite-test");
    expect(result).toBe(profile2);
    expect(result?.naming.resolveEntityName({
      paths: [],
      operations: [],
      schemaNames: [],
      extensions: {},
    })).toBe("second");
  });
});

describe("registerResponseAdapterPreset / getResponseAdapterPreset", () => {
  it("registers and retrieves a response adapter preset", () => {
    const preset: ResponseAdapterPreset = {
      unwrapExpression: "data?.body",
      mockResponseWrapper: "wrapBootResponse",
      mockResponseWrapperImport: 'import { wrapBootResponse } from "./helpers"',
    };

    registerResponseAdapterPreset("test-preset-1", preset);
    const result = getResponseAdapterPreset("test-preset-1");

    expect(result).toBe(preset);
    expect(result?.unwrapExpression).toBe("data?.body");
    expect(result?.mockResponseWrapper).toBe("wrapBootResponse");
  });

  it("returns undefined for unregistered preset", () => {
    expect(getResponseAdapterPreset("nonexistent-preset")).toBeUndefined();
  });
});

describe("registerSchemaAdapter / getSchemaAdapters", () => {
  it("registers a schema adapter and retrieves all adapters", () => {
    const adapter: SchemaAdapter = {
      id: "test-adapter-1",
      canUnwrap: (schema) => !!schema["x-test"],
      unwrap: (schema) => schema["x-test"] as Record<string, unknown>,
    };

    const beforeCount = getSchemaAdapters().length;
    registerSchemaAdapter(adapter);
    const adapters = getSchemaAdapters();

    expect(adapters.length).toBe(beforeCount + 1);
    expect(adapters[adapters.length - 1]).toBe(adapter);
  });

  it("maintains registration order", () => {
    const adapterA: SchemaAdapter = {
      id: "order-test-a",
      canUnwrap: () => false,
      unwrap: (s) => s,
    };
    const adapterB: SchemaAdapter = {
      id: "order-test-b",
      canUnwrap: () => false,
      unwrap: (s) => s,
    };

    registerSchemaAdapter(adapterA);
    registerSchemaAdapter(adapterB);

    const adapters = getSchemaAdapters();
    const ids = adapters.map((a) => a.id);
    const indexA = ids.indexOf("order-test-a");
    const indexB = ids.indexOf("order-test-b");

    expect(indexA).toBeLessThan(indexB);
  });

  it("adapter canUnwrap and unwrap work correctly", () => {
    const adapter: SchemaAdapter = {
      id: "functional-test",
      canUnwrap: (schema) => !!schema._embedded,
      unwrap: (schema) => schema._embedded as Record<string, unknown>,
      stripPrefix: (name) => name.replace(/^Hateoas/, ""),
    };

    expect(adapter.canUnwrap({ _embedded: { items: [] } })).toBe(true);
    expect(adapter.canUnwrap({ data: [] })).toBe(false);
    expect(adapter.unwrap({ _embedded: { id: 1 } })).toEqual({ id: 1 });
    expect(adapter.stripPrefix!("HateoasUser")).toBe("User");
    expect(adapter.stripPrefix!("RegularUser")).toBe("RegularUser");
  });
});

describe("registerPlugin", () => {
  it("registers all spec profiles and response adapters from a plugin", () => {
    const plugin: CliPlugin = {
      id: "test-plugin-1",
      specs: {
        "plugin-spec-1": {
          naming: {
            resolveEntityName: () => "pluginEntity",
            resolveOperation: () => ({ role: "list", hookName: "useList" }),
          },
          responseAdapter: "boot",
        },
      },
      responseAdapters: {
        "plugin-adapter-1": {
          unwrapExpression: "data?.result",
          mockResponseWrapper: "wrapResult",
        },
      },
    };

    registerPlugin(plugin);

    const spec = getSpecProfile("plugin-spec-1");
    expect(spec).toBeDefined();
    expect(spec?.naming.resolveEntityName({
      paths: [],
      operations: [],
      schemaNames: [],
      extensions: {},
    })).toBe("pluginEntity");

    const adapter = getResponseAdapterPreset("plugin-adapter-1");
    expect(adapter).toBeDefined();
    expect(adapter?.unwrapExpression).toBe("data?.result");
  });

  it("handles plugin with no specs", () => {
    const plugin: CliPlugin = {
      id: "no-specs-plugin",
      responseAdapters: {
        "no-specs-adapter": { unwrapExpression: "data?.value" },
      },
    };

    // Should not throw
    registerPlugin(plugin);

    expect(getResponseAdapterPreset("no-specs-adapter")).toBeDefined();
  });

  it("handles plugin with no response adapters", () => {
    const plugin: CliPlugin = {
      id: "no-adapters-plugin",
      specs: {
        "no-adapters-spec": {
          naming: {
            resolveEntityName: () => "noAdapter",
            resolveOperation: () => ({ role: "get", hookName: "useGet" }),
          },
          responseAdapter: "raw",
        },
      },
    };

    registerPlugin(plugin);

    expect(getSpecProfile("no-adapters-spec")).toBeDefined();
  });

  it("handles empty plugin", () => {
    const plugin: CliPlugin = { id: "empty-plugin" };

    // Should not throw
    registerPlugin(plugin);
  });
});
