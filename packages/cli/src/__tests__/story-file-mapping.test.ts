import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { inferStoryOrigin, runAdopt } from "../commands/generated-adopt.js";
import { generatedReport, regenerateAll } from "../commands/generated.js";
import { storyFileFor, storyKeyFor } from "../utils/story-file.js";

const TEMPLATE_DIR = ".simplix/templates";
const page = (body: string) => `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "${body}";\n}\n`;
const story = (body: string) =>
  `/**\n * @simplix-generated story/static-page\n */\nexport default { title: "Generated/{{storyTitle}}" };\n\nexport const Story = "${body}";\n`;
/** A frame the board drew by hand, under a name and an id of its own. */
const handFrame = `// The about frame, drawn for the board.\nexport default { id: "board-about-us", title: "Board/About us" };\n\nexport const Story = "drawn";\n`;

describe("a story mapped onto the board's own frame", () => {
  let root: string;
  let cwd: string;
  const frame = () => join(root, "stories/about-us.stories.tsx");

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "simplix-story-map-"));
    await writeFile(
      join(root, "simplix.config.ts"),
      'export default { templates: { storiesDir: "stories", story: { id: "board-{entity}", title: "Board/{Entity}", files: { "web-about": "about-us.stories.tsx" } } } };\n',
    );
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    await mkdir(join(root, "stories"));
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), page("v1"));
    await writeFile(join(root, TEMPLATE_DIR, "static-page.stories.hbs"), story("s1"));
    await writeFile(join(root, "stories/about-us.stories.tsx"), handFrame);
    root = await realpath(root);
    process.chdir(root);
    await runAddPage("static", "about", { app: "web" });
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  it("writes no second frame and leaves the board's frame as it was", async () => {
    expect(await readdir(join(root, "stories"))).toEqual(["about-us.stories.tsx"]);
    expect(await readFile(frame(), "utf-8")).toBe(handFrame);
  });

  it("adopts the frame with a merge base, so a template change merges into it", async () => {
    expect(await runAdopt(root, [frame()], { yes: true })).toBe(0);
    const adopted = await readFile(frame(), "utf-8");
    expect(adopted).toContain("@simplix-generated story/static-page");
    expect(adopted).toContain("@simplix-render");
    expect(adopted).toContain(handFrame);
    const entry = (await generatedReport(root)).find((one) => one.path.endsWith("about-us.stories.tsx"));
    expect(entry).toMatchObject({ state: "edited", merge: "current" });

    await writeFile(join(root, TEMPLATE_DIR, "static-page.stories.hbs"), story("s2"));
    await regenerateAll(root);
    expect(await readdir(join(root, "stories"))).toEqual(["about-us.stories.tsx"]);
    const after = (await generatedReport(root)).find((one) => one.path.endsWith("about-us.stories.tsx"));
    expect(after?.merge).not.toBe("no-base");
  });
});

describe("storyFileFor", () => {
  it("names the mapped file, else the default", () => {
    const naming = { files: { "background-job": "jobs.stories.tsx" } };
    expect(storyFileFor(naming, "background-job", "background-job.stories.tsx")).toBe("jobs.stories.tsx");
    expect(storyFileFor(naming, "user-role", "user-role.stories.tsx")).toBe("user-role.stories.tsx");
    expect(storyFileFor(undefined, "x", "x.stories.tsx")).toBe("x.stories.tsx");
  });

  it("refuses a name that is not a story file inside the stories directory", () => {
    expect(() => storyFileFor({ files: { a: "../a.stories.tsx" } }, "a", "a.stories.tsx")).toThrow(/templates\.story\.files/);
    expect(() => storyFileFor({ files: { a: "a.tsx" } }, "a", "a.stories.tsx")).toThrow(/\.stories\.tsx/);
  });

  it("reads the key back from a file name only when one key maps to it", () => {
    expect(storyKeyFor({ files: { a: "f.stories.tsx" } }, "f.stories.tsx")).toBe("a");
    expect(storyKeyFor({ files: { a: "f.stories.tsx", b: "f.stories.tsx" } }, "f.stories.tsx")).toBeUndefined();
  });
});

describe("inferStoryOrigin with a mapped frame", () => {
  const sources = [{ file: "/w/list.tsx", origin: "scaffold background-job --module admin/jobs" }];
  const pattern = { id: "backoffice-{entity}", title: "Back office/{Entity}", files: { "background-job": "jobs.stories.tsx" } };

  it("takes the entity from the mapping whatever id and title the board gave the frame", () => {
    const text = 'const meta = { id: "backoffice-jobs", title: "Back office/Operations/Jobs" };';
    expect(inferStoryOrigin({ file: "/s/jobs.stories.tsx", text, sources, pattern })).toEqual({ origin: "scaffold background-job --module admin/jobs" });
  });

  it("names the mapped file when the pattern points a frame at the default one", () => {
    const text = 'const meta = { id: "backoffice-background-job" };';
    expect(inferStoryOrigin({ file: "/s/background-job.stories.tsx", text, sources, pattern })).toEqual({
      manual: 'its id or title names "background-job", but scaffold writes that entity\'s story to jobs.stories.tsx',
    });
  });
});
