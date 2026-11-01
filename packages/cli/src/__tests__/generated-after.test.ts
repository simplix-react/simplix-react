import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addPageCommand, runAddPage } from "../commands/add-page.js";
import { generatedCommand, generatedReport, regenerateAll } from "../commands/generated.js";
import { runAfterGenerate, runAfterSteps } from "../utils/generated-after.js";
import { log } from "../utils/logger.js";

const PAGE_TEMPLATE = `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "v1";\n}\n`;
/** Appends one mark to `after.log` in the directory it runs in, so a test counts runs and sees where they ran. */
const MARK = `require("node:fs").appendFileSync("after.log", process.argv[2] ?? "x");\n`;

describe("commands run after a generation", () => {
  let root: string;
  let cwd: string;

  /** The marks `after.log` holds in `dir`, or `undefined` when no command ran there. */
  const marks = (dir = "."): Promise<string | undefined> => readFile(join(root, dir, "after.log"), "utf-8").catch(() => undefined);

  async function project(after: string): Promise<void> {
    await writeFile(join(root, "simplix.config.ts"), `export default { generated: { after: ${after} } };\n`);
    await mkdir(join(root, ".simplix/templates"), { recursive: true });
    await writeFile(join(root, ".simplix/templates/static-page.hbs"), PAGE_TEMPLATE);
    await writeFile(join(root, "mark.cjs"), MARK);
    await mkdir(join(root, "board"), { recursive: true });
  }

  beforeEach(async () => {
    cwd = process.cwd();
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-after-")));
    process.chdir(root);
    vi.spyOn(log, "info").mockImplementation(() => undefined);
    vi.spyOn(log, "success").mockImplementation(() => undefined);
    vi.spyOn(log, "step").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.chdir(cwd);
    process.exitCode = undefined;
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  describe("the steps", () => {
    beforeEach(async () => {
      await writeFile(join(root, "mark.cjs"), MARK);
      await mkdir(join(root, "board"));
    });

    it("run in order, each in its own directory, with the exit code reported", async () => {
      const out = await runAfterSteps(root, [{ command: "node mark.cjs a" }, { cwd: "board", command: "node ../mark.cjs b" }]);
      expect(out.map((one) => one.exitCode)).toEqual([0, 0]);
      expect(await marks()).toBe("a");
      expect(await marks("board")).toBe("b");
      expect(log.success).toHaveBeenCalledWith("after: node ../mark.cjs b exited 0");
    });

    it("end at the first that fails, reporting its exit code and the steps skipped", async () => {
      const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
      const out = await runAfterSteps(root, [{ command: "node mark.cjs a" }, { command: 'node -e "process.exit(3)"' }, { command: "node mark.cjs c" }]);
      expect(out.map((one) => one.exitCode)).toEqual([0, 3]);
      expect(await marks()).toBe("a");
      expect(error).toHaveBeenCalledWith('after: node -e "process.exit(3)" exited 3; 1 later step(s) skipped');
    });

    it("report a command that a signal ended and a directory that is gone", async () => {
      const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
      const [killed] = await runAfterSteps(root, [{ command: `node -e "process.kill(process.pid, 'SIGKILL')"` }]);
      expect(killed).toMatchObject({ exitCode: null, signal: "SIGKILL" });
      const [gone] = await runAfterSteps(root, [{ cwd: "nowhere", command: "node mark.cjs" }]);
      expect(gone?.exitCode).toBeNull();
      expect(gone?.error).toBeDefined();
      expect(error).toHaveBeenCalledTimes(2);
    });
  });

  describe("runAfterGenerate", () => {
    it("runs the configured steps and leaves the exit code alone when they pass", async () => {
      await project('[{ command: "node mark.cjs" }]');
      expect(await runAfterGenerate(root)).toMatchObject([{ exitCode: 0 }]);
      expect(await marks()).toBe("x");
      expect(process.exitCode).toBeUndefined();
    });

    it("fails the run when a step fails", async () => {
      vi.spyOn(log, "error").mockImplementation(() => undefined);
      await project('[{ command: "node -e \\"process.exit(2)\\"" }]');
      await runAfterGenerate(root);
      expect(process.exitCode).toBe(1);
    });

    it("does nothing for a project that configures none", async () => {
      await writeFile(join(root, "simplix.config.ts"), "export default {};\n");
      expect(await runAfterGenerate(root)).toEqual([]);
      await writeFile(join(root, "simplix.config.ts"), "export default { generated: { after: [] } };\n");
      expect(await runAfterGenerate(root)).toEqual([]);
      expect(process.exitCode).toBeUndefined();
    });
  });

  describe("the commands", () => {
    it("are not run by the generators themselves, nor by a report or a regeneration of the functions", async () => {
      await project('[{ command: "node mark.cjs" }]');
      await runAddPage("static", "about", { app: "web" });
      await runAddPage("static", "contact", { app: "web" });
      await generatedReport(root);
      await regenerateAll(root);
      expect(await marks()).toBeUndefined();
    });

    it("run once after simplix add-page", async () => {
      await project('[{ command: "node mark.cjs" }]');
      await addPageCommand.parseAsync(["node", "simplix", "static", "about", "--app", "web"]);
      expect(await marks()).toBe("x");
    });

    it("do not run for a report, and run once, not once per page, for generated --all", async () => {
      await project('[{ command: "node mark.cjs" }]');
      await runAddPage("static", "about", { app: "web" });
      await runAddPage("static", "contact", { app: "web" });

      await generatedCommand.parseAsync(["node", "simplix"]);
      expect(await marks()).toBeUndefined();

      // Last in this file: a command keeps the options of the parse before it.
      await generatedCommand.parseAsync(["node", "simplix", "--all"]);
      expect(await marks()).toBe("x");
    });
  });
});
