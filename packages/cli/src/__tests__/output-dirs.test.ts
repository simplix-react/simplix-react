import { mkdtemp, mkdir, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { generatedCommand, generatedReport, regenerateAll } from "../commands/generated.js";
import { assertOutputDirs, findOutputDirProblems, OutputDirError } from "../config/output-dirs.js";
import { log } from "../utils/logger.js";

/** The report without the blocks files, which are tracked too and are not what these cases are about. */
const pageReport = async (root: string) => (await generatedReport(root)).filter((entry) => !entry.path.endsWith(".blocks.tsx"));


const TEMPLATE_DIR = ".simplix/templates";
const PAGE_TEMPLATE = `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "v1";\n}\n`;

describe("configured output directories", () => {
  let root: string;
  let cwd: string;
  const exists = (path: string) =>
    stat(join(root, path)).then(
      () => true,
      () => false,
    );

  /** A project whose config names `storiesDir`, with one page template; the directory is created only when asked. */
  async function project(storiesDir: string | undefined, create: boolean): Promise<void> {
    const templates = storiesDir === undefined ? "" : `templates: { storiesDir: ${JSON.stringify(storiesDir)} }`;
    await writeFile(join(root, "simplix.config.ts"), `export default { ${templates} };\n`);
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), PAGE_TEMPLATE);
    if (create && storiesDir !== undefined) await mkdir(join(root, storiesDir), { recursive: true });
  }

  beforeEach(async () => {
    cwd = process.cwd();
    // The roots the generators resolve against are the real paths the OS reports for the cwd.
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-output-dirs-")));
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    process.exitCode = undefined;
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  describe("simplix generated", () => {
    it("refuses a storiesDir that does not exist, naming the option and the resolved path", async () => {
      await project("board/screens", false);
      const expected = new RegExp(`templates\\.storiesDir "board/screens" resolves to ${join(root, "board/screens").replaceAll(".", "\\.")}, which does not exist`);
      await expect(generatedReport(root)).rejects.toThrow(expected);
      await expect(generatedReport(root)).rejects.toBeInstanceOf(OutputDirError);
    });

    it("reports an existing storiesDir as before", async () => {
      await project("board/screens", true);
      await runAddPage("static", "about", { app: "web" });
      expect(await pageReport(root)).toEqual([
        { path: "apps/web/src/pages/about/page.tsx", state: "untouched", origin: "add-page static-page about --app web" },
      ]);
    });

    it("checks nothing for a project that configures no storiesDir", async () => {
      await project(undefined, false);
      expect(await pageReport(root)).toEqual([]);
    });

    it("refuses a regeneration before it writes anything", async () => {
      await project("board/screens", false);
      await expect(regenerateAll(root)).rejects.toBeInstanceOf(OutputDirError);
      expect(await exists("board")).toBe(false);
    });

    it("prints the message and exits non-zero from the command, for the report and for --all", async () => {
      await project("board/screens", false);
      const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
      for (const args of [[], ["--all"], ["--json"]]) {
        error.mockClear();
        process.exitCode = undefined;
        await generatedCommand.parseAsync(["node", "simplix", ...args]);
        expect(process.exitCode).toBe(1);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error.mock.calls[0]?.[0]).toContain(`templates.storiesDir "board/screens" resolves to ${join(root, "board/screens")}, which does not exist`);
      }
      expect(await exists("board")).toBe(false);
    });

    it("exits zero from the command when the storiesDir exists", async () => {
      await project("board/screens", true);
      const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
      vi.spyOn(log, "info").mockImplementation(() => undefined);
      await generatedCommand.parseAsync(["node", "simplix"]);
      expect(error).not.toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    });
  });

  describe("simplix add-page", () => {
    it("refuses a storiesDir that does not exist before it writes the page", async () => {
      await project("board/screens", false);
      await expect(runAddPage("static", "about", { app: "web" })).rejects.toThrow(/templates\.storiesDir "board\/screens" resolves to .*board\/screens, which does not exist/);
      expect(await exists("apps")).toBe(false);
      expect(await exists("board")).toBe(false);
    });

    it("writes the page when the storiesDir exists", async () => {
      await project("board/screens", true);
      await runAddPage("static", "about", { app: "web" });
      expect(await exists("apps/web/src/pages/about/page.tsx")).toBe(true);
    });
  });

  describe("the check", () => {
    it("reports a storiesDir that is a file", async () => {
      await project(undefined, false);
      await writeFile(join(root, "screens"), "");
      const problems = await findOutputDirProblems(root, { templates: { storiesDir: "screens" } });
      expect(problems).toEqual([{ option: "templates.storiesDir", configured: "screens", path: join(root, "screens"), reason: "not-a-directory", consequence: expect.any(String) }]);
      await expect(assertOutputDirs(root, { templates: { storiesDir: "screens" } })).rejects.toThrow(/is not a directory/);
    });

    it("reports a storiesDir below a file as missing", async () => {
      await writeFile(join(root, "screens"), "");
      const problems = await findOutputDirProblems(root, { templates: { storiesDir: "screens/inner" } });
      expect(problems.map((p) => p.reason)).toEqual(["missing"]);
    });

    it("resolves an absolute storiesDir as it is", async () => {
      const abs = join(root, "abs-screens");
      expect(await findOutputDirProblems(root, { templates: { storiesDir: abs } })).toMatchObject([{ path: abs, reason: "missing" }]);
      await mkdir(abs);
      expect(await findOutputDirProblems(root, { templates: { storiesDir: abs } })).toEqual([]);
    });

    it("checks the directory each after step runs in, naming the step", async () => {
      await mkdir(join(root, "board"));
      const config = { generated: { after: [{ command: "a" }, { cwd: "board", command: "b" }, { cwd: "gone", command: "c" }] } };
      const problems = await findOutputDirProblems(root, config);
      expect(problems).toMatchObject([{ option: "generated.after[2].cwd", configured: "gone", path: join(root, "gone"), reason: "missing" }]);
      await expect(assertOutputDirs(root, config)).rejects.toThrow(/generated\.after\[2\]\.cwd "gone" resolves to .*gone, which does not exist\. The command would fail/);
    });

    it("passes a config that names no output directory", async () => {
      expect(await findOutputDirProblems(root, {})).toEqual([]);
      expect(await findOutputDirProblems(root, { templates: { from: "somewhere" } })).toEqual([]);
    });
  });
});
