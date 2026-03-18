import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock prompts
vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({
    entities: "product",
    enableI18n: true,
  }),
}));

// Mock ora
vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// Mock logger
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock versions
vi.mock("../versions.js", () => ({
  withVersions: vi.fn((ctx: Record<string, unknown>) => ({
    ...ctx,
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
  })),
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
}));

// Mock config-loader
vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn().mockResolvedValue({
    api: { baseUrl: "/api" },
    i18n: { locales: ["en", "ko"] },
    packages: { prefix: "myapp" },
  }),
}));

// Mock config/types
vi.mock("../config/types.js", () => ({
  findSpecForDomain: vi.fn().mockReturnValue(null),
  findSpecBySource: vi.fn().mockReturnValue(null),
}));

// Mock plugin-registry
vi.mock("../openapi/plugin-registry.js", () => ({
  getSpecProfile: vi.fn().mockReturnValue(null),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "add-domain-openapi-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  await writeFile(
    join(tempDir, "package.json"),
    JSON.stringify({ name: "@test/test-monorepo", private: true }),
  );
  await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");
  await mkdir(join(tempDir, "packages"), { recursive: true });

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("addDomainCommand OpenAPI mode with profile dependencies", () => {
  it("adds profile dependencies when specConfig has a profile", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { findSpecForDomain } = await import("../config/types.js");
    const { getSpecProfile } = await import("../openapi/plugin-registry.js");

    vi.mocked(findSpecForDomain).mockReturnValue({
      spec: "openapi.json",
      domains: { api: ["api-tag"] },
      profile: "simplix-boot",
    });

    vi.mocked(getSpecProfile).mockReturnValue({
      dependencies: {
        "@simplix-react-ext/simplix-boot-utils": "^0.1.0",
      },
    } as never);

    // Create the OpenAPI spec file
    await writeFile(join(tempDir, "openapi.json"), JSON.stringify({ openapi: "3.0.0" }));

    await addDomainCommand.parseAsync(["node", "simplix", "api", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-api");
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));

    // Profile dependencies should be added
    expect(pkgJson.dependencies["@simplix-react-ext/simplix-boot-utils"]).toBe("^0.1.0");
  });

  it("shows hint when existing domain with OpenAPI spec", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { findSpecForDomain } = await import("../config/types.js");
    const { log } = await import("../utils/logger.js");

    vi.mocked(findSpecForDomain).mockReturnValue({
      spec: "openapi.json",
      domains: { existing: ["tag"] },
    });

    await writeFile(join(tempDir, "openapi.json"), JSON.stringify({ openapi: "3.0.0" }));

    // Create existing domain dir
    await mkdir(join(tempDir, "packages/myapp-domain-existing"), { recursive: true });

    await expect(
      addDomainCommand.parseAsync(["node", "simplix", "existing", "-y"]),
    ).rejects.toThrow("process.exit(1)");

    // Should show the "To regenerate" hint since there's an OpenAPI spec
    expect(log.step).toHaveBeenCalledWith(expect.stringContaining("simplix openapi"));
  });

  it("handles error during domain creation", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { log } = await import("../utils/logger.js");

    // Mock writeFileWithDir to throw
    vi.doMock("../utils/fs.js", async (importOriginal) => {
      const orig = await importOriginal<typeof import("../utils/fs.js")>();
      return {
        ...orig,
        writeFileWithDir: vi.fn().mockRejectedValue(new Error("write error")),
      };
    });

    // This test verifies the catch block runs
    // We need to trigger it by a method that will throw during file writes
    // Since we can't easily mock writeFileWithDir inside the already-imported module,
    // we verify the error case by checking process.exit behavior
    const emptyDir = await mkdtemp(join(tmpdir(), "no-root-pkg-"));
    process.chdir(emptyDir);

    await expect(
      addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]),
    ).rejects.toThrow("process.exit(1)");

    expect(log.error).toHaveBeenCalled();

    process.chdir(originalCwd);
    await rm(emptyDir, { recursive: true, force: true });
  });

  it("creates domain with URL spec (skips file existence check)", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { findSpecForDomain } = await import("../config/types.js");

    vi.mocked(findSpecForDomain).mockReturnValue({
      spec: "https://api.example.com/v3/openapi.json",
      domains: { remote: ["remote-tag"] },
    });

    await addDomainCommand.parseAsync(["node", "simplix", "remote", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-remote");
    expect(await pathExists(join(targetDir, "src/mutator.ts"))).toBe(true);

    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.dependencies?.["@simplix-react/api"]).toBe("catalog:");
    expect(pkgJson.scripts?.codegen).toContain("https://");
  });
});

describe("addDomainCommand interactive prompts", () => {
  it("prompts for i18n when not --yes and not --no-i18n", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const prompts = await import("prompts");

    // First call: entity names prompt
    vi.mocked(prompts.default).mockResolvedValueOnce({
      entities: "widget",
    });
    // Second call: i18n enable prompt
    vi.mocked(prompts.default).mockResolvedValueOnce({
      enableI18n: false,
    });

    await addDomainCommand.parseAsync(["node", "simplix", "widget"]);

    const targetDir = join(tempDir, "packages/myapp-domain-widget");
    // Should NOT create translations since i18n was declined in prompt
    expect(await pathExists(join(targetDir, "src/translations.ts"))).toBe(false);
  });
});
