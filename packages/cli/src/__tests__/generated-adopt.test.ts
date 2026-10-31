import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { applyAdopt, inferStoryOrigin, planAdopt, runAdopt } from "../commands/generated-adopt.js";
import { generatedReport, regenerateAll } from "../commands/generated.js";
import { carryStamp } from "../utils/project-templates.js";

const TEMPLATE_DIR = ".simplix/templates";
const page = (body: string) => `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "${body}";\n}\n`;
const story = (body: string) =>
  `/**\n * @simplix-generated story/static-page\n */\nexport default { title: "Generated/{{storyTitle}}" };\n\nexport const Story = "${body}";\n\nexport const Frame = {};\n`;

describe("simplix generated --adopt", () => {
  let root: string;
  let cwd: string;
  const pagePath = () => join(root, "apps/web/src/pages/about/page.tsx");
  const storyPath = () => join(root, "stories/web-about.stories.tsx");
  const basePath = (rel: string) => join(root, ".simplix/generated", rel);
  const setTemplate = (body: string) => writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), page(body));
  const setStory = (body: string) => writeFile(join(root, TEMPLATE_DIR, "static-page.stories.hbs"), story(body));
  const noBase = () => rm(join(root, ".simplix/generated"), { recursive: true, force: true });
  const edit = async (file: string, line: string) => writeFile(file, (await readFile(file, "utf-8")) + line + "\n");

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "simplix-adopt-"));
    await writeFile(join(root, "simplix.config.ts"), 'export default { templates: { storiesDir: "stories", story: { id: "board-{entity}", title: "Board/{Entity}" } } };\n');
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    await mkdir(join(root, "stories"));
    await setTemplate("v1");
    await setStory("s1");
    root = await realpath(root);
    process.chdir(root);
    await runAddPage("static", "about", { app: "web" });
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  it("records the current render as the base of an edited file, so the next template change merges into it", async () => {
    await edit(pagePath(), "export const extra = 1;");
    await noBase();
    await setTemplate("v2");
    expect((await generatedReport(root))[0]).toMatchObject({ merge: "no-base" });

    const [item] = await planAdopt(root, [pagePath()]);
    expect(item?.refusal).toBeUndefined();
    expect(item).toMatchObject({ origin: "add-page static-page about --app web", inferred: false });
    // The reader sees the render the file is read against, and the edit it keeps.
    expect(item?.diff).toContain('-  return "v2";');
    expect(item?.diff).toContain('+  return "v1";');
    expect(item?.diff).toContain("+export const extra = 1;");

    // The reader finds the template change the file lacks and brings it in, then adopts what is left.
    await writeFile(pagePath(), (await readFile(pagePath(), "utf-8")).replace('"v1"', '"v2"'));
    const [reviewed] = await planAdopt(root, [pagePath()]);
    expect(reviewed?.diff).not.toMatch(/^[-+]\s+return/m);
    expect(reviewed?.diff).toContain("+export const extra = 1;");

    expect(await runAdopt(root, [pagePath()], { yes: true })).toBe(0);
    expect(await readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).toContain('"v2"');
    // The edits are untouched, and the file now reads as laid down from the base it was adopted against.
    const adopted = await readFile(pagePath(), "utf-8");
    expect(adopted).toContain("export const extra = 1;");
    expect((await generatedReport(root))[0]).toMatchObject({ state: "edited", merge: "current" });

    await setTemplate("v3");
    const { writes } = await regenerateAll(root);
    expect(writes.find((w) => w.path === pagePath())?.outcome).toBe("merged");
    expect(await readFile(pagePath(), "utf-8")).toMatch(/"v3"[\s\S]*export const extra = 1;/);
  });

  it("prints the diff and records nothing without a confirmation", async () => {
    await edit(pagePath(), "export const extra = 1;");
    await noBase();
    await setTemplate("v2");
    // No --yes, no terminal and no prompt: the vitest process has no TTY.
    expect(await runAdopt(root, [pagePath()], { yes: false, confirm: undefined })).toBe(1);
    await expect(readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).rejects.toThrow();
    expect(await runAdopt(root, [pagePath()], { yes: false, confirm: async () => false })).toBe(1);
    await expect(readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).rejects.toThrow();
    expect(await runAdopt(root, [pagePath()], { yes: false, confirm: async () => true })).toBe(0);
    expect(await readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).toContain('"v2"');
  });

  it("adopts a file that already matches its render, and says so with an empty diff", async () => {
    await edit(pagePath(), "export const extra = 1;");
    await noBase();
    // The stamp is the only difference once the extra line is gone: restore the render, keep the stale stamp.
    await setTemplate("v2");
    const text = (await readFile(pagePath(), "utf-8")).replace('"v1"', '"v2"').replace("export const extra = 1;\n", "");
    await writeFile(pagePath(), text);
    const [item] = await planAdopt(root, [pagePath()]);
    expect(item?.refusal).toBeUndefined();
    expect(item?.diff).toBe("");
  });

  it("refuses an untouched file, a file that already has a base and a file the generator did not write", async () => {
    const [untouched] = await planAdopt(root, [pagePath()]);
    expect(untouched?.refusal).toMatch(/untouched/);

    await edit(pagePath(), "export const extra = 1;");
    const [hasBase] = await planAdopt(root, [pagePath()]);
    expect(hasBase?.refusal).toMatch(/already has a base/);

    const plain = join(root, "plain.ts");
    await writeFile(plain, "export const plain = 1;\n");
    expect((await planAdopt(root, [plain]))[0]?.refusal).toMatch(/not a generated file/);
    expect((await planAdopt(root, [join(root, "missing.ts")]))[0]?.refusal).toMatch(/no such file/);
  });

  it("refuses a file with no origin to render from and records nothing", async () => {
    await edit(pagePath(), "export const extra = 1;");
    await noBase();
    await writeFile(pagePath(), (await readFile(pagePath(), "utf-8")).replace(/ add-page static-page about --app web/, ""));
    expect((await generatedReport(root))[0]).toMatchObject({ state: "edited", merge: "no-origin" });
    const [item] = await planAdopt(root, [pagePath()]);
    expect(item?.refusal).toMatch(/^manual: it records no origin/);
    expect(await runAdopt(root, [pagePath()], { yes: true })).toBe(1);
    await expect(readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).rejects.toThrow();
  });

  it("writes the origin of a story stamped without one when its file and title name the page that made it", async () => {
    await runAddPage("static", "about", { app: "web" });
    const stamped = (await readFile(storyPath(), "utf-8")).replace(/^ \* @simplix-render .*\n/m, "");
    expect(stamped).not.toContain("@simplix-render");
    await writeFile(storyPath(), stamped + "export const Extra = {};\n");
    await noBase();
    await setStory("s2");
    expect((await generatedReport(root)).find((e) => e.path === "stories/web-about.stories.tsx")).toMatchObject({ state: "edited", merge: "no-origin" });

    const [item] = await planAdopt(root, [storyPath()]);
    expect(item?.refusal).toBeUndefined();
    expect(item).toMatchObject({ origin: "add-page static-page about --app web", inferred: true });
    expect(item?.diff).toContain('-export const Story = "s2";');
    await writeFile(storyPath(), (await readFile(storyPath(), "utf-8")).replace('"s1"', '"s2"'));
    expect(await runAdopt(root, [storyPath()], { yes: true })).toBe(0);

    const held = await readFile(storyPath(), "utf-8");
    expect(held).toMatch(/@simplix-render [0-9a-f]{12} add-page static-page about --app web/);
    expect(held).toContain("export const Extra = {};");
    expect((await generatedReport(root)).find((e) => e.path === "stories/web-about.stories.tsx")).toMatchObject({ state: "edited", merge: "current" });

    await setStory("s3");
    await regenerateAll(root);
    expect(await readFile(storyPath(), "utf-8")).toMatch(/"s3"[\s\S]*export const Extra = \{\};/);
  });

  it("applyAdopt skips a refused item", async () => {
    const [refused] = await planAdopt(root, [pagePath()]);
    await applyAdopt([refused!]);
    await expect(readFile(basePath("apps/web/src/pages/about/page.tsx"), "utf-8")).resolves.toContain("v1");
  });
});

describe("inferStoryOrigin", () => {
  const pattern = { id: "board-{entity}", title: "Board/{Entity}" };
  const sources = [
    { file: "/p/modules/admin/src/widgets/user-account/list.tsx", origin: "scaffold user-account --module admin" },
    { file: "/p/modules/admin/src/widgets/user-account/form.tsx", origin: "scaffold user-account --module admin" },
    { file: "/p/modules/admin/src/pages/job-position/crud-page.tsx", origin: "scaffold job-position --module admin" },
    { file: "/p/apps/web/src/pages/sign-in/page.tsx", origin: "add-page auth-page sign-in --app web" },
    { file: "/p/modules/self/src/pages/my-profile/page.tsx", origin: "add-page static-page my-profile --module self" },
  ];
  const story = (file: string, meta: string) => ({ file: `/p/stories/${file}`, text: `/** @simplix-generated story/x */\nconst meta = {\n${meta}\n};\n`, sources, pattern });

  it("reads the entity from the id pattern and finds the module that scaffolded it", () => {
    expect(inferStoryOrigin(story("user-account.stories.tsx", '  id: "board-user-account",\n  title: "Board/People/Accounts",'))).toEqual({
      origin: "scaffold user-account --module admin",
    });
  });

  it("reads the entity from the title pattern, in Pascal case", () => {
    expect(inferStoryOrigin(story("job-position.stories.tsx", '  title: "Board/JobPosition",'))).toEqual({ origin: "scaffold job-position --module admin" });
  });

  it("reports manual when the id and the title name different entities, or the file is named otherwise", () => {
    expect(inferStoryOrigin(story("user-account.stories.tsx", '  id: "board-user-account",\n  title: "Board/JobPosition",'))).toMatchObject({ manual: expect.stringContaining("different entities") });
    expect(inferStoryOrigin(story("accounts.stories.tsx", '  id: "board-user-account",'))).toMatchObject({ manual: expect.stringContaining("user-account.stories.tsx") });
  });

  it("reports manual when two modules scaffolded the entity, or none did", () => {
    const twice = [...sources, { file: "/p/modules/other/src/widgets/user-account/list.tsx", origin: "scaffold user-account --module other" }];
    expect(inferStoryOrigin({ ...story("user-account.stories.tsx", '  id: "board-user-account",'), sources: twice })).toMatchObject({ manual: expect.stringContaining("more than one origin") });
    expect(inferStoryOrigin(story("order.stories.tsx", '  id: "board-order",'))).toMatchObject({ manual: expect.stringContaining('"scaffold order"') });
  });

  it("finds the page whose story file and title it is", () => {
    expect(inferStoryOrigin(story("web-sign-in.stories.tsx", '  title: "Generated/Web/SignIn",'))).toEqual({ origin: "add-page auth-page sign-in --app web" });
    expect(inferStoryOrigin(story("my-profile.stories.tsx", '  title: "Generated/MyProfile",'))).toEqual({ origin: "add-page static-page my-profile --module self" });
  });

  it("reports manual for a story no pattern and no page explains", () => {
    expect(inferStoryOrigin(story("web-sign-in.stories.tsx", '  title: "Generated/Web/Login",'))).toHaveProperty("manual");
    expect(inferStoryOrigin(story("notes.stories.tsx", '  title: "Notes",'))).toHaveProperty("manual");
    expect(inferStoryOrigin({ ...story("web-sign-in.stories.tsx", '  title: "Generated/Web/SignIn",'), pattern: undefined, sources: [] })).toHaveProperty("manual");
  });
});

describe("carryStamp", () => {
  const stamp = " * @simplix-render aaaaaaaaaaaa add-page static-page about --app web";
  const render = `/**\n * @simplix-generated page/static-page\n${stamp}\n */\nconst a = 1;\n`;

  it("replaces the fingerprint line of an edited file", () => {
    const held = "/**\n * @simplix-generated page/static-page\n * @simplix-render bbbbbbbbbbbb add-page static-page about --app web\n */\nconst a = 2;\n";
    expect(carryStamp(held, render)).toBe(`/**\n * @simplix-generated page/static-page\n${stamp}\n */\nconst a = 2;\n`);
  });

  it("puts the line under the marker of a file that has none", () => {
    expect(carryStamp("/**\n * @simplix-generated page/static-page\n */\nconst a = 2;\n", render)).toBe(`/**\n * @simplix-generated page/static-page\n${stamp}\n */\nconst a = 2;\n`);
  });

  it("returns the file as it is when either side carries no stamp or marker", () => {
    expect(carryStamp("const a = 2;\n", render)).toBe("const a = 2;\n");
    expect(carryStamp("/** @simplix-generated x */\n", "const a = 1;\n")).toBe("/** @simplix-generated x */\n");
  });
});
