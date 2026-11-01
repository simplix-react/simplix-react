import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ensureAppDependencies, insertMenuEntry, menuSubject, menuTemplateOf, placeMenuEntry, routePathOf, writeRoute } from "../utils/route-files.js";

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
    expect(insertMenuEntry(menu, "@simplix-menu admin", { key: "b", href: "/b", gate: "undefined" }, '  { key: "b", href: "/b" },\n')).toBe(
      'const ENTRIES = [\n  { key: "a", href: "/a" },\n  { key: "b", href: "/b" },\n  // @simplix-menu admin\n];\n',
    );
  });

  it("is left alone when the path already has one", () => {
    expect(insertMenuEntry(menu, "@simplix-menu admin", { key: "other", href: "/a", gate: "undefined" }, "x")).toBeUndefined();
  });

  it("completes a placeholder holding the key where it stands instead of inserting a second entry", () => {
    const grouped =
      '[\n  { key: "ops", entries: [\n    { key: "a", href: "/a" },\n    // @simplix-menu admin\n  ] },\n' +
      '  { key: "releases", entries: [{ key: "files", icon: PackageIcon }] },\n]\n';
    const out = insertMenuEntry(grouped, "@simplix-menu admin", { key: "files", href: "/files", gate: "RELEASES" }, '    { key: "files", href: "/files" },\n');
    expect(out).toBe(grouped.replace('{ key: "files", icon: PackageIcon }', '{ key: "files", href: "/files", icon: PackageIcon, gate: RELEASES }'));
  });

  it("keeps a placeholder's own gate and leaves a keyed entry that already routes alone", () => {
    const placeholder = '[{ key: "files", icon: I, gate: SYSTEM },\n// @simplix-menu admin\n]';
    expect(insertMenuEntry(placeholder, "@simplix-menu admin", { key: "files", href: "/files", gate: "RELEASES" }, "x")).toBe(
      '[{ key: "files", href: "/files", icon: I, gate: SYSTEM },\n// @simplix-menu admin\n]',
    );
    const routed = '[{ key: "files", href: "/release-files", icon: I },\n// @simplix-menu admin\n]';
    expect(insertMenuEntry(routed, "@simplix-menu admin", { key: "files", href: "/files", gate: "undefined" }, "x")).toBeUndefined();
  });

  it("does not take a group whose key matches for an entry", () => {
    const text = '[{ key: "files", entries: [{ key: "x", href: "/x" }] },\n// @simplix-menu admin\n]';
    expect(insertMenuEntry(text, "@simplix-menu admin", { key: "files", href: "/files", gate: "undefined" }, '{ key: "files", href: "/files" },')).toBe(
      '[{ key: "files", entries: [{ key: "x", href: "/x" }] },\n{ key: "files", href: "/files" },\n// @simplix-menu admin\n]',
    );
  });

  it("says whether the gate it was given is now in the file", () => {
    const gate = '{ action: "list", subject: SUBJECTS.files }';
    const entry = `  { key: "files", href: "/files", gate: ${gate} },\n`;
    const target = { key: "files", href: "/files", gate };
    expect(placeMenuEntry(menu, "@simplix-menu admin", target, entry)?.gated).toBe(true);
    // A template that draws no gate leaves nothing for the gate to be read from.
    expect(placeMenuEntry(menu, "@simplix-menu admin", target, '  { key: "files", href: "/files" },\n')?.gated).toBe(false);
    const completed = '[{ key: "files", icon: I },\n// @simplix-menu admin\n]';
    expect(placeMenuEntry(completed, "@simplix-menu admin", target, entry)?.gated).toBe(true);
    const own = '[{ key: "files", icon: I, gate: SYSTEM },\n// @simplix-menu admin\n]';
    expect(placeMenuEntry(own, "@simplix-menu admin", target, entry)?.gated).toBe(false);
  });

  it("refuses a menu file with no marker", () => {
    expect(() => insertMenuEntry("[]", "@simplix-menu admin", { key: "b", href: "/b", gate: "undefined" }, "x")).toThrow(/marker/);
  });
});

describe("a menu gate's subject", () => {
  it("is the permission group as a string literal unless the config states an expression", () => {
    expect(menuSubject(undefined, { entityCamel: "catalogVoice" }, "SPEECH_ADMIN")).toBe('"SPEECH_ADMIN"');
    expect(menuSubject({ subject: "SUBJECTS.{{entityCamel}}" }, { entityCamel: "catalogVoice" }, "SPEECH_ADMIN")).toBe("SUBJECTS.catalogVoice");
    expect(menuSubject({ subject: 'GROUPS["{{group}}"]' }, {}, "SPEECH_ADMIN")).toBe('GROUPS["SPEECH_ADMIN"]');
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
    await writeFile(join(root, "app/package.json"), JSON.stringify({ name: "@app/admin", dependencies: { "@app/admin-voice": "workspace:*" } }));
  });
  afterEach(async () => rm(root, { recursive: true, force: true }));

  it("writes the route, its menu entry and its label, once", async () => {
    const templates = new Map([
      ["route.tanstack", "/**\n * @simplix-generated route/test\n */\nexport const path = \"/{{routePath}}\"; // {{modulePackage}} {{accessList}} {{moduleLocales}}\n"],
      ["menu-entry.tanstack", '  { key: "{{menuKey}}", href: "/{{routePath}}", gate: {{{menuGate}}} },\n'],
    ]);
    const input = {
      rootDir: root,
      moduleDir: join(root, "modules/admin/voice"),
      target: { dir: "app/routes", template: "route.tanstack", menu: { file: "app/menu.ts", marker: "@simplix-menu admin", catalogs: { en: "app/locales/en.json" }, keyPath: "shell.menu" } },
      templates,
      ctx: { packageName: "@app/domain-voice" },
      entityKebab: "catalog-voice",
      entityPlural: "catalogVoices",
      accessList: "listCatalogVoicesAccess",
      listAccess: { kind: "permission", group: "SPEECH_ADMIN", action: "list" } as const,
      plural: { en: "Catalog voices" },
      origin: "scaffold catalog-voice --module admin/voice",
    };
    const first = await writeRoute(input);
    expect(first).toMatchObject({ outcome: "written", menuInserted: true, labelled: ["app/locales/en.json"] });
    expect(await readFile(join(root, "app/routes/catalog-voices.tsx"), "utf-8")).toContain('"/catalog-voices"; // @app/admin-voice listCatalogVoicesAccess false');
    expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toContain('{ key: "catalogVoices", href: "/catalog-voices", gate: { action: "list", subject: "SPEECH_ADMIN" } }');
    expect(JSON.parse(await readFile(join(root, "app/locales/en.json"), "utf-8"))).toEqual({ shell: { menu: { catalogVoices: "Catalog voices" } } });

    expect(JSON.parse(await readFile(join(root, "app/package.json"), "utf-8")).dependencies).toEqual({ "@app/admin-voice": "workspace:*", "@app/domain-voice": "workspace:*" });

    const second = await writeRoute(input);
    expect(second).toMatchObject({ outcome: "written", menuInserted: false, labelled: [] });
  });

  describe("with a menu gate read from a subjects table", () => {
    const TABLE = 'export const SUBJECTS = {\n  /** Job positions. */\n  jobPosition: "ORG_ADMIN",\n} as const;\n';
    const templates = new Map([
      ["route.tanstack", "export const path = \"/{{routePath}}\";\n"],
      ["menu-entry.tanstack", '  { key: "{{menuKey}}", href: "/{{routePath}}", gate: {{{menuGate}}} },\n'],
    ]);
    const base = (menu: Record<string, unknown>) => ({
      rootDir: root,
      moduleDir: join(root, "modules/admin/voice"),
      target: { dir: "app/routes", template: "route.tanstack", menu: { file: "app/menu.ts", marker: "@simplix-menu admin", ...menu } },
      templates,
      ctx: { packageName: "@app/domain-voice", entity: "catalogVoice" },
      entityKebab: "catalog-voice",
      entityPlural: "catalogVoices",
      listAccess: { kind: "permission", group: "SPEECH_ADMIN", action: "list" } as const,
      plural: { en: "Catalog voices" },
      origin: "scaffold catalog-voice --module admin/voice",
    });
    const gate = { subject: "SUBJECTS.{{entityCamel}}", table: { file: "app/subjects.ts" } };

    beforeEach(async () => writeFile(join(root, "app/subjects.ts"), TABLE));

    it("draws the entry on the expression and adds the subject it reads, once", async () => {
      const first = await writeRoute(base({ gate }));
      expect(first.subject).toEqual({ file: "app/subjects.ts", key: "catalogVoice", outcome: "added" });
      expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toContain('{ key: "catalogVoices", href: "/catalog-voices", gate: { action: "list", subject: SUBJECTS.catalogVoice } }');
      expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toBe(
        'export const SUBJECTS = {\n  /** Job positions. */\n  jobPosition: "ORG_ADMIN",\n  /** Catalog voices. */\n  catalogVoice: "SPEECH_ADMIN",\n} as const;\n',
      );

      const second = await writeRoute(base({ gate }));
      expect(second.menuInserted).toBe(false);
      expect(second.subject).toBeUndefined();
      expect((await readFile(join(root, "app/subjects.ts"), "utf-8")).match(/catalogVoice:/g)).toHaveLength(1);
    });

    it("keeps the value of a subject the table already has", async () => {
      await writeFile(join(root, "app/subjects.ts"), 'export const SUBJECTS = {\n  catalogVoice: "CATALOG",\n} as const;\n');
      const out = await writeRoute(base({ gate }));
      expect(out.subject).toEqual({ file: "app/subjects.ts", key: "catalogVoice", outcome: "present" });
      expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toContain('catalogVoice: "CATALOG"');
    });

    it("leaves the table alone for an entry that keeps a gate of its own", async () => {
      await writeFile(join(root, "app/menu.ts"), '[\n  { key: "catalogVoices", icon: I, gate: SPEECH },\n  // @simplix-menu admin\n]\n');
      const out = await writeRoute(base({ gate }));
      expect(out.menuInserted).toBe(true);
      expect(out.subject).toBeUndefined();
      expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toBe(TABLE);
    });

    it("adds no subject for a list the server does not guard by a permission", async () => {
      const out = await writeRoute({ ...base({ gate }), listAccess: undefined });
      expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toContain("gate: undefined");
      expect(out.subject).toBeUndefined();
    });

    it("says why the table was not updated instead of failing the scaffold", async () => {
      const tableFile = { ...gate, table: { file: "app/missing.ts" } };
      expect((await writeRoute(base({ gate: tableFile }))).subject).toEqual({ file: "app/missing.ts", key: "catalogVoice", outcome: "no-file" });
      await rm(join(root, "app/menu.ts"));
      await writeFile(join(root, "app/menu.ts"), "[\n  // @simplix-menu admin\n]\n");
      const named = { subject: "GROUPS.{{entityCamel}}", table: { file: "app/subjects.ts", name: "GROUPS" } };
      expect((await writeRoute(base({ gate: named }))).subject).toEqual({ file: "app/subjects.ts", key: "catalogVoice", outcome: "no-table" });
      await writeFile(join(root, "app/menu.ts"), "[\n  // @simplix-menu admin\n]\n");
      const literal = { subject: "{{group}}", table: gate.table };
      expect((await writeRoute(base({ gate: literal }))).subject).toEqual({ file: "app/subjects.ts", outcome: "not-a-member" });
      expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toBe(TABLE);
    });
  });

  it("writes nothing without the route template", async () => {
    const out = await writeRoute({ rootDir: root, moduleDir: join(root, "modules/admin/voice"), target: { dir: "app/routes" }, templates: new Map(), ctx: {}, entityKebab: "voice", entityPlural: "voices", origin: "x" });
    expect(out.outcome).toBe("no-template");
  });
});

describe("the app a route is written in", () => {
  it("is found above the route directory, and adds nothing it already declares", async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "simplix-route-deps-")));
    try {
      await mkdir(join(root, "app/src/routes"), { recursive: true });
      await writeFile(join(root, "app/package.json"), JSON.stringify({ devDependencies: { a: "1" } }));
      expect(await ensureAppDependencies(join(root, "app/src/routes"), ["a", "b"])).toEqual(["b"]);
      expect(await ensureAppDependencies(join(root, "app/src/routes"), ["a", "b"])).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
