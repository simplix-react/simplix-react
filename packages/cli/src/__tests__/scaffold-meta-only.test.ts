import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

import { loadMetaScaffoldSource } from "../meta/scaffold-source.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";

/** Which config the mocked loader answers with; switched per case. */
const state = vi.hoisted(() => ({ withSpec: false }));

vi.mock("../config/config-loader.js", async () => {
  const { fileURLToPath: toPath } = await import("node:url");
  const { smartSafetyDomains: domains } = await import("../meta/__fixtures__/smart-safety-domains.js");
  const snapshot = toPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url));
  return {
    loadConfig: vi.fn(async () => ({
      openapi: [{ ...(state.withSpec ? { spec: "openapi/boot.json" } : {}), profile: "meta-only-test", domains, meta: { snapshot } }],
    })),
  };
});

const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const namingModule = fileURLToPath(new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url));
const { simplixBootNaming } = (await import(namingModule)) as { simplixBootNaming: OpenApiNamingStrategy };
registerSpecProfile("meta-only-test", { naming: simplixBootNaming, responseAdapter: "raw", containerTypes });

describe("a config that names only a meta source", () => {
  it("reads every domain from SimpliX Meta without a meta.export list", async () => {
    state.withSpec = false;
    const source = await loadMetaScaffoldSource("/unused", "holiday");
    expect(source?.domain).toBe("system");
    expect(source?.fields.length ?? 0).toBeGreaterThan(0);
  });

  it("leaves a domain to the OpenAPI half where a spec is declared and nothing is exported", async () => {
    state.withSpec = true;
    expect(await loadMetaScaffoldSource("/unused", "holiday")).toBeNull();
  });
});
