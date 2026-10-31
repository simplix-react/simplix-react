import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { insertMenuEntry, menuTemplateOf, routePathOf, writeRoute } from "../utils/route-files.js";

describe("a list screen's route path", () => {
  it("is the entity's plural in kebab case unless the target names another", () => {
    expect(routePathOf({ dir: "routes" }, "catalog-voice", "catalogVoices")).toBe("catalog-voices");
    expect(routePathOf({ dir: "routes", paths: { "job-position": "positions" } }, "job-position", "jobPositions")).toBe("positions");
  });

  it("names its menu template after the route template", () => {
    expect(menuTemplateOf("route.tanstack")).toBe("menu-entry.tanstack");
    expect(menuTemplateOf("route")).toBe("menu-entry");
  });
});

describe("a menu entry", () => {
  const menu = 'const ENTRIES = [\n  { key: "a", href: "/a" },\n  // @simplix-menu admin\n];\n';

  it("goes on the line before the marker", () => {
    expect(insertMenuEntry(menu, "@simplix-menu admin", "/b", '  { key: "b", href: "/b" },\n')).toBe(
      'const ENTRIES = [\n  { key: "a", href: "/a" },\n  { key: "b", href: "/b" },\n  // @simplix-menu admin\n];\n',
    );
  });

  it("is left alone when the path already has one", () => {
    expect(insertMenuEntry(menu, "@simplix-menu admin", "/a", "x")).toBeUndefined();
  });

  it("refuses a menu file with no marker", () => {
    expect(() => insertMenuEntry("[]", "@simplix-menu admin", "/b", "x")).toThrow(/marker/);
  });
});

describe("writing a list screen's route", () => {
  let root: string;
  beforeEach(async () => {
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-route-")));
    await mkdir(join(root, "modules/admin/voice"), { recursive: true });
    await writeFile(join(root, "modules/admin/voice/package.json"), JSON.stringify({ name: "@app/admin-voice" }));
    await mkdir(join(root, "app/locales"), { recursive: true });
    await writeFile(join(root, "app/menu.ts"), "[\n  // @simplix-menu admin\n]\n");
    await writeFile(join(root, "app/locales/en.json"), JSON.stringify({ shell: { menu: {} } }));
  });
  afterEach(async () => rm(root, { recursive: true, force: true }));

  it("writes the route, its menu entry and its label, once", async () => {
    const templates = new Map([
      ["route.tanstack", "/**\n * @simplix-generated route/test\n */\nexport const path = \"/{{routePath}}\"; // {{modulePackage}} {{accessList}}\n"],
      ["menu-entry.tanstack", '  { key: "{{menuKey}}", href: "/{{routePath}}", gate: {{{menuGate}}} },\n'],
    ]);
    const input = {
      rootDir: root,
      moduleDir: join(root, "modules/admin/voice"),
      target: { dir: "app/routes", template: "route.tanstack", menu: { file: "app/menu.ts", marker: "@simplix-menu admin", catalogs: { en: "app/locales/en.json" }, keyPath: "shell.menu" } },
      templates,
      ctx: {},
      entityKebab: "catalog-voice",
      entityPlural: "catalogVoices",
      accessList: "listCatalogVoicesAccess",
      listAccess: { kind: "permission", group: "SPEECH_ADMIN", action: "list" } as const,
      plural: { en: "Catalog voices" },
      origin: "scaffold catalog-voice --module admin/voice",
    };
    const first = await writeRoute(input);
    expect(first).toMatchObject({ outcome: "written", menuInserted: true, labelled: ["app/locales/en.json"] });
    expect(await readFile(join(root, "app/routes/catalog-voices.tsx"), "utf-8")).toContain('"/catalog-voices"; // @app/admin-voice listCatalogVoicesAccess');
    expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toContain('{ key: "catalogVoices", href: "/catalog-voices", gate: { action: "list", subject: "SPEECH_ADMIN" } }');
    expect(JSON.parse(await readFile(join(root, "app/locales/en.json"), "utf-8"))).toEqual({ shell: { menu: { catalogVoices: "Catalog voices" } } });

    const second = await writeRoute(input);
    expect(second).toMatchObject({ outcome: "written", menuInserted: false, labelled: [] });
  });

  it("writes nothing without the route template", async () => {
    const out = await writeRoute({ rootDir: root, moduleDir: join(root, "modules/admin/voice"), target: { dir: "app/routes" }, templates: new Map(), ctx: {}, entityKebab: "voice", entityPlural: "voices", origin: "x" });
    expect(out.outcome).toBe("no-template");
  });
});
