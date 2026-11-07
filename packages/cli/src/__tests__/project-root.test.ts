import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { failOnConfigError } from "../config/report-config-error.js";
import { findProjectRoot, ProjectRootError, requireProjectRoot, rootFlagOf, setProjectRootOverride } from "../utils/fs.js";

/**
 * A repository holding a simplix-react project beside another pnpm workspace that is not one (a
 * desktop app with its own Storybook): a command run from inside the app must not take the app's
 * workspace for the project.
 */
let repo: string;

beforeEach(async () => {
  repo = await realpath(await mkdtemp(join(tmpdir(), "project-root-")));
  await mkdir(join(repo, "web", "modules", "admin"), { recursive: true });
  await writeFile(join(repo, "web", "simplix.config.ts"), "export default {};\n");
  await writeFile(join(repo, "web", "pnpm-workspace.yaml"), "packages:\n  - modules/*/*\n");
  await mkdir(join(repo, "app", "apps", "storybook"), { recursive: true });
  await writeFile(join(repo, "app", "pnpm-workspace.yaml"), "packages:\n  - apps/*\n");
});

afterEach(async () => {
  setProjectRootOverride(undefined);
  await rm(repo, { recursive: true, force: true });
});

describe("the root of a command that reads the project's config", () => {
  it("is the nearest directory holding simplix.config.ts", async () => {
    expect(await requireProjectRoot(join(repo, "web", "modules", "admin"))).toBe(join(repo, "web"));
  });

  it("is never a sibling workspace with no config: the run fails with one line naming the directory and the flag", async () => {
    const from = join(repo, "app", "apps", "storybook");
    const refused = await requireProjectRoot(from).then(
      () => undefined,
      (err: unknown) => err,
    );
    expect(refused).toBeInstanceOf(ProjectRootError);
    expect((refused as Error).message).toBe(
      `No simplix.config.ts in ${from} or any directory above it: run simplix inside the project, or name its root with --root <dir>.`,
    );
    expect((refused as Error).message).not.toContain("\n");
    const exitCode = process.exitCode;
    expect(failOnConfigError(refused)).toBe(true);
    process.exitCode = exitCode;
  });

  it("is the directory --root names, from anywhere", async () => {
    setProjectRootOverride(join(repo, "web"));
    expect(await requireProjectRoot(join(repo, "app", "apps", "storybook"))).toBe(join(repo, "web"));
    expect(await findProjectRoot(join(repo, "app", "apps", "storybook"))).toBe(join(repo, "web"));
  });
});

describe("the root of a command that also works before a config exists", () => {
  it("prefers a config at any distance over a nearer workspace file nested in the project", async () => {
    await mkdir(join(repo, "web", "tools", "inner", "src"), { recursive: true });
    await writeFile(join(repo, "web", "tools", "inner", "pnpm-workspace.yaml"), "packages: []\n");
    expect(await findProjectRoot(join(repo, "web", "tools", "inner", "src"))).toBe(join(repo, "web"));
  });

  it("falls back to the nearest workspace file where no config exists", async () => {
    expect(await findProjectRoot(join(repo, "app", "apps", "storybook"))).toBe(join(repo, "app"));
  });
});

describe("the --root flag on a command line", () => {
  it("is read in either spelling wherever it stands, and not past --", () => {
    expect(rootFlagOf(["generated", "--root", "../web", "--all"])).toBe("../web");
    expect(rootFlagOf(["--root=../web", "cycles"])).toBe("../web");
    expect(rootFlagOf(["generated", "--", "--root", "x"])).toBeUndefined();
    expect(rootFlagOf(["generated", "--all"])).toBeUndefined();
  });
});
