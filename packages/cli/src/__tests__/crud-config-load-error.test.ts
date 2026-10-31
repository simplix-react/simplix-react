import { mkdir, mkdtemp, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// The dependency versions are inlined at build time, so a run from source has none to read.
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

/** The scaffold command with the options of the previous parse cleared, and the logger it writes to. */
async function freshScaffold() {
  vi.resetModules();
  const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
  const { log } = await import("../utils/logger.js");
  return { scaffoldCrudCommand, log };
}

describe("a crud.config.ts that cannot be loaded", () => {
  let root: string;
  let cwd: string;
  let configPath: string;

  beforeEach(async () => {
    cwd = process.cwd();
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-crud-config-error-")));
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "@acme/app" }));
    await writeFile(join(root, "simplix.config.ts"), "export default {};\n");

    const moduleDir = join(root, "modules/editor");
    await mkdir(join(moduleDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(moduleDir, "package.json"),
      JSON.stringify({ name: "@acme/editor", dependencies: {} }),
    );
    await writeFile(join(moduleDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(moduleDir, "src/index.ts"), 'export * from "./widgets";\n');

    const packageDir = join(root, "packages/acme-domain-user");
    await mkdir(join(packageDir, "src"), { recursive: true });
    await writeFile(join(packageDir, "package.json"), JSON.stringify({ name: "@acme/domain-user" }));
    await writeFile(
      join(packageDir, "src/schemas.ts"),
      "export const userSchema = z.object({ id: z.string().uuid(), name: z.string().min(1) });\n",
    );
    configPath = join(packageDir, "crud.config.ts");
    await writeFile(configPath, "throw new Error('crud boom');\nexport default {};\n");
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    process.exitCode = undefined;
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it.each([
    ["simplix scaffold user --module editor", ["user", "--module", "editor"]],
    ["simplix scaffold user --module editor --native", ["user", "--module", "editor", "--native"]],
  ])("%s prints the file and the original error and exits 1", async (_name, args) => {
    const { scaffoldCrudCommand, log } = await freshScaffold();
    const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
    // A run that reached its own failure path swallowed the error, which is the defect.
    vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit reached: the command swallowed the crud config failure");
    }) as never);

    await scaffoldCrudCommand.parseAsync(["node", "simplix", ...args]);

    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledTimes(1);
    const message = String(error.mock.calls[0]?.[0]);
    expect(message).toContain(configPath);
    expect(message).toContain("crud boom");
  });

  it("writes no widgets when the crud.config.ts cannot be loaded", async () => {
    const { scaffoldCrudCommand, log } = await freshScaffold();
    vi.spyOn(log, "error").mockImplementation(() => undefined);

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "user", "--module", "editor"]);

    expect(await readdir(join(root, "modules/editor/src/widgets"))).toEqual(["index.ts"]);
  });

  it("scaffolds with the defaults when the package has no crud.config.ts", async () => {
    await rm(configPath);
    const { scaffoldCrudCommand, log } = await freshScaffold();
    const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
    vi.spyOn(log, "info").mockImplementation(() => undefined);

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "user", "--module", "editor"]);

    expect(error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
    expect(await readdir(join(root, "modules/editor/src/widgets"))).toContain("user");
  });
});
