import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { generatedCommand, generatedFailures, generatedReport, OriginConflictError, regenerateAll, regenerateNamed, unifiedOriginsOf, collectGenerated } from "../commands/generated.js";
import { renderOrigin } from "../utils/project-templates.js";

const TEMPLATES = ".simplix/templates";
const generated = (kind: string, body: string, suffix = "") =>
  `/**\n * @simplix-generated ${kind}\n */\nexport const Page${suffix} = "${body}";\n`;

/** A page of one app drawn by the `static-page` template and its two variants, with a frame beside it. */
describe("the files of one screen record different decisions", () => {
  let root: string;
  let cwd: string;
  const pagePath = () => join(root, "apps/web/src/pages/about/page.tsx");
  const storyPath = () => join(root, "stories/web-about.stories.tsx");
  const stampOf = async (path: string) => renderOrigin(await readFile(path, "utf-8"))?.join(" ");
  /** Rewrites a file's stamp line to name another origin; the fingerprint does not read that line. */
  const record = async (path: string, origin: string) => {
    const text = await readFile(path, "utf-8");
    await writeFile(path, text.replace(/(@simplix-render [0-9a-f]{12}) .*/, `$1 ${origin}`));
  };

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "simplix-origins-"));
    await writeFile(join(root, "simplix.config.ts"), 'export default { templates: { storiesDir: "stories" } };\n');
    await mkdir(join(root, TEMPLATES), { recursive: true });
    await mkdir(join(root, "stories"));
    await writeFile(join(root, TEMPLATES, "static-page.hbs"), generated("page/static-page", "plain"));
    await writeFile(join(root, TEMPLATES, "static-page.wide.hbs"), generated("page/static-page", "wide"));
    await writeFile(join(root, TEMPLATES, "static-page.narrow.hbs"), generated("page/static-page", "narrow"));
    await writeFile(join(root, TEMPLATES, "static-page.stories.hbs"), generated("story/static-page", "story-plain", "Story"));
    await writeFile(join(root, TEMPLATES, "static-page.wide.stories.hbs"), generated("story/static-page", "story-wide", "Story"));
    await writeFile(join(root, TEMPLATES, "static-page.narrow.stories.hbs"), generated("story/static-page", "story-narrow", "Story"));
    root = await realpath(root);
    process.chdir(root);
    await runAddPage("static", "about", { app: "web" });
  });

  afterEach(async () => {
    process.chdir(cwd);
    process.exitCode = undefined;
    await rm(root, { recursive: true, force: true });
  });

  it("renders the screen once with the decision any of its files records, and stamps every file with it", async () => {
    await record(pagePath(), "add-page static-page about --app web --variant wide");
    const { disagreements } = unifiedOriginsOf((await collectGenerated(root)).held);
    expect(disagreements).toMatchObject([{ flag: "--variant", kind: "missing", chosen: "wide" }]);
    // Given the root, the files are named by their paths from it.
    const named = unifiedOriginsOf((await collectGenerated(root)).held, root).disagreements[0];
    expect(named.recorded.map((entry) => entry.files)).toEqual([["stories/web-about.stories.tsx"], ["apps/web/src/pages/about/page.tsx"]]);
    // Stale before the run: the frame is untouched, and the screen's decision draws it another way.
    expect((await generatedReport(root)).find((entry) => entry.path.endsWith("web-about.stories.tsx"))?.state).toBe("stale");

    const { origins } = await regenerateAll(root);

    expect(origins).toEqual(["add-page static-page about --app web --variant wide"]);
    expect(await readFile(pagePath(), "utf-8")).toContain('"wide"');
    expect(await readFile(storyPath(), "utf-8")).toContain('"story-wide"');
    expect(await stampOf(pagePath())).toBe("add-page static-page about --app web --variant wide");
    expect(await stampOf(storyPath())).toBe("add-page static-page about --app web --variant wide");
    expect(unifiedOriginsOf((await collectGenerated(root)).held).disagreements).toEqual([]);
  });

  it("renders a named file with the decision its siblings record", async () => {
    await record(storyPath(), "add-page static-page about --app web --variant wide");
    const { origins } = await regenerateNamed(root, [pagePath()]);
    expect(origins).toEqual(["add-page static-page about --app web --variant wide"]);
    expect(await readFile(pagePath(), "utf-8")).toContain('"wide"');
  });

  it("reports the disagreement and fails a plain report only for a conflict", async () => {
    await record(pagePath(), "add-page static-page about --app web --variant wide");
    const missing = unifiedOriginsOf((await collectGenerated(root)).held).disagreements;
    expect(generatedFailures([], { check: false, conflicted: false, origins: missing })).toEqual([]);
    expect(generatedFailures([], { check: true, conflicted: false, origins: missing })).toHaveLength(1);

    await record(storyPath(), "add-page static-page about --app web --variant narrow");
    const conflict = unifiedOriginsOf((await collectGenerated(root)).held).disagreements;
    expect(conflict).toMatchObject([{ flag: "--variant", kind: "conflict" }]);
    expect(generatedFailures([], { check: false, conflicted: false, origins: conflict })[0]).toMatch(/files disagree on --variant/);
  });

  it("refuses a regeneration over a conflict and writes nothing", async () => {
    await record(pagePath(), "add-page static-page about --app web --variant wide");
    await record(storyPath(), "add-page static-page about --app web --variant narrow");
    const before = [await readFile(pagePath(), "utf-8"), await readFile(storyPath(), "utf-8")];

    await expect(regenerateAll(root)).rejects.toBeInstanceOf(OriginConflictError);
    await expect(regenerateNamed(root, [pagePath()])).rejects.toBeInstanceOf(OriginConflictError);
    expect([await readFile(pagePath(), "utf-8"), await readFile(storyPath(), "utf-8")]).toEqual(before);

    await generatedCommand.parseAsync(["node", "simplix", "--all"]);
    expect(process.exitCode).toBe(1);
    expect([await readFile(pagePath(), "utf-8"), await readFile(storyPath(), "utf-8")]).toEqual(before);
  });
});
