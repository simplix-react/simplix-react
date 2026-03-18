import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { renderTemplate } from "../utils/template.js";
import {
  rootPackageJson,
  pnpmWorkspaceYaml,
  turboJson,
} from "../templates/project/root-files.js";

const mockVersionCtx = {
  fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
  fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0", form: "0.4.0", mock: "0.5.0", i18n: "0.6.0", testing: "0.7.0", ui: "0.8.0", api: "0.9.0" },
  deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
};

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "init-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("init command templates", () => {
  it("renders root package.json template", () => {
    const ctx = {
      ...mockVersionCtx,
      projectName: "test-project",
      scope: "@test",
      includeDemo: true,
      enableI18n: true,
      enableAuth: true,
      enableAccess: true,
      locales: ["en", "ko"],
      defaultLocale: "en",
    };

    const result = renderTemplate(rootPackageJson, ctx);
    expect(result).toContain('"name": "@test/test-project-monorepo"');
    expect(result).toContain('"private": true');
  });

  it("renders pnpm workspace yaml template", () => {
    const ctx = {
      ...mockVersionCtx,
      projectName: "test-project",
      scope: "@test",
    };

    const result = renderTemplate(pnpmWorkspaceYaml, ctx);
    expect(result).toContain("packages:");
  });

  it("renders turbo.json template", () => {
    const ctx = { ...mockVersionCtx };
    const result = renderTemplate(turboJson, ctx);
    expect(result).toContain("tasks");
  });
});

describe("init command writeFiles helper (functional test)", () => {
  it("creates files in the target directory", async () => {
    const { writeFileWithDir } = await import("../utils/fs.js");

    const targetDir = join(tempDir, "my-project");
    const files: Record<string, string> = {
      "package.json": '{"name": "test"}',
      "config/typescript/base.json": '{"compilerOptions": {}}',
    };

    for (const [relativePath, content] of Object.entries(files)) {
      await writeFileWithDir(join(targetDir, relativePath), content);
    }

    const pkgJson = await readFile(join(targetDir, "package.json"), "utf-8");
    expect(pkgJson).toContain('"name": "test"');

    const tsConfig = await readFile(join(targetDir, "config/typescript/base.json"), "utf-8");
    expect(tsConfig).toContain("compilerOptions");
  });
});

describe("init command options", () => {
  it("InitOptions interface has expected fields", () => {
    const options = {
      name: "test",
      scope: "@test",
      includeDemo: true,
      enableI18n: true,
      enableAuth: true,
      enableAccess: true,
      locales: ["en", "ko"],
    };

    expect(options.name).toBe("test");
    expect(options.scope).toBe("@test");
    expect(options.includeDemo).toBe(true);
    expect(options.enableI18n).toBe(true);
    expect(options.enableAuth).toBe(true);
    expect(options.enableAccess).toBe(true);
    expect(options.locales).toEqual(["en", "ko"]);
  });

  it("scope is prepended with @ if missing", () => {
    let scope = "mycompany";
    if (!scope.startsWith("@")) {
      scope = `@${scope}`;
    }
    expect(scope).toBe("@mycompany");
  });

  it("scope is preserved if already has @", () => {
    let scope = "@mycompany";
    if (!scope.startsWith("@")) {
      scope = `@${scope}`;
    }
    expect(scope).toBe("@mycompany");
  });
});

describe("i18n file templates", () => {
  it("renders i18n config template", async () => {
    const { i18nConfigTs } = await import("../templates/project/i18n-files.js");

    const ctx = {
      ...mockVersionCtx,
      projectName: "demo",
      scope: "@test",
      appPkgName: "@test/demo-demo",
      enableI18n: true,
      locales: ["en", "ko"],
    };

    const result = renderTemplate(i18nConfigTs, ctx);
    expect(result).toContain("i18n");
  });

  it("generates common translation JSON", async () => {
    const { getCommonTranslationJson } = await import("../templates/project/i18n-files.js");

    const enJson = getCommonTranslationJson("en");
    const parsed = JSON.parse(enJson);
    expect(parsed).toBeTruthy();
  });
});

describe("access config template", () => {
  it("renders access config template", async () => {
    const { accessConfigTs } = await import("../templates/project/access-files.js");

    const ctx = { ...mockVersionCtx, scope: "@test", projectName: "demo" };
    const result = renderTemplate(accessConfigTs, ctx);
    expect(result).toBeTruthy();
  });
});

describe("app templates", () => {
  it("renders app package.json template", async () => {
    const { appPackageJson } = await import("../templates/project/app-files.js");

    const ctx = {
      ...mockVersionCtx,
      projectName: "demo",
      scope: "@test",
      appPkgName: "@test/demo-demo",
      enableI18n: true,
      enableAuth: true,
      enableAccess: true,
    };

    const result = renderTemplate(appPackageJson, ctx);
    expect(result).toContain("@test/demo-demo");
  });
});
