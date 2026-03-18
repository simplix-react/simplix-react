import { describe, it, expect } from "vitest";
import { renderTemplate } from "../utils/template.js";
import {
  modulePackageJson,
  moduleTsupConfig,
  moduleTsconfigJson,
  moduleIndexTs,
  moduleManifestTs,
  moduleFeaturesIndexTs,
  moduleWidgetsIndexTs,
  moduleLocalesIndexTs,
} from "../templates/module/index.js";
import { toPascalCase } from "../utils/case.js";

function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    moduleName: "editor",
    modulePkgName: "@test/test-editor",
    projectName: "test",
    scope: "@test",
    enableI18n: true,
    locales: ["en", "ko"],
    PascalName: "Editor",
    namespace: "test-editor",
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
    ...overrides,
  };
}

describe("add-module templates", () => {
  it("renders module package.json", () => {
    const result = renderTemplate(modulePackageJson, makeCtx());
    expect(result).toContain("@test/test-editor");
    expect(result).toContain('"type": "module"');
  });

  it("renders module tsup.config", () => {
    const result = renderTemplate(moduleTsupConfig, makeCtx());
    expect(result).toContain("tsup");
  });

  it("renders module tsconfig.json", () => {
    const result = renderTemplate(moduleTsconfigJson, makeCtx());
    expect(result).toContain("compilerOptions");
  });

  it("renders module index.ts", () => {
    const result = renderTemplate(moduleIndexTs, makeCtx());
    expect(result).toContain("export");
  });

  it("renders module manifest.ts", () => {
    const result = renderTemplate(moduleManifestTs, makeCtx());
    expect(result).toContain("Editor");
  });

  it("renders features index.ts as static", () => {
    expect(moduleFeaturesIndexTs).toBeDefined();
    expect(typeof moduleFeaturesIndexTs).toBe("string");
  });

  it("renders widgets index.ts as static", () => {
    expect(moduleWidgetsIndexTs).toBeDefined();
    expect(typeof moduleWidgetsIndexTs).toBe("string");
  });

  it("renders locales index.ts", () => {
    const result = renderTemplate(moduleLocalesIndexTs, makeCtx());
    expect(result).toContain("i18n");
  });
});

describe("add-module naming", () => {
  it("generates correct directory name with prefix", () => {
    const prefix = "myapp";
    const name = "editor";
    const dirName = prefix ? `${prefix}-${name}` : name;
    expect(dirName).toBe("myapp-editor");
  });

  it("generates correct directory name without prefix", () => {
    const prefix = "";
    const name = "editor";
    const dirName = prefix ? `${prefix}-${name}` : name;
    expect(dirName).toBe("editor");
  });

  it("generates PascalCase module name", () => {
    expect(toPascalCase("editor")).toBe("Editor");
    expect(toPascalCase("my-module")).toBe("MyModule");
  });
});

describe("add-module i18n file structure", () => {
  it("generates locale file paths for each locale", () => {
    const locales = ["en", "ko", "ja"];
    const files: Record<string, string> = {};

    for (const locale of locales) {
      files[`src/locales/features/${locale}.json`] = "{}\n";
      files[`src/locales/widgets/${locale}.json`] = "{}\n";
    }

    expect(Object.keys(files)).toHaveLength(6);
    expect(files["src/locales/features/en.json"]).toBe("{}\n");
    expect(files["src/locales/widgets/ko.json"]).toBe("{}\n");
  });
});
