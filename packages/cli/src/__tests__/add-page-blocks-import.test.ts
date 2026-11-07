import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { importsPageBlocks, runAddPage } from "../commands/add-page.js";
import { regenerateNamed } from "../commands/generated.js";
import { withSilentLog } from "../utils/logger.js";

/** A page kind whose template imports its sibling departure file, as the kit's page kinds can. */
const TEMPLATE_DIR = ".simplix/templates";
const plainPage = "/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return null;\n}\n";
const pageWithBlocks = '/**\n * @simplix-generated page/static-page\n */\nimport { usePageBlocks } from "./page.blocks";\n\nexport function {{NamePascal}}Page() {\n  return usePageBlocks();\n}\n';

describe("a page kind whose page imports its blocks file", () => {
  let root: string;
  let cwd: string;
  const pagePath = () => join(root, "apps/web/src/pages/about/page.tsx");
  const blocksPath = () => join(root, "apps/web/src/pages/about/page.blocks.tsx");
  const exists = (path: string) => readFile(path, "utf-8").then(() => true, () => false);

  beforeEach(async () => {
    cwd = process.cwd();
    root = await mkdtemp(join(tmpdir(), "page-blocks-"));
    await writeFile(join(root, "simplix.config.ts"), "export default {};\n");
    await mkdir(join(root, TEMPLATE_DIR), { recursive: true });
    root = await realpath(root);
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  it("lays the blocks file down with the page, unasked, and keeps one already there", async () => {
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), pageWithBlocks);
    await withSilentLog(() => runAddPage("static", "about", { app: "web" }));
    expect(await readFile(blocksPath(), "utf-8")).toContain("usePageBlocks");
    const own = "export function usePageBlocks() {\n  return 1;\n}\n";
    await writeFile(blocksPath(), own);
    await withSilentLog(() => runAddPage("static", "about", { app: "web" }));
    expect(await readFile(blocksPath(), "utf-8")).toBe(own);
  });

  it("lays it down when a regeneration of the page alone starts importing it", async () => {
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), plainPage);
    await withSilentLog(() => runAddPage("static", "about", { app: "web" }));
    expect(await exists(blocksPath())).toBe(false);
    await writeFile(join(root, TEMPLATE_DIR, "static-page.hbs"), pageWithBlocks);
    await withSilentLog(() => regenerateNamed(root, [pagePath()]));
    expect(await readFile(pagePath(), "utf-8")).toContain('from "./page.blocks"');
    expect(await exists(blocksPath())).toBe(true);
  });

  it("reads the import in its quoted and extension-bearing spellings only", () => {
    expect(importsPageBlocks('import { usePageBlocks } from "./page.blocks";')).toBe(true);
    expect(importsPageBlocks("import { usePageBlocks } from './page.blocks.tsx';")).toBe(true);
    expect(importsPageBlocks('import { x } from "./page.blocks-old";')).toBe(false);
    expect(importsPageBlocks("// no page.blocks import here")).toBe(false);
  });
});
