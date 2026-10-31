import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { ensurePageEntrypoints } from "../commands/scaffold-crud.js";

const made: string[] = [];
afterEach(async () => {
  for (const dir of made.splice(0)) await rm(dir, { recursive: true, force: true });
});

/** A module as `add-module` writes it: three exports, three tsup entries, no pages. */
async function moduleDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "add-page-entry-"));
  made.push(dir);
  await mkdir(join(dir, "src"), { recursive: true });
  await writeFile(join(dir, "package.json"), JSON.stringify({ name: "m", exports: { ".": { source: "./src/index.ts" } } }));
  await writeFile(join(dir, "tsup.config.ts"), 'entry: {\n    "widgets/index": "src/widgets/index.ts",\n  },\n');
  return dir;
}

describe("ensurePageEntrypoints", () => {
  it("exposes a page add-page wrote through the module's package", async () => {
    const dir = await moduleDir();
    await ensurePageEntrypoints(dir, "my-credits", "MyCreditsPage");

    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
    expect(pkg.exports["./pages"]).toEqual({ source: "./src/pages/index.ts", types: "./src/pages/index.ts", import: "./dist/pages/index.js" });
    expect(await readFile(join(dir, "tsup.config.ts"), "utf8")).toContain('"pages/index": "src/pages/index.ts"');
    const index = await readFile(join(dir, "src/pages/index.ts"), "utf8");
    expect(index).toContain('import "../locales";');
    expect(index).toContain('export { MyCreditsPage } from "./my-credits/page";');
  });

  it("writes each line once when run again", async () => {
    const dir = await moduleDir();
    await ensurePageEntrypoints(dir, "my-credits", "MyCreditsPage");
    await ensurePageEntrypoints(dir, "my-credits", "MyCreditsPage");
    const index = await readFile(join(dir, "src/pages/index.ts"), "utf8");
    expect(index.match(/MyCreditsPage/g)).toHaveLength(1);
  });
});
