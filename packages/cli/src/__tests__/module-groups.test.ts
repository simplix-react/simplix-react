import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { generatedReport } from "../commands/generated.js";
import { findModulePaths, modulePathOf, parseModulePath } from "../utils/module-path.js";
import { pathExists } from "../utils/fs.js";

/** The report without the blocks files, which are tracked too and are not what these cases are about. */
const pageReport = async (root: string) => (await generatedReport(root)).filter((entry) => !entry.path.endsWith(".blocks.tsx"));


const GROUPS = ["admin", "portal", "shared"];

describe("parseModulePath", () => {
  it("reads a bare module and a grouped one", () => {
    expect(parseModulePath("billing", GROUPS)).toEqual({ path: "billing", leaf: "billing" });
    expect(parseModulePath("admin/user", GROUPS)).toEqual({ path: "admin/user", group: "admin", leaf: "user" });
    expect(parseModulePath("admin\\user/", GROUPS)).toEqual({ path: "admin/user", group: "admin", leaf: "user" });
  });

  it("refuses a group the project does not declare, and any group when none is declared", () => {
    expect(() => parseModulePath("ops/user", GROUPS)).toThrow(/"ops" is not a module group/);
    expect(() => parseModulePath("admin/user")).toThrow(/modules.groups: none/);
  });

  it("refuses a group named as a module, a deeper path and an escaping one", () => {
    expect(() => parseModulePath("admin", GROUPS)).toThrow(/is a module group/);
    expect(() => parseModulePath("admin/user/extra", GROUPS)).toThrow(/deeper/);
    expect(() => parseModulePath("../user", GROUPS)).toThrow(/not a module path/);
    expect(() => parseModulePath("", GROUPS)).toThrow(/not a module path/);
  });

  it("is spelled back from a module directory with forward slashes", () => {
    expect(modulePathOf("/p", "/p/modules/admin/user")).toBe("admin/user");
    expect(modulePathOf("/p", "/p/modules/billing")).toBe("billing");
  });
});

describe("findModulePaths", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "simplix-module-paths-"));
    for (const dir of ["modules/admin/user", "modules/admin/system", "modules/shared/account", "modules/portal/.keep-dir", "modules/billing", "modules/.hidden"]) {
      await mkdir(join(root, dir), { recursive: true });
    }
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  it("lists a group's modules in place of the group, and every other directory as a module", async () => {
    expect(await findModulePaths(root, GROUPS)).toEqual(["admin/system", "admin/user", "billing", "shared/account"]);
  });

  it("reads every directory as a module when no group is declared", async () => {
    expect(await findModulePaths(root)).toEqual(["admin", "billing", "portal", "shared"]);
  });
});

describe("add-page into a grouped module", () => {
  let root: string;
  let cwd: string;
  const moduleDir = () => join(root, "modules/admin/user");

  beforeEach(async () => {
    cwd = process.cwd();
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-module-groups-")));
    await writeFile(join(root, "simplix.config.ts"), 'export default { modules: { groups: ["admin", "portal", "shared"] } };\n');
    await mkdir(join(root, ".simplix/templates"), { recursive: true });
    await writeFile(
      join(root, ".simplix/templates/static-page.hbs"),
      '/**\n * @simplix-generated page/static-page\n */\nexport const ns = "{{namespace}}";\nexport function {{NamePascal}}Page() {}\n',
    );
    await mkdir(moduleDir(), { recursive: true });
    await writeFile(join(moduleDir(), "package.json"), JSON.stringify({ name: "@p/admin-user" }));
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  it("writes into the group, records the grouped path as its origin and reads the package's namespace", async () => {
    await runAddPage("static", "about", { module: "admin/user" });

    const page = join(moduleDir(), "src/pages/about/page.tsx");
    const text = await readFile(page, "utf-8");
    expect(text).toContain("--module admin/user");
    expect(text).toContain('ns = "admin-user/pages"');
    expect(await pathExists(join(root, ".simplix/generated/modules/admin/user/src/pages/about/page.tsx"))).toBe(true);

    const report = await pageReport(root);
    expect(report.map((entry) => [entry.state, entry.origin])).toEqual([["untouched", "add-page static-page about --module admin/user"]]);
  });

  it("refuses a group the config does not declare", async () => {
    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`);
    }) as never);
    await expect(runAddPage("static", "about", { module: "ops/user" })).rejects.toThrow("exit 1");
    exit.mockRestore();
  });
});
