import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addAppCommand } from "../commands/add-app.js";
import { addDomainCommand } from "../commands/add-domain.js";
import { addModuleCommand } from "../commands/add-module.js";
import { addPageCommand } from "../commands/add-page.js";
import { generatedCommand } from "../commands/generated.js";
import { i18nCodegenCommand } from "../commands/i18n-codegen.js";
import { kitFenceCommand } from "../commands/kit-fence.js";
import { metaCommand } from "../commands/meta.js";
import { openapiCommand } from "../commands/openapi.js";
import { scaffoldCrudCommand } from "../commands/scaffold-crud.js";
import { validateCommand } from "../commands/validate.js";
import { log } from "../utils/logger.js";

/** Every command that reads `simplix.config.ts`, with arguments that get it as far as the read. */
const COMMANDS: ReadonlyArray<readonly [string, Command, readonly string[]]> = [
  ["generated", generatedCommand, []],
  ["generated --all", generatedCommand, ["--all"]],
  ["generated --json", generatedCommand, ["--json"]],
  ["add-page", addPageCommand, ["static", "about", "--app", "web"]],
  ["scaffold", scaffoldCrudCommand, ["user", "--module", "editor"]],
  ["add-app", addAppCommand, ["demo", "--native", "--yes"]],
  ["add-domain", addDomainCommand, ["inventory", "--yes"]],
  ["add-module", addModuleCommand, ["editor", "--yes"]],
  ["openapi", openapiCommand, ["spec.json", "--yes"]],
  ["meta", metaCommand, []],
  ["kit-fence", kitFenceCommand, []],
  ["validate", validateCommand, []],
  ["i18n-codegen", i18nCodegenCommand, []],
];

describe("a simplix.config.ts that cannot be loaded", () => {
  let root: string;
  let cwd: string;
  let configPath: string;

  beforeEach(async () => {
    cwd = process.cwd();
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-config-error-")));
    configPath = join(root, "simplix.config.ts");
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "@acme/app" }));
    await mkdir(join(root, "modules"), { recursive: true });
    await writeFile(configPath, "throw new Error('config boom');\nexport default {};\n");
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    process.exitCode = undefined;
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it.each(COMMANDS)("simplix %s prints the file and the original error and exits 1", async (_name, command, args) => {
    const error = vi.spyOn(log, "error").mockImplementation(() => undefined);
    // A command that reached its own failure path would have run on defaults, which is the defect.
    vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit reached: the command ran past the config read");
    }) as never);

    await command.parseAsync(["node", "simplix", ...args]);

    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledTimes(1);
    const message = String(error.mock.calls[0]?.[0]);
    expect(message).toContain(configPath);
    expect(message).toContain("config boom");
  });
});
