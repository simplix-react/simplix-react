import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { generatedReport, regenerateAll } from "../commands/generated.js";
import { shareReport } from "../commands/generated-share.js";
import { runAddPage } from "../commands/add-page.js";
import { captureWrites, writeFileWithDir } from "../utils/fs.js";

const TEMPLATE_DIR = ".simplix/templates";
const page = (body: string) => `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "${body}";\n}\n`;

describe("generated-state report", () => {
  let root: string;
  let cwd: string;
  const pagePath = () => join(root, "apps/web/src/pages/about/page.tsx");
  const setTemplate = (body: string) => writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), page(body));
  const basePath = () => join(root, ".simplix/generated/apps/web/src/pages/about/page.tsx");
  const setStory = (body: string) =>
    writeFile(
      join(root, TEMPLATE_DIR, "static-page.stories.hbs"),
      `/**\n * @simplix-generated story/static-page\n */\nexport default { title: "{{storyTitle}}" };\n\nexport const Story = "${body}";\n\nexport const Frame = {};\n`,
    );

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "simplix-generated-"));
    // A story directory is configured throughout; only the story test supplies a story template.
    await writeFile(join(root, "simplix.config.ts"), 'export default { templates: { storiesDir: "stories" } };\n');
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    await mkdir(join(root, "stories"));
    await setTemplate("v1");
    // The roots the generators resolve against are the real paths the OS reports for the cwd.
    root = await realpath(root);
    process.chdir(root);
    await runAddPage("static", "about", { app: "web" });
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  it("records the command that laid a file down after its fingerprint", async () => {
    expect(await readFile(pagePath(), "utf-8")).toMatch(/@simplix-render [0-9a-f]{12} add-page static-page about --app web/);
  });

  it("reports an untouched file as untouched while the template still renders it", async () => {
    expect(await generatedReport(root)).toEqual([
      { path: "apps/web/src/pages/about/page.tsx", state: "untouched", origin: "add-page static-page about --app web" },
    ]);
  });

  it("reports an untouched file as stale once the template changes, and --all rewrites it", async () => {
    await setTemplate("v2");
    const before = await readFile(pagePath(), "utf-8");
    expect((await generatedReport(root))[0]?.state).toBe("stale");
    // The report itself writes nothing.
    expect(await readFile(pagePath(), "utf-8")).toBe(before);
    await regenerateAll(root);
    expect(await readFile(pagePath(), "utf-8")).toContain('"v2"');
    expect((await generatedReport(root))[0]?.state).toBe("untouched");
  });

  it("merges a template change into an edited file and keeps the edits", async () => {
    await writeFile(pagePath(), (await readFile(pagePath(), "utf-8")) + "export const extra = 1;\n");
    await setTemplate("v2");
    expect((await generatedReport(root))[0]).toMatchObject({ state: "edited", merge: "merged" });
    const { writes } = await regenerateAll(root);
    expect(writes.find((w) => w.path.endsWith("about/page.tsx"))?.outcome).toBe("merged");
    const merged = await readFile(pagePath(), "utf-8");
    expect(merged).toContain('"v2"');
    expect(merged).toContain("export const extra = 1;");
    // The new render is the base now, so the next run has nothing left to merge.
    expect(await readFile(basePath(), "utf-8")).toContain('"v2"');
    expect((await generatedReport(root))[0]).toMatchObject({ state: "edited", merge: "current" });
  });

  it("reports a conflicting edit with its hunks and leaves the file alone", async () => {
    const edited = (await readFile(pagePath(), "utf-8")).replace('"v1"', '"customised"');
    await writeFile(pagePath(), edited);
    await setTemplate("v2");
    const [entry] = await generatedReport(root);
    expect(entry).toMatchObject({ state: "edited", merge: "conflict" });
    expect(entry?.hunks?.[0]).toMatch(/<<<<<<< edited\n[\s\S]*"customised"[\s\S]*=======\n[\s\S]*"v2"[\s\S]*>>>>>>> template/);
    const { writes } = await regenerateAll(root);
    expect(writes.find((w) => w.path.endsWith("about/page.tsx"))?.outcome).toBe("conflict");
    expect(await readFile(pagePath(), "utf-8")).toBe(edited);
    await regenerateAll(root, true);
    expect(await readFile(pagePath(), "utf-8")).toContain("<<<<<<< edited");
  });

  it("reports an edited file with no stored base as no-base and keeps it", async () => {
    const edited = (await readFile(pagePath(), "utf-8")) + "export const extra = 1;\n";
    await writeFile(pagePath(), edited);
    await rm(join(root, ".simplix/generated"), { recursive: true });
    await setTemplate("v2");
    expect((await generatedReport(root))[0]).toMatchObject({ state: "edited", merge: "no-base" });
    await regenerateAll(root);
    expect(await readFile(pagePath(), "utf-8")).toBe(edited);
  });

  it("bootstraps the base of an edited file whose fingerprint the current templates reproduce", async () => {
    await writeFile(pagePath(), (await readFile(pagePath(), "utf-8")) + "export const extra = 1;\n");
    await rm(join(root, ".simplix/generated"), { recursive: true });
    await regenerateAll(root);
    expect(await readFile(basePath(), "utf-8")).toContain('"v1"');
    await setTemplate("v2");
    await regenerateAll(root);
    expect(await readFile(pagePath(), "utf-8")).toMatch(/"v2"[\s\S]*export const extra = 1;/);
  });

  it("merges a template change into an edited story the same way", async () => {
    await setStory("s1");
    await runAddPage("static", "about", { app: "web" });
    const story = join(root, "stories/web-about.stories.tsx");
    await writeFile(story, (await readFile(story, "utf-8")) + "export const Extra = {};\n");
    await setStory("s2");
    const { writes } = await regenerateAll(root);
    expect(writes.find((w) => w.path === story)?.outcome).toBe("merged");
    expect(await readFile(story, "utf-8")).toMatch(/"s2"[\s\S]*export const Extra = \{\};/);
    // A conflicting edit to the story is reported and left alone.
    const conflicting = (await readFile(story, "utf-8")).replace('"s2"', '"mine"');
    await writeFile(story, conflicting);
    await setStory("s3");
    expect((await regenerateAll(root)).writes.find((w) => w.path === story)?.outcome).toBe("conflict");
    expect(await readFile(story, "utf-8")).toBe(conflicting);
  });

  it("reports a file stamped without an origin as unchecked", async () => {
    const text = (await readFile(pagePath(), "utf-8")).replace(/ add-page static-page about --app web/, "");
    await writeFile(pagePath(), text);
    expect((await generatedReport(root))[0]?.state).toBe("unchecked");
  });
});

describe("block share report", () => {
  let root: string;
  let cwd: string;

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "simplix-share-"));
    await writeFile(join(root, "simplix.config.ts"), "export default {};\n");
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), page("v1"));
    process.chdir(root);
    for (const name of ["about", "contact", "terms"]) await runAddPage("static", name, { app: "web" });
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  const edit = async (name: string, line: string) => {
    const file = join(root, `apps/web/src/pages/${name}/page.tsx`);
    await writeFile(file, (await readFile(file, "utf-8")) + line + "\n");
  };

  it("counts customised lines against the render and flags a customisation two screens repeat", async () => {
    await edit("about", "export const AboutBanner = useNotice(\"about\", { tone: \"info\" });");
    await edit("contact", "export const ContactBanner = useNotice(\"contact\", { tone: \"info\" });");
    await edit("terms", "export const termsOnlyThing = renderTheTermsOnce(\"terms-v3\");");
    const kept = new Map<string, string>();
    const { screens, recurring } = await shareReport(await realpath(root), await generatedReport(root, true, kept), kept);
    const about = screens.find((s) => s.screen === "about");
    expect(about?.customised).toBe(1);
    expect(about?.generated).toBeGreaterThan(0);
    expect(screens.find((s) => s.screen === "terms")?.customised).toBe(1);
    expect(screens.every((s) => s.blocks === 0)).toBe(true);
    expect(recurring).toEqual([
      { line: 'export const <entity>Banner = useNotice("<entity>", { tone: "info" });', screens: ["about", "contact"] },
    ]);
  });

  it("reports an untouched screen as wholly generated", async () => {
    const kept = new Map<string, string>();
    const { screens, recurring } = await shareReport(await realpath(root), await generatedReport(root, true, kept), kept);
    expect(screens.every((s) => s.customised === 0 && s.share === 0)).toBe(true);
    expect(recurring).toEqual([]);
  });
});

describe("captureWrites", () => {
  it("records writes instead of making them", async () => {
    const target = join(tmpdir(), `simplix-capture-${Date.now()}.txt`);
    const sink = await captureWrites(() => writeFileWithDir(target, "x"));
    expect(sink.get(target)).toBe("x");
    await expect(readFile(target, "utf-8")).rejects.toThrow();
  });
});
