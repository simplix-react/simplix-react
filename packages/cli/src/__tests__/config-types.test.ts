import { describe, it, expect } from "vitest";
import { findSpecForDomain, findSpecBySource } from "../config/types.js";
import { defineConfig } from "../config/define-config.js";
import { defineCrudMap } from "../config/define-crud-map.js";
import type { OpenAPISpecConfig, SimplixConfig, CrudMap } from "../config/types.js";

const specs: OpenAPISpecConfig[] = [
  {
    spec: "openapi/main.json",
    domains: { project: ["Projects"], auth: ["Auth"] },
  },
  {
    spec: "openapi/billing.json",
    domains: { billing: ["Billing", "Invoices"] },
  },
  {
    spec: "https://api.example.com/openapi.json",
    domains: { external: ["External"] },
  },
];

describe("findSpecForDomain", () => {
  it("finds the spec containing the given domain", () => {
    const result = findSpecForDomain(specs, "project");
    expect(result?.spec).toBe("openapi/main.json");
  });

  it("finds the spec for a different domain in the same spec", () => {
    const result = findSpecForDomain(specs, "auth");
    expect(result?.spec).toBe("openapi/main.json");
  });

  it("finds the spec for billing domain", () => {
    const result = findSpecForDomain(specs, "billing");
    expect(result?.spec).toBe("openapi/billing.json");
  });

  it("returns undefined when domain is not found", () => {
    const result = findSpecForDomain(specs, "nonexistent");
    expect(result).toBeUndefined();
  });

  it("returns undefined when specs is undefined", () => {
    const result = findSpecForDomain(undefined, "project");
    expect(result).toBeUndefined();
  });
});

describe("findSpecBySource", () => {
  it("finds spec by matching file path", () => {
    const result = findSpecBySource(specs, "openapi/main.json", "/root");
    expect(result?.domains).toHaveProperty("project");
  });

  it("finds spec by resolved absolute path", () => {
    const result = findSpecBySource(specs, "./openapi/main.json", "/root");
    // resolve("/root", "openapi/main.json") === resolve("/root", "./openapi/main.json")
    expect(result?.domains).toHaveProperty("project");
  });

  it("finds spec by matching URL source", () => {
    const result = findSpecBySource(
      specs,
      "https://api.example.com/openapi.json",
      "/root",
    );
    expect(result?.domains).toHaveProperty("external");
  });

  it("returns undefined when source does not match", () => {
    const result = findSpecBySource(specs, "openapi/other.json", "/root");
    expect(result).toBeUndefined();
  });

  it("returns undefined when specs is undefined", () => {
    const result = findSpecBySource(undefined, "openapi/main.json", "/root");
    expect(result).toBeUndefined();
  });
});

describe("defineConfig", () => {
  it("returns the same config object", () => {
    const config: SimplixConfig = {
      api: { baseUrl: "/api/v1" },
      packages: { prefix: "myapp" },
    };

    const result = defineConfig(config);
    expect(result).toBe(config);
  });

  it("preserves all config fields", () => {
    const config: SimplixConfig = {
      api: { baseUrl: "/api" },
      packages: { prefix: "test" },
      codegen: { header: true },
      i18n: { locales: ["en", "ko"], defaultLocale: "en" },
    };

    const result = defineConfig(config);
    expect(result.api?.baseUrl).toBe("/api");
    expect(result.packages?.prefix).toBe("test");
    expect(result.codegen?.header).toBe(true);
    expect(result.i18n?.locales).toEqual(["en", "ko"]);
  });
});

describe("defineCrudMap", () => {
  it("returns the same map object", () => {
    const map: CrudMap = {
      pet: {
        list: "findPetsByStatus",
        get: "getPetById",
        create: "addPet",
        update: "updatePet",
        delete: "deletePet",
      },
    };

    const result = defineCrudMap(map);
    expect(result).toBe(map);
  });

  it("preserves entity mappings", () => {
    const map: CrudMap = {
      user: { list: "listUsers", get: "getUser" },
      product: { create: "createProduct", delete: "deleteProduct" },
    };

    const result = defineCrudMap(map);
    expect(result.user.list).toBe("listUsers");
    expect(result.product.create).toBe("createProduct");
  });
});
