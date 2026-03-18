import { describe, it, expect } from "vitest";
import { renderTemplate } from "../utils/template.js";
import {
  openapiPackageJsonStandalone,
  openapiPackageJsonWithEslintConfig,
  openapiTsupConfig,
  openapiTsconfigJson,
  openapiUserIndexTs,
} from "../templates/openapi/index.js";

function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    domainName: "pet",
    domainPkgName: "@test/test-domain-pet",
    projectName: "test",
    scope: "@test",
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
    ...overrides,
  };
}

describe("openapi templates", () => {
  it("renders standalone package.json", () => {
    const result = renderTemplate(openapiPackageJsonStandalone, makeCtx());
    expect(result).toContain("@test/test-domain-pet");
  });

  it("renders package.json with eslint config", () => {
    const result = renderTemplate(openapiPackageJsonWithEslintConfig, makeCtx());
    expect(result).toContain("@test/test-domain-pet");
  });

  it("renders tsup config", () => {
    expect(openapiTsupConfig).toContain("tsup");
  });

  it("renders tsconfig.json", () => {
    const result = renderTemplate(openapiTsconfigJson, makeCtx());
    expect(result).toContain("compilerOptions");
  });

  it("renders user index.ts", () => {
    const result = renderTemplate(openapiUserIndexTs, makeCtx());
    expect(result).toBeTruthy();
  });
});
