import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import {
  GENERATED_PAGE_MARKER,
  loadProjectTemplates,
  PAGE_BLOCKS_TEMPLATE,
  PROJECT_TEMPLATE_DIR,
  templateFor,
} from "../utils/project-templates.js";

const made: string[] = [];
afterAll(async () => {
  for (const dir of made) await rm(dir, { recursive: true, force: true });
});

async function project(files: Record<string, string> = {}): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "simplix-templates-"));
  made.push(dir);
  if (Object.keys(files).length > 0) {
    await mkdir(join(dir, PROJECT_TEMPLATE_DIR), { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      await writeFile(join(dir, PROJECT_TEMPLATE_DIR, name), content, "utf-8");
    }
  }
  return dir;
}

describe("a project's own templates", () => {
  it("finds nothing where the directory is absent", async () => {
    expect((await loadProjectTemplates(await project())).size).toBe(0);
  });

  it("keys each template by the bundled one it replaces", async () => {
    const dir = await project({
      "crud-page.hbs": "project page",
      "page.blocks.hbs": "project blocks",
      "notes.md": "not a template",
    });
    const found = await loadProjectTemplates(dir);

    expect([...found.keys()].sort()).toEqual(["crud-page", PAGE_BLOCKS_TEMPLATE]);
    expect(templateFor(found, "crud-page", "bundled page")).toBe("project page");
  });

  it("falls through to the bundled template for a name the project has not taken over", async () => {
    const found = await loadProjectTemplates(await project({ "crud-page.hbs": "project page" }));
    expect(templateFor(found, "tree-crud-page", "bundled tree page")).toBe("bundled tree page");
  });

  it("names the marker a generated page declares itself by", () => {
    // The boundary an audit script reads: this string in a file means the generator owns it.
    expect(GENERATED_PAGE_MARKER).toBe("@simplix-generated");
  });
});
