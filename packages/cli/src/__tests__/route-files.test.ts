import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ensureAppDependencies, ensureIconImport, insertMenuEntry, menuHrefsOf, menuSubject, menuTemplateOf, placeMenuEntry, routePathOf, writeRoute } from "../utils/route-files.js";

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

  it("is left alone when the path is spelled with another quote", () => {
    for (const quote of ["'", "`"]) {
      expect(insertMenuEntry(`[\n  { key: "a", href: ${quote}/a${quote} },\n  // @simplix-menu admin\n]`, "@simplix-menu admin", { key: "other", href: "/a", gate: "undefined" }, "x")).toBeUndefined();
    }
    // A longer path that merely starts with it is another screen.
    expect(insertMenuEntry('[\n  { key: "a", href: "/ab" },\n  // @simplix-menu admin\n]', "@simplix-menu admin", { key: "other", href: "/a", gate: "undefined" }, "  x")).toContain("  x\n");
  });

  it("is left alone when an entry under another key leads to the path through a constant the caller resolved", () => {
    const text = '[\n  { key: "users", href: ROUTES.userAccount },\n  // @simplix-menu admin\n]';
    const target = { key: "userAccounts", href: "/users", gate: "undefined" };
    expect(insertMenuEntry(text, "@simplix-menu admin", target, "  x\n")).toContain("  x\n");
    expect(placeMenuEntry(text, "@simplix-menu admin", target, "  x\n", undefined, new Set(["/users"]))).toBeUndefined();
    expect(placeMenuEntry(text, "@simplix-menu admin", target, "  x\n", undefined, new Set(["/roles"]))?.text).toContain("  x\n");
  });

  it("completes a placeholder holding the key where it stands instead of inserting a second entry", () => {
    const grouped =
      '[\n  { key: "ops", entries: [\n    { key: "a", href: "/a" },\n    // @simplix-menu admin\n  ] },\n' +
      '  { key: "releases", entries: [{ key: "files", icon: PackageIcon }] },\n]\n';
    const out = insertMenuEntry(grouped, "@simplix-menu admin", { key: "files", href: "/files", gate: "RELEASES" }, '    { key: "files", href: "/files" },\n');
    expect(out).toBe(grouped.replace('{ key: "files", icon: PackageIcon }', '{ key: "files", href: "/files", icon: PackageIcon, gate: RELEASES }'));
  });

  it("gives a placeholder the screen's gate in place of its own and leaves a keyed entry that already routes alone", () => {
    const placeholder = '[{ key: "files", icon: I, gate: SYSTEM },\n// @simplix-menu admin\n]';
    expect(insertMenuEntry(placeholder, "@simplix-menu admin", { key: "files", href: "/files", gate: "RELEASES" }, "x")).toBe(
      '[{ key: "files", href: "/files", icon: I, gate: RELEASES },\n// @simplix-menu admin\n]',
    );
    // A placeholder with no gate of its own and a screen with none stay without one.
    expect(insertMenuEntry('[{ key: "files", icon: I },\n// @simplix-menu admin\n]', "@simplix-menu admin", { key: "files", href: "/files", gate: "undefined" }, "x")).toBe(
      '[{ key: "files", href: "/files", icon: I },\n// @simplix-menu admin\n]',
    );
    const gateFirst = '[{ key: "files", gate: SYSTEM, icon: I },\n// @simplix-menu admin\n]';
    expect(insertMenuEntry(gateFirst, "@simplix-menu admin", { key: "files", href: "/files", gate: "RELEASES" }, "x")).toBe(
      '[{ key: "files", href: "/files", icon: I, gate: RELEASES },\n// @simplix-menu admin\n]',
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
    // A placeholder's own gate gives way, so the screen's gate (and the table key it reads) is written.
    const own = '[{ key: "files", icon: I, gate: SYSTEM },\n// @simplix-menu admin\n]';
    expect(placeMenuEntry(own, "@simplix-menu admin", target, entry)?.gated).toBe(true);
  });

  it("refuses a menu file with no marker", () => {
    expect(() => insertMenuEntry("[]", "@simplix-menu admin", { key: "b", href: "/b", gate: "undefined" }, "x")).toThrow(/marker/);
  });
});

describe("a menu entry placed in a named group", () => {
  const entry = '      { key: "mail", href: "/mail", icon: MailIcon },\n';
  const target = { key: "mail", href: "/mail", gate: "undefined" };
  const menu = [
    "export const MENU = [",
    "  {",
    '    key: "people",',
    "    icon: UsersIcon,",
    "    entries: [",
    '      { key: "users", href: "/users", icon: UsersIcon },',
    "    ],",
    "  },",
    "  {",
    '    key: "ops",',
    "    icon: ActivityIcon,",
    "    entries: [",
    '      { key: "jobs", href: "/jobs", icon: ListIcon },',
    "      // @simplix-menu admin",
    "    ],",
    "  },",
    "  {",
    '    key: "system",',
    "    icon: SettingsIcon,",
    '    entries: [{ key: "system", href: "/system", icon: SettingsIcon }],',
    "  },",
    "];",
    "",
  ].join("\n");

  it("goes at the end of that group, not before the marker of another", () => {
    const out = placeMenuEntry(menu, "@simplix-menu admin", target, entry, "people")?.text ?? "";
    expect(out).toContain('{ key: "users", href: "/users", icon: UsersIcon },\n      { key: "mail", href: "/mail", icon: MailIcon },\n    ],');
    expect(out.indexOf('key: "mail"')).toBeLessThan(out.indexOf('key: "ops"'));
  });
  it("goes before the marker when the group holds it", () => {
    const out = placeMenuEntry(menu, "@simplix-menu admin", target, entry, "ops")?.text ?? "";
    expect(out).toContain('icon: ListIcon },\n      { key: "mail", href: "/mail", icon: MailIcon },\n      // @simplix-menu admin');
  });
  it("opens out a group written on one line, and takes the group over an entry sharing its key", () => {
    const out = placeMenuEntry(menu, "@simplix-menu admin", target, entry, "system")?.text ?? "";
    expect(out).toContain('    entries: [\n      { key: "system", href: "/system", icon: SettingsIcon },\n      { key: "mail", href: "/mail", icon: MailIcon },\n    ],');
  });
  it("refuses a group the menu does not have", () => {
    expect(() => placeMenuEntry(menu, "@simplix-menu admin", target, entry, "nowhere")).toThrow(/no group "nowhere"/);
  });
  it("leaves a screen whose entry is already in the menu alone, though the group its origin records is gone", () => {
    // An origin replays its menu group on every regeneration and report, so a renamed group must
    // not fail a screen whose entry is already placed.
    expect(placeMenuEntry(menu, "@simplix-menu admin", { key: "users", href: "/users", gate: "undefined" }, entry, "nowhere")).toBeUndefined();
    expect(placeMenuEntry(menu, "@simplix-menu admin", { key: "renamed", href: "/users", gate: "undefined" }, entry, "nowhere")).toBeUndefined();
  });
  it("still goes before the marker when no group is named", () => {
    const out = placeMenuEntry(menu, "@simplix-menu admin", target, entry)?.text ?? "";
    expect(out).toContain('icon: ListIcon },\n      { key: "mail", href: "/mail", icon: MailIcon },\n      // @simplix-menu admin');
  });
});

describe("an icon the menu file draws", () => {
  const file = 'import {\n  ActivityIcon,\n  FileTextIcon,\n  type LucideIcon,\n} from "lucide-react";\nimport { x } from "y";\n';
  it("joins the import of the configured icon, in order", () => {
    const out = ensureIconImport(file, "MailIcon", "FileTextIcon");
    expect(out).toContain("  FileTextIcon,\n  type LucideIcon,\n  MailIcon,\n}");
  });
  it("adds one line to an import that is not in order and moves no other", () => {
    const loose = 'import {\n  Zeta,\n  Beta,\n  FileTextIcon,\n  Alpha,\n} from "lucide-react";\n';
    const out = ensureIconImport(loose, "Gamma", "FileTextIcon");
    expect(out.split("\n").filter((line) => line.trim() !== "  Gamma,".trim())).toEqual(loose.split("\n"));
    expect(out.split("\n")).toHaveLength(loose.split("\n").length + 1);
  });
  it("is left alone when an import already brings it in", () => {
    expect(ensureIconImport(file, "ActivityIcon", "FileTextIcon")).toBe(file);
  });
  it("joins a one-line import", () => {
    expect(ensureIconImport('import { FileTextIcon } from "lucide-react";\n', "MailIcon", "FileTextIcon")).toBe('import { FileTextIcon, MailIcon } from "lucide-react";\n');
  });
  it("refuses when there is no import of the configured icon to join", () => {
    expect(() => ensureIconImport(file, "MailIcon", "CircleIcon")).toThrow(/import it by hand/);
    expect(() => ensureIconImport(file, "MailIcon", undefined)).toThrow(/import it by hand/);
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

    it("gives a placeholder carrying its own gate the screen's gate and adds the key that gate reads", async () => {
      await writeFile(join(root, "app/menu.ts"), '[\n  { key: "catalogVoices", icon: I, gate: SPEECH },\n  // @simplix-menu admin\n]\n');
      const out = await writeRoute(base({ gate }));
      expect(out.menuInserted).toBe(true);
      const menuText = await readFile(join(root, "app/menu.ts"), "utf-8");
      expect(menuText).not.toContain("SPEECH");
      expect(menuText).toContain("SUBJECTS.catalogVoice");
      expect(out.subject).toEqual({ file: "app/subjects.ts", key: "catalogVoice", outcome: "added" });
      expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toContain("catalogVoice:");
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

describe("the paths a menu file's entries lead to through a constant", () => {
  let root: string;
  beforeEach(async () => {
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-hrefs-")));
    await mkdir(join(root, "app/shared"), { recursive: true });
    await writeFile(join(root, "app/shared/routes.ts"), 'export const ENTITY_ROUTES = {\n  userAccount: "/users",\n  jobPosition: "/positions",\n} as const;\n');
  });
  afterEach(async () => rm(root, { recursive: true, force: true }));

  const menu = (importLine: string) =>
    `${importLine}\nexport const MENU = [\n  { key: "users", href: ENTITY_ROUTES.userAccount },\n  { key: "plain", href: "/plain" },\n  { key: "gone", href: ENTITY_ROUTES.missing },\n  // @simplix-menu admin\n];\n`;

  it("reads the member from the file a relative import brings the constant from", async () => {
    const text = menu('import { ENTITY_ROUTES } from "./shared/routes";');
    expect(await menuHrefsOf(join(root, "app/menu.ts"), text)).toEqual({ resolved: new Set(["/users"]), unresolved: ["ENTITY_ROUTES.missing"] });
  });

  it("follows an import spelled with .js, an alias and a type modifier", async () => {
    const aliased = menu('import { type X, ENTITY_ROUTES as R } from "./shared/routes.js";').replaceAll("ENTITY_ROUTES.", "R.");
    expect((await menuHrefsOf(join(root, "app/menu.ts"), aliased)).resolved).toEqual(new Set(["/users"]));
  });

  it("reads a constant declared in the menu file itself", async () => {
    const text = 'const ROUTES = { users: "/people" };\nexport const MENU = [{ key: "u", href: ROUTES.users }];\n';
    expect((await menuHrefsOf(join(root, "app/menu.ts"), text)).resolved).toEqual(new Set(["/people"]));
  });

  it("names a constant it cannot read instead of guessing", async () => {
    const text = 'import { ROUTES } from "@alias/routes";\nexport const MENU = [{ key: "u", href: ROUTES.users }];\n';
    expect(await menuHrefsOf(join(root, "app/menu.ts"), text)).toEqual({ resolved: new Set(), unresolved: ["ROUTES.users"] });
  });
});

describe("routing a screen the project already has an entry for under its own key", () => {
  let root: string;
  const gate = { subject: "SUBJECTS.{{entityCamel}}", table: { file: "app/subjects.ts" } };
  const MENU = [
    'import { ENTITY_ROUTES } from "./routes";',
    "export const GROUPS = [",
    '  { key: "people", entries: [',
    '    { key: "users", href: ENTITY_ROUTES.userAccount, icon: UsersIcon },',
    "    // @simplix-menu admin",
    "  ] },",
    "];",
    "",
  ].join("\n");
  const SUBJECTS = 'export const SUBJECTS = {\n  other: "OTHER",\n} as const;\n';
  const input = () => ({
    rootDir: root,
    moduleDir: join(root, "modules/admin/user"),
    target: {
      dir: "app/routes",
      template: "route.tanstack",
      paths: { "user-account": "users" },
      menu: { file: "app/menu.ts", marker: "@simplix-menu admin", icon: "FileTextIcon", catalogs: { en: "app/locales/en.json" }, keyPath: "shell.menu", gate },
    },
    templates: new Map([
      ["route.tanstack", 'export const path = "/{{routePath}}";\n'],
      ["menu-entry.tanstack", '  { key: "{{menuKey}}", href: "/{{routePath}}", icon: {{menuIcon}}, gate: {{{menuGate}}} },\n'],
    ]),
    ctx: { packageName: "@app/domain-user", entity: "userAccount" },
    entityKebab: "user-account",
    entityPlural: "userAccounts",
    listAccess: { kind: "permission", group: "USER_ADMIN", action: "list" } as const,
    plural: { en: "User accounts" },
    origin: "scaffold user-account --module admin/user",
  });

  beforeEach(async () => {
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-keyed-")));
    await mkdir(join(root, "modules/admin/user"), { recursive: true });
    await mkdir(join(root, "app/locales"), { recursive: true });
    await writeFile(join(root, "modules/admin/user/package.json"), JSON.stringify({ name: "@app/admin-user" }));
    await writeFile(join(root, "app/package.json"), JSON.stringify({ name: "@app/admin", dependencies: { "@app/admin-user": "workspace:*", "@app/domain-user": "workspace:*" } }));
    await writeFile(join(root, "app/routes.ts"), 'export const ENTITY_ROUTES = {\n  userAccount: "/users",\n} as const;\n');
    await writeFile(join(root, "app/menu.ts"), MENU);
    await writeFile(join(root, "app/subjects.ts"), SUBJECTS);
    await writeFile(join(root, "app/locales/en.json"), JSON.stringify({ shell: { menu: { users: "Users" } } }));
  });
  afterEach(async () => rm(root, { recursive: true, force: true }));

  it("leaves the menu, the subjects table and the label catalog as the project wrote them", async () => {
    const out = await writeRoute(input());
    expect(out).toMatchObject({ outcome: "written", menuInserted: false, labelled: [] });
    expect(out.subject).toBeUndefined();
    expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toBe(MENU);
    expect(await readFile(join(root, "app/subjects.ts"), "utf-8")).toBe(SUBJECTS);
    expect(JSON.parse(await readFile(join(root, "app/locales/en.json"), "utf-8"))).toEqual({ shell: { menu: { users: "Users" } } });
    expect(await writeRoute(input())).toMatchObject({ menuInserted: false });
  });

  it("still adds a screen no entry leads to", async () => {
    await writeFile(join(root, "app/routes.ts"), 'export const ENTITY_ROUTES = {\n  userAccount: "/members",\n} as const;\n');
    const out = await writeRoute(input());
    expect(out.menuInserted).toBe(true);
    expect(await readFile(join(root, "app/menu.ts"), "utf-8")).toContain('{ key: "userAccounts", href: "/users", icon: FileTextIcon');
    expect(out.subject).toMatchObject({ key: "userAccount", outcome: "added" });
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
