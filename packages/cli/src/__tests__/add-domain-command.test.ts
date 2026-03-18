import { describe, it, expect } from "vitest";
import { renderTemplate } from "../utils/template.js";
import {
  domainPackageJson,
  domainTsupConfig,
  domainTsconfigJson,
  domainIndexTs,
  domainSchemasTs,
  domainContractTs,
  domainHooksTs,
  domainMockIndexTs,
  domainMockHandlersTs,
  domainMockSeedTs,
  domainTranslationsTs,
} from "../templates/domain/index.js";
import { generateDomainMutatorContent } from "../openapi/orchestration/orval-runner.js";

function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    domainName: "product",
    domainPkgName: "@test/test-domain-product",
    projectName: "test",
    scope: "@test",
    enableI18n: true,
    enableOrval: false,
    locales: ["en", "ko"],
    apiBasePath: "/api/product",
    entities: [
      { entityName: "product", EntityPascal: "Product" },
    ],
    PascalName: "Product",
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0", form: "0.4.0", mock: "0.5.0", i18n: "0.6.0", testing: "0.7.0", ui: "0.8.0", api: "0.9.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
    ...overrides,
  };
}

describe("add-domain templates (non-OpenAPI mode)", () => {
  it("renders domain package.json", () => {
    const result = renderTemplate(domainPackageJson, makeCtx());
    expect(result).toContain("@test/test-domain-product");
    expect(result).toContain('"type": "module"');
  });

  it("renders domain tsup.config", () => {
    expect(domainTsupConfig).toContain("tsup");
  });

  it("renders domain tsconfig.json", () => {
    const result = renderTemplate(domainTsconfigJson, makeCtx());
    expect(result).toContain("compilerOptions");
  });

  it("renders domain index.ts with i18n export", () => {
    const result = renderTemplate(domainIndexTs, makeCtx({ enableI18n: true, enableOrval: false }));
    expect(result).toContain("translations");
  });

  it("renders domain index.ts without i18n export", () => {
    const result = renderTemplate(domainIndexTs, makeCtx({ enableI18n: false, enableOrval: false }));
    expect(result).not.toContain("translations");
  });

  it("renders domain index.ts with orval exports", () => {
    const result = renderTemplate(domainIndexTs, makeCtx({ enableOrval: true }));
    expect(result).toContain("hooks");
    expect(result).toContain("generated/model");
  });

  it("renders schemas.ts template", () => {
    const result = renderTemplate(domainSchemasTs, makeCtx());
    expect(result).toContain("z.object");
    expect(result).toContain("productSchema");
  });

  it("renders contract.ts template", () => {
    const result = renderTemplate(domainContractTs, makeCtx());
    expect(result).toContain("product");
  });

  it("renders hooks.ts template", () => {
    const result = renderTemplate(domainHooksTs, makeCtx());
    expect(result).toContain("productHooks");
    expect(result).toContain("deriveEntityHooks");
  });

  it("renders mock/index.ts template", () => {
    const result = renderTemplate(domainMockIndexTs, makeCtx());
    expect(result).toContain("mock");
  });

  it("renders mock/handlers.ts template", () => {
    const result = renderTemplate(domainMockHandlersTs, makeCtx());
    expect(result).toContain("http");
  });

  it("renders mock/seed.ts template", () => {
    const result = renderTemplate(domainMockSeedTs, makeCtx());
    expect(result).toContain("product");
  });

  it("renders translations.ts template", () => {
    const result = renderTemplate(domainTranslationsTs, makeCtx());
    expect(result).toContain("i18n");
  });
});

describe("add-domain templates (OpenAPI mode)", () => {
  it("generates mutator content for domain", () => {
    const content = generateDomainMutatorContent("product");
    expect(content).toContain("customFetch");
    expect(content).toContain("getMutator()");
  });

  it("generates mutator content with strategy", () => {
    const content = generateDomainMutatorContent("product", "boot");
    expect(content).toContain('getMutator("boot")');
  });
});

describe("add-domain scope extraction logic", () => {
  it("extracts scope from scoped package name", () => {
    const pkgName = "@mycompany/myproject-monorepo";
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";
    expect(scope).toBe("@mycompany");
  });

  it("returns empty scope for unscoped package", () => {
    const pkgName = "myproject-monorepo";
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";
    expect(scope).toBe("");
  });

  it("strips -monorepo suffix from base name", () => {
    const pkgName = "@mycompany/myproject-monorepo";
    const baseName = pkgName.replace(/^@[^/]+\//, "").replace(/-monorepo$/, "");
    expect(baseName).toBe("myproject");
  });
});

describe("add-domain directory naming", () => {
  it("uses prefix for directory name", () => {
    const prefix = "myapp";
    const name = "product";
    const dirName = prefix ? `${prefix}-domain-${name}` : `domain-${name}`;
    expect(dirName).toBe("myapp-domain-product");
  });

  it("uses simple domain name when no prefix", () => {
    const prefix = "";
    const name = "product";
    const dirName = prefix ? `${prefix}-domain-${name}` : `domain-${name}`;
    expect(dirName).toBe("domain-product");
  });
});
