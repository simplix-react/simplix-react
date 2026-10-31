import { describe, expect, it } from "vitest";

// Define build-time globals before importing the module
(globalThis as Record<string, unknown>).__FW_VERSIONS__ = {
  cli: "0.1.0",
  contract: "0.2.0",
  react: "0.3.0",
  form: "0.4.0",
  mock: "0.5.0",
  i18n: "0.6.0",
  testing: "0.7.0",
  ui: "0.8.0",
  api: "0.9.0",
  meta: "1.0.0",
};
(globalThis as Record<string, unknown>).__DEP_VERSIONS__ = {
  oxlint: "^1.56.0",
  turbo: "^2.8.17",
  typescript: "^7.0.2",
  "typescript-expo": "~5.9.3",
  tsup: "^8.5.1",
  vitest: "^4.1.0",
  zod: "^4.3.6",
  msw: "^2.12.12",
  react: "^19.2.4",
  "lucide-react": "^0.577.0",
  "@tanstack/react-query": "^5.90.21",
  "@tanstack/router-cli": "^1.166.13",
  "@tanstack/router-plugin": "^1.166.13",
  "@types/react": "^19.2.14",
};

// Import after globals are set
const { withVersions } = await import("../versions.js");
const { renderTemplate } = await import("../utils/template.js");
const { rootPackageJson, turboJson, rootTsconfigJson } = await import(
  "../templates/project/root-files.js"
);
const { appPackageJson, appTsconfigJson } = await import("../templates/project/app-files.js");
const { domainPackageJson, domainTsupConfig } = await import("../templates/domain/index.js");
const { modulePackageJson, moduleTsupConfig } = await import("../templates/module/index.js");
const { openapiPackageJsonStandalone, openapiPackageJsonWithEslintConfig, openapiTsupConfig } =
  await import("../templates/openapi/index.js");
const { nativeAppPackageJson } = await import("../templates/native-app/index.js");

function render(template: string, ctx: Record<string, unknown> = {}): string {
  return renderTemplate(
    template,
    withVersions({
      projectName: "test",
      scope: "@test",
      domainPkgName: "@test/test-domain-pet",
      modulePkgName: "@test/test-module-pet",
      PascalName: "Pet",
      appName: "visitor-kiosk",
      nativeFw: "^0.3.0",
      ...ctx,
    }),
  );
}

interface EntryPoint {
  source?: string;
  types?: string;
}

function expectTypesAtSource(json: string) {
  const pkg = JSON.parse(json) as { types: string; exports: Record<string, EntryPoint> };
  for (const entry of Object.values(pkg.exports)) {
    expect(entry.source).toBeDefined();
    expect(entry.types).toBe(entry.source);
  }
  expect(pkg.types).toBe(pkg.exports["."].source);
}

describe("project root templates", () => {
  it("runs only the apps in dev and typechecks in build", () => {
    const pkg = JSON.parse(render(rootPackageJson));
    expect(pkg.scripts.dev).toBe("turbo run dev:app");
    expect(pkg.scripts.build).toBe("turbo run clean && turbo run typecheck build");
  });

  it("keeps builds out of dev, lint and typecheck", () => {
    const turbo = JSON.parse(render(turboJson));
    expect(turbo.concurrency).toBe("4");
    expect(turbo.tasks["dev:app"].dependsOn).toEqual([]);
    expect(turbo.tasks.lint.dependsOn).toEqual([]);
    expect(turbo.tasks.typecheck.dependsOn).toEqual(["^typecheck"]);
    expect(turbo.tasks.test.dependsOn).toEqual(["^build"]);
  });

  it("drops baseUrl from the root and app tsconfig", () => {
    for (const template of [rootTsconfigJson, appTsconfigJson]) {
      const json = render(template);
      expect(json).not.toContain("baseUrl");
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
});

describe("demo app template", () => {
  it("generates the route tree before its type check", () => {
    const pkg = JSON.parse(render(appPackageJson, { appPkgName: "@test/test-demo" }));
    expect(pkg.scripts.typecheck).toBe("tsr generate && tsc --noEmit");
    expect(pkg.devDependencies["@tanstack/router-cli"]).toBe("^1.166.13");
    expect(pkg.devDependencies["@tanstack/router-cli"]).toBe(
      pkg.devDependencies["@tanstack/router-plugin"],
    );
  });
});

describe("package templates", () => {
  it("points every domain entry's types at its source", () => {
    expectTypesAtSource(render(domainPackageJson));
  });

  it("points every module entry's types at its source", () => {
    expectTypesAtSource(render(modulePackageJson, { enableI18n: true }));
    expectTypesAtSource(render(modulePackageJson, { enableI18n: false }));
  });

  it("points every OpenAPI domain entry's types at its source", () => {
    expectTypesAtSource(render(openapiPackageJsonStandalone));
    expectTypesAtSource(render(openapiPackageJsonWithEslintConfig));
  });

  it("builds packages without declarations", () => {
    for (const template of [domainTsupConfig, moduleTsupConfig, openapiTsupConfig]) {
      expect(render(template, { enableI18n: true })).not.toContain("dts");
    }
  });
});

describe("native app template", () => {
  it("pins the Expo app to the TypeScript the Expo CLI can load", () => {
    const pkg = JSON.parse(render(nativeAppPackageJson));
    expect(pkg.devDependencies.typescript).toBe("~5.9.3");
  });
});
