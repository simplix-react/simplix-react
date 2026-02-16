import { describe, it, expect } from "vitest";

// Define build-time globals before importing the module
const TEST_FW_VERSIONS: Record<string, string> = {
  cli: "0.1.0",
  contract: "0.2.0",
  react: "0.3.0",
  form: "0.4.0",
  mock: "0.5.0",
  i18n: "0.6.0",
  testing: "0.7.0",
  meta: "1.0.0",
};

const TEST_DEP_VERSIONS: Record<string, string> = {
  zod: "^4.0.0",
  typescript: "^5.9.0",
  "@tanstack/react-query": "^5.64.0",
  "react": "^19.0.0",
};

// Inject globals that tsup normally provides at build time
(globalThis as Record<string, unknown>).__FW_VERSIONS__ = TEST_FW_VERSIONS;
(globalThis as Record<string, unknown>).__DEP_VERSIONS__ = TEST_DEP_VERSIONS;

// Import after globals are set
const { frameworkVersion, frameworkRange, depVersion, withVersions } = await import("../versions.js");

describe("frameworkVersion", () => {
  it("returns the version for a known framework package", () => {
    expect(frameworkVersion("@simplix-react/cli")).toBe("0.1.0");
    expect(frameworkVersion("@simplix-react/contract")).toBe("0.2.0");
    expect(frameworkVersion("@simplix-react/react")).toBe("0.3.0");
  });
});

describe("frameworkRange", () => {
  it("returns a caret range for a framework package", () => {
    expect(frameworkRange("@simplix-react/cli")).toBe("^0.1.0");
    expect(frameworkRange("@simplix-react/mock")).toBe("^0.5.0");
  });
});

describe("depVersion", () => {
  it("returns the version for a known dependency", () => {
    expect(depVersion("zod")).toBe("^4.0.0");
    expect(depVersion("typescript")).toBe("^5.9.0");
  });

  it("throws for an unknown dependency", () => {
    expect(() => depVersion("nonexistent-pkg")).toThrow("Unknown dependency: nonexistent-pkg");
  });
});

describe("withVersions", () => {
  it("adds fw and deps to the context object", () => {
    const ctx = { projectName: "my-app" };
    const result = withVersions(ctx);

    expect(result.projectName).toBe("my-app");
    expect(result.fw).toBeDefined();
    expect(result.deps).toBeDefined();
  });

  it("provides caret-ranged framework versions", () => {
    const result = withVersions({});

    expect(result.fw.cli).toBe("^0.1.0");
    expect(result.fw.contract).toBe("^0.2.0");
    expect(result.fw.meta).toBe("^1.0.0");
  });

  it("converts dependency package names to camelCase keys", () => {
    const result = withVersions({});

    // "@tanstack/react-query" -> "tanstackReactQuery"
    expect(result.deps.tanstackReactQuery).toBe("^5.64.0");
    // "react" -> "react"
    expect(result.deps.react).toBe("^19.0.0");
    // "zod" -> "zod"
    expect(result.deps.zod).toBe("^4.0.0");
  });

  it("preserves all original context properties", () => {
    const ctx = { name: "test", count: 42, nested: { a: 1 } };
    const result = withVersions(ctx);

    expect(result.name).toBe("test");
    expect(result.count).toBe(42);
    expect(result.nested).toEqual({ a: 1 });
  });
});
