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

/** Lays down a kit package at `dir` whose manifest names its template directory. */
async function kit(dir: string, name: string, templates: Record<string, string>): Promise<void> {
  await mkdir(join(dir, "templates"), { recursive: true });
  await writeFile(join(dir, "package.json"), JSON.stringify({ name, simplix: { templates: "templates" } }), "utf-8");
  for (const [file, content] of Object.entries(templates)) await writeFile(join(dir, "templates", file), content, "utf-8");
}

describe("a UI kit's templates, beneath the project's", () => {
  it("reads the kit a workspace package names in templates.from", async () => {
    const root = await project();
    await writeFile(join(root, "pnpm-workspace.yaml"), "packages:\n  - vendor/kits/*\n  - apps/*\n\ncatalog:\n  x: 1\n", "utf-8");
    await kit(join(root, "vendor/kits/clarity"), "@kits/clarity", { "crud-page.hbs": "kit page", "list.hbs": "kit list" });
    const found = await loadProjectTemplates(root, "@kits/clarity");
    expect(templateFor(found, "crud-page", "bundled")).toBe("kit page");
    expect(templateFor(found, "list", "bundled")).toBe("kit list");
  });

  it("lets the project's own template win over the kit's, name by name", async () => {
    const root = await project({ "crud-page.hbs": "project page" });
    await kit(join(root, "node_modules/@kits/clarity"), "@kits/clarity", { "crud-page.hbs": "kit page", "list.hbs": "kit list" });
    const found = await loadProjectTemplates(root, "@kits/clarity");
    expect(templateFor(found, "crud-page", "bundled")).toBe("project page");
    expect(templateFor(found, "list", "bundled")).toBe("kit list");
  });

  it("falls through to the bundled template for a name neither layer has", async () => {
    const root = await project();
    await kit(join(root, "node_modules/@kits/clarity"), "@kits/clarity", { "list.hbs": "kit list" });
    expect(templateFor(await loadProjectTemplates(root, "@kits/clarity"), "form", "bundled form")).toBe("bundled form");
  });

  it("finds the one root dependency that declares templates when nothing names a kit", async () => {
    const root = await project();
    await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { "@kits/clarity": "1.0.0", plain: "1.0.0" } }), "utf-8");
    await kit(join(root, "node_modules/@kits/clarity"), "@kits/clarity", { "detail.hbs": "kit detail" });
    await mkdir(join(root, "node_modules/plain"), { recursive: true });
    await writeFile(join(root, "node_modules/plain/package.json"), JSON.stringify({ name: "plain" }), "utf-8");
    expect(templateFor(await loadProjectTemplates(root), "detail", "bundled")).toBe("kit detail");
  });

  it("refuses two root dependencies that both declare templates", async () => {
    const root = await project();
    await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { "@kits/a": "1", "@kits/b": "1" } }), "utf-8");
    await kit(join(root, "node_modules/@kits/a"), "@kits/a", {});
    await kit(join(root, "node_modules/@kits/b"), "@kits/b", {});
    await expect(loadProjectTemplates(root)).rejects.toThrow(/templates.from/);
  });

  it("reads a path in templates.from as the template directory", async () => {
    const root = await project();
    await mkdir(join(root, "shared-templates"), { recursive: true });
    await writeFile(join(root, "shared-templates/form.hbs"), "path form", "utf-8");
    expect(templateFor(await loadProjectTemplates(root, "./shared-templates"), "form", "bundled")).toBe("path form");
  });

  it("refuses a templates.from that names no package", async () => {
    await expect(loadProjectTemplates(await project(), "@kits/missing")).rejects.toThrow(/neither installed/);
  });
});
