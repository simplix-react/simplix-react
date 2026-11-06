import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generatedReport, regenerateAll } from "../commands/generated.js";
import { applyOriginChange, planOriginChange } from "../commands/generated-origin.js";
import { listDecision, runScaffold, scaffoldCrudCommand, scaffoldOptionsFromOrigin } from "../commands/scaffold-crud.js";
import { withSilentLog } from "../utils/logger.js";

vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// The pinned versions are baked in by the bundler, so the test supplies one.
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

const MODULE = "modules/mymod";
/** The directories that hold the screen's own generated files: the only place a run may change anything. */
const SCREEN_DIRS = [`${MODULE}/src/widgets/product/`, `${MODULE}/src/pages/product/`];

let root: string;
let originalCwd: string;
let originalExit: typeof process.exit;

const scaffold = () => withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true }));

/** Every file under the project root, keyed by its path relative to it. */
async function snapshot(): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else files.set(relative(root, path), await readFile(path, "utf-8"));
    }
  };
  await walk(root);
  return files;
}

/** The snapshot without the screen's own files. */
function outsideTheScreen(files: ReadonlyMap<string, string>): Map<string, string> {
  return new Map([...files].filter(([path]) => !SCREEN_DIRS.some((dir) => path.startsWith(dir))));
}

async function put(path: string, content: string): Promise<void> {
  await mkdir(join(root, path, ".."), { recursive: true });
  await writeFile(join(root, path), content, "utf-8");
}

/**
 * A module that is already wired the way a finished one is: its package declares what the screen
 * imports, its barrels and build entries are in place, and its translations register the
 * components its screens read. It keeps no `shared/auth` and no `widgets` catalogue.
 */
async function wireModule(): Promise<void> {
  await put("simplix.config.ts", "export default {};\n");
  await put("package.json", JSON.stringify({ name: "@test/monorepo" }));
  await put("packages/.keep", "");
  await put(
    `${MODULE}/package.json`,
    JSON.stringify(
      {
        name: "@test/mymod",
        dependencies: { "@simplix-react/ui": "catalog:", "@simplix-react/i18n": "catalog:" },
        devDependencies: { "@types/react": "^19.0.0" },
        exports: { "./pages": { source: "./src/pages/index.ts", types: "./dist/pages/index.d.ts", import: "./dist/pages/index.js" } },
      },
      null,
      2,
    ) + "\n",
  );
  await put(`${MODULE}/src/widgets/index.ts`, "export {};\n");
  await put(`${MODULE}/src/pages/index.ts`, '// Side-effect: register module translations\nimport "../locales";\n');
  await put(`${MODULE}/src/index.ts`, 'export * from "./widgets";\n');
  await put(
    `${MODULE}/tsup.config.ts`,
    'export default { entry: { "widgets/index": "src/widgets/index.ts",\n    "pages/index": "src/pages/index.ts" } };\n',
  );
  // One component per screen group and no `widgets` catalogue, with a comment that names one.
  await put(
    `${MODULE}/src/locales/index.ts`,
    [
      "// One component per screen group rather than one `widgets: ...` catalogue for the module.",
      "export const translations = {",
      "  components: {",
      "    products: {",
      '      en: () => import("./products/en.json"),',
      "    },",
      "  },",
      "};",
      "",
    ].join("\n"),
  );
  await put(`${MODULE}/src/locales/products/en.json`, "{}\n");
}

/** Templates that read neither the subjects map nor the widgets catalogue, as a UI kit's do. */
async function useKitShapedTemplates(): Promise<void> {
  const marker = (kind: string) => `/**\n * @simplix-generated ${kind}\n */\n`;
  await put(".simplix/templates/list.hbs", `${marker("widget/list")}export function {{EntityPascal}}List() {\n  return <div />;\n}\n`);
  await put(".simplix/templates/form.hbs", `${marker("widget/form")}export function {{EntityPascal}}Form() {\n  return <div />;\n}\n`);
  await put(".simplix/templates/detail.hbs", `${marker("widget/detail")}export function {{EntityPascal}}Detail() {\n  return <div />;\n}\n`);
  await put(
    ".simplix/templates/feature-index.hbs",
    'export { {{EntityPascal}}List } from "./list";\nexport { {{EntityPascal}}Form } from "./form";\nexport { {{EntityPascal}}Detail } from "./detail";\n',
  );
  await put(
    ".simplix/templates/crud-page.hbs",
    `${marker("page/crud-page")}import { {{EntityPascal}}Detail, {{EntityPascal}}List } from "../../widgets/{{entityKebab}}";\n\nexport function {{EntityPascal}}CrudPage() {\n  return <{{EntityPascal}}List />;\n}\n`,
  );
}

beforeEach(async () => {
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;
  root = await mkdtemp(join(tmpdir(), "scaffold-module-writes-"));
  await wireModule();
  process.chdir(root);
  // The OS reports the working directory with symbolic links resolved, which is the spelling the generators use.
  root = process.cwd();
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(root, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("what a scaffold writes beside the screen", () => {
  it("leaves the module's support files alone when the screen's files need none of them", async () => {
    await useKitShapedTemplates();
    const before = await snapshot();

    await scaffold();
    const first = await snapshot();

    // The screen is new, so its registration lines in the module barrels are expected; the
    // support files are not.
    expect([...first.keys()].filter((path) => path.includes("shared/auth"))).toEqual([]);
    expect([...first.keys()].filter((path) => path.includes("locales/widgets"))).toEqual([]);
    expect(first.get(`${MODULE}/src/locales/index.ts`)).toBe(before.get(`${MODULE}/src/locales/index.ts`));
    expect(JSON.parse(first.get(`${MODULE}/package.json`) ?? "{}")).toEqual(JSON.parse(before.get(`${MODULE}/package.json`) ?? "{}"));

    // From here on the module is an existing one: two more runs and a regeneration of every
    // recorded screen change nothing outside the screen's own files.
    const settled = await snapshot();
    await scaffold();
    await scaffold();
    await withSilentLog(() => regenerateAll(root));
    expect(outsideTheScreen(await snapshot())).toEqual(outsideTheScreen(settled));
  });

  it("adds a dependency only for a package a file of the screen imports", async () => {
    await useKitShapedTemplates();
    const pkg = JSON.parse(await readFile(join(root, MODULE, "package.json"), "utf-8"));
    pkg.dependencies = {};
    await put(`${MODULE}/package.json`, JSON.stringify(pkg, null, 2) + "\n");

    await scaffold();

    // The kit-shaped files import no framework package, so the module is not handed one.
    expect(JSON.parse(await readFile(join(root, MODULE, "package.json"), "utf-8")).dependencies).toEqual({});
  });

  it("adds @types/react to a module that resolves it nowhere, for a file that draws JSX", async () => {
    await useKitShapedTemplates();
    const pkg = JSON.parse(await readFile(join(root, MODULE, "package.json"), "utf-8"));
    pkg.devDependencies = {};
    await put(`${MODULE}/package.json`, JSON.stringify(pkg, null, 2) + "\n");

    await scaffold();

    expect(JSON.parse(await readFile(join(root, MODULE, "package.json"), "utf-8")).devDependencies).toHaveProperty("@types/react");
  });

  it("leaves the widgets catalogue as it is when a file reads it only for keys of its own", async () => {
    await useKitShapedTemplates();
    await put(".simplix/templates/page.blocks.hbs", "export function usePageBlocks() {\n  return {};\n}\n");
    // The author's blocks file reads the catalogue for `page.note`; nothing reads `product.*`.
    await put(
      `${MODULE}/src/pages/product/page.blocks.tsx`,
      'import { useTranslation } from "@simplix-react/i18n/react";\nexport function usePageBlocks() {\n  const { t } = useTranslation("mymod/widgets");\n  return { note: t("page.note") };\n}\n',
    );
    for (const locale of ["en", "ko", "ja"]) await put(`${MODULE}/src/locales/widgets/${locale}.json`, '{\n  "page": {\n    "note": "A note"\n  }\n}\n');
    await put(
      `${MODULE}/src/locales/index.ts`,
      'export const translations = {\n  components: {\n    widgets: {\n      en: () => import("./widgets/en.json"),\n    },\n  },\n};\n',
    );
    await scaffold();
    const settled = await snapshot();

    await scaffold();
    await withSilentLog(() => regenerateAll(root));

    for (const locale of ["en", "ko", "ja"]) {
      expect(settled.get(`${MODULE}/src/locales/widgets/${locale}.json`)).toBe('{\n  "page": {\n    "note": "A note"\n  }\n}\n');
    }
    expect(outsideTheScreen(await snapshot())).toEqual(outsideTheScreen(settled));
  });

  it("lays down no description key for a page that reads the screen's own", async () => {
    await useKitShapedTemplates();
    // A page states its line by the catalogue holding `screen.<entity>.description`; it asks
    // whether the key exists, so a catalogue without it is a screen without a line, not a gap.
    await put(
      ".simplix/templates/crud-page.hbs",
      [
        "/**\n * @simplix-generated page/crud-page\n */",
        'import { useTranslation } from "@simplix-react/i18n/react";',
        "export function {{EntityPascal}}CrudPage() {",
        '  const { t, exists } = useTranslation("mymod/widgets");',
        '  const descriptionKey = "screen.{{entity}}.description";',
        "  return <p>{exists(descriptionKey) ? t(descriptionKey) : null}</p>;",
        "}",
        "",
      ].join("\n"),
    );
    for (const locale of ["en", "ko"]) await put(`${MODULE}/src/locales/widgets/${locale}.json`, '{\n  "page": {\n    "note": "A note"\n  }\n}\n');
    await put(
      `${MODULE}/src/locales/index.ts`,
      'export const translations = {\n  components: {\n    widgets: {\n      en: () => import("./widgets/en.json"),\n    },\n  },\n};\n',
    );

    await scaffold();

    for (const locale of ["en", "ko"]) {
      expect(await readFile(join(root, MODULE, "src/locales/widgets", `${locale}.json`), "utf-8")).toBe('{\n  "page": {\n    "note": "A note"\n  }\n}\n');
    }
  });

  it("adds the entity's default keys to the catalogue for a file that reads them", async () => {
    await put(`${MODULE}/src/locales/widgets/en.json`, '{\n  "page": {}\n}\n');
    await scaffold();
    const catalogue = JSON.parse((await snapshot()).get(`${MODULE}/src/locales/widgets/en.json`) ?? "{}");
    expect(catalogue.page).toEqual({});
    expect(catalogue.product.saveProduct).toBe("Save Product");
  });

  it("brings nothing back for a screen the author has taken over", async () => {
    // The bundled templates import the subjects map and read the widgets catalogue, so a run that
    // judged the support files by what it rendered would lay both down for these files.
    const authored = "export const Authored = 1;\n";
    await put(`${MODULE}/src/widgets/product/index.ts`, 'export { ProductList } from "./list";\n');
    for (const name of ["list", "form", "detail"]) {
      await put(`${MODULE}/src/widgets/product/${name}.tsx`, authored);
    }
    await put(`${MODULE}/src/pages/product/crud-page.tsx`, authored);
    await put(`${MODULE}/src/pages/product/index.ts`, 'export { ProductCrudPage } from "./crud-page";\n');
    await put(`${MODULE}/src/widgets/index.ts`, 'export { ProductList } from "./product";\n');
    await put(`${MODULE}/src/pages/index.ts`, 'import "../locales";\nexport { ProductCrudPage } from "./product";\n');
    await put(`${MODULE}/src/index.ts`, 'export * from "./widgets";\nexport * from "./pages";\n');
    const before = await snapshot();

    await scaffold();
    await scaffold();
    await withSilentLog(() => regenerateAll(root));

    expect(await snapshot()).toEqual(before);
  });

  it("lays the support files down for a page it writes that needs them, and only once", async () => {
    // The bundled templates import the subjects map and read the widgets catalogue.
    const first = await (async () => {
      await scaffold();
      return snapshot();
    })();

    expect(first.get(`${MODULE}/src/shared/auth/subjects.ts`)).toContain("export const SUBJECTS");
    expect([...first.keys()].filter((path) => path.startsWith(`${MODULE}/src/locales/widgets/`)).sort()).toEqual([
      `${MODULE}/src/locales/widgets/en.json`,
      `${MODULE}/src/locales/widgets/ja.json`,
      `${MODULE}/src/locales/widgets/ko.json`,
    ]);
    expect(first.get(`${MODULE}/src/locales/index.ts`)).toMatch(/\bwidgets: \{\n\s+en: \(\) => import\("\.\/widgets\/en\.json"\)/);

    await scaffold();
    await scaffold();
    expect(await snapshot()).toEqual(first);
  });

  it("does not hand a module a second permission map when it keeps its own", async () => {
    await put(`${MODULE}/src/shared/auth/subjects.tsx`, "export const SUBJECTS = { product: 'product' } as const;\n");
    await scaffold();
    const files = [...(await snapshot()).keys()].filter((path) => path.includes("shared/auth"));
    expect(files).toEqual([`${MODULE}/src/shared/auth/subjects.tsx`]);
  });

  it("registers the widgets catalogue when a comment names it but the code does not", async () => {
    // The wired module's locales/index.ts has a comment saying `widgets: ...` and no registration.
    await scaffold();
    expect(await readFile(join(root, MODULE, "src/locales/index.ts"), "utf-8")).toContain('import("./widgets/ko.json")');
  });
});

describe("the configured story directory", () => {
  const storyTemplate = "/**\n * @simplix-generated story/crud-page\n */\nexport default { title: \"Generated/{{EntityPascal}}\" };\n";

  async function configure(storiesDir: string): Promise<void> {
    await put("simplix.config.ts", `export default { templates: { storiesDir: ${JSON.stringify(storiesDir)} } };\n`);
    await put(".simplix/templates/crud-page.stories.hbs", storyTemplate);
  }

  it("refuses a directory that does not exist before it writes anything", async () => {
    await useKitShapedTemplates();
    await configure("board/screens");
    const before = await snapshot();

    await expect(scaffold()).rejects.toThrow(/templates\.storiesDir "board\/screens" resolves to .*board\/screens, which does not exist/);

    expect(await snapshot()).toEqual(before);
  });

  it("writes the screen's story into a directory that exists", async () => {
    await useKitShapedTemplates();
    await configure("board/screens");
    await mkdir(join(root, "board/screens"), { recursive: true });

    await scaffold();

    expect((await snapshot()).get("board/screens/product.stories.tsx")).toContain("Generated/Product");
  });
});

describe("the commands run after a scaffold", () => {
  const afterLog = () => readFile(join(root, "after.log"), "utf-8").catch(() => undefined);

  it("run once the command has written the screen, and not for the generator call a report makes", async () => {
    await useKitShapedTemplates();
    await put("simplix.config.ts", 'export default { generated: { after: [{ command: "node mark.cjs" }] } };\n');
    await put("mark.cjs", 'require("node:fs").appendFileSync("after.log", "x");\n');

    await scaffold();
    expect(await afterLog()).toBeUndefined();

    await withSilentLog(() => scaffoldCrudCommand.parseAsync(["node", "simplix", "product", "--module", "mymod"]));
    expect(await afterLog()).toBe("x");
  });
});

describe("the list's design decisions", () => {
  const LIST_PATH = `${MODULE}/src/widgets/product/list.tsx`;
  /** A list template that draws the three decisions the way a UI kit's does. */
  async function useDecisionAwareList(): Promise<void> {
    await useKitShapedTemplates();
    await put(
      ".simplix/templates/list.hbs",
      [
        "/**\n * @simplix-generated widget/list\n */",
        "export function {{EntityPascal}}List() {",
        "  return (",
        "    <RecordList",
        "{{#if listCards}}",
        '      presentation="cards"',
        "{{/if}}",
        "{{#if viewToggle}}",
        "      viewToggle",
        "{{/if}}",
        "{{#if cardTitle}}",
        '      cardTitle="{{cardTitle}}"',
        "{{/if}}",
        "    />",
        "  );",
        "}",
        "",
      ].join("\n"),
    );
  }
  const decided = () => withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, listPresentation: "cards", cardTitle: "name" }));
  const listText = async () => (await snapshot()).get(LIST_PATH) ?? "";
  const switchLines = (text: string) => text.match(/\n\s+viewToggle\n/g)?.length ?? 0;

  it("hands the presentation and the card title to the template, with the switch a cards list always has, and records them in the origin", async () => {
    await useDecisionAwareList();
    await decided();
    const text = await listText();
    expect(text).toContain('presentation="cards"');
    // No flag asked for the switch: a list drawn as cards has it.
    expect(switchLines(text)).toBe(1);
    expect(text).toContain('cardTitle="name"');
    expect(text).toMatch(/@simplix-render [0-9a-f]{12} scaffold product --module mymod --list-presentation cards --card-title name\n/);
  });

  it("offers a table list the switch only when it is asked for, and records the flag", async () => {
    await useDecisionAwareList();
    await withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, viewToggle: true }));
    const text = await listText();
    expect(text).not.toContain("presentation=");
    expect(switchLines(text)).toBe(1);
    expect(text).toMatch(/@simplix-render [0-9a-f]{12} scaffold product --module mymod --view-toggle\n/);
  });

  it("replays an origin recorded before the standard, with both flags, as the same cards list", async () => {
    await useDecisionAwareList();
    await withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, listPresentation: "cards", viewToggle: true, cardTitle: "name" }));
    const text = await listText();
    expect(switchLines(text)).toBe(1);
    expect(text).toMatch(/scaffold product --module mymod --list-presentation cards --card-title name\n/);
  });

  it("records the menu placement after the list's decisions, so a regeneration places a missing entry where the design put it", async () => {
    await useDecisionAwareList();
    await withSilentLog(() =>
      runScaffold("product", { module: "mymod", quiet: true, listPresentation: "cards", menuGroup: "people", menuIcon: "UsersIcon" }),
    );
    const text = await listText();
    expect(text).toMatch(/@simplix-render [0-9a-f]{12} scaffold product --module mymod --list-presentation cards --menu-group people --menu-icon UsersIcon\n/);
    const origin = /@simplix-render [0-9a-f]{12} scaffold (.+)\n/.exec(text)?.[1] ?? "";
    expect(scaffoldOptionsFromOrigin(origin.split(" "))).toMatchObject({ module: "mymod", listPresentation: "cards", menuGroup: "people", menuIcon: "UsersIcon" });
  });

  it("refuses a menu value the origin could not read back as one word", async () => {
    await useDecisionAwareList();
    await expect(withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, menuGroup: "my people" }))).rejects.toThrow(/--menu-group/);
  });

  it("keeps the flags a regeneration reads out of a cards origin and a table origin the same as they were typed", () => {
    expect(scaffoldOptionsFromOrigin(["product", "--module", "mymod", "--list-presentation", "cards", "--card-title", "name"])).toMatchObject({ listPresentation: "cards", cardTitle: "name" });
    expect(listDecision({ listPresentation: "cards" })).toEqual({ listCards: true, viewToggle: true });
    expect(listDecision({ viewToggle: true })).toEqual({ listCards: false, viewToggle: true });
    expect(listDecision({})).toEqual({ listCards: false, viewToggle: false });
  });

  it("renders the same list again from its origin, so a regeneration keeps the decisions", async () => {
    await useDecisionAwareList();
    await decided();
    const first = await listText();
    await withSilentLog(() => regenerateAll(root));
    expect(await listText()).toBe(first);
  });

  it("refuses a presentation that is neither table nor cards before writing anything", async () => {
    await useDecisionAwareList();
    const before = await snapshot();
    await expect(withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, listPresentation: "grid" }))).rejects.toThrow(/takes table or cards, not "grid"/);
    expect(await snapshot()).toEqual(before);
  });

  it("refuses a text filter the entity does not search by before writing anything (the run reports the reason and exits)", async () => {
    await useDecisionAwareList();
    const before = await snapshot();
    await expect(withSilentLog(() => runScaffold("product", { module: "mymod", quiet: true, textFilter: "provider" }))).rejects.toThrow(/process\.exit\(1\)/);
    expect(await snapshot()).toEqual(before);
  });

  it("accepts a cards list without a switch flag", async () => {
    await useDecisionAwareList();
    await withSilentLog(() => scaffoldCrudCommand.parseAsync(["node", "simplix", "product", "--module", "mymod", "--list-presentation", "cards", "--card-title", "name"]));
    const cards = await listText();
    expect(cards).toContain('cardTitle="name"');
    expect(switchLines(cards)).toBe(1);
  });

  it("refuses the switch flag on a cards list before writing anything", async () => {
    await useDecisionAwareList();
    const before = await snapshot();
    await expect(withSilentLog(() => scaffoldCrudCommand.parseAsync(["node", "simplix", "product", "--module", "mymod", "--list-presentation", "cards", "--view-toggle", "--card-title", "name"]))).rejects.toThrow(/--view-toggle is for a table list/);
    expect(await snapshot()).toEqual(before);
  });
});

describe("recording the origin a list was designed with", () => {
  const LIST_PATH = `${MODULE}/src/widgets/product/list.tsx`;
  const CARDS_ORIGIN = "scaffold product --module mymod --list-presentation cards --card-title name";
  const originOf = async () => /@simplix-render [0-9a-f]{12} (.+)/.exec((await snapshot()).get(LIST_PATH) ?? "")?.[1];
  const entryOf = async () => (await generatedReport(root)).find((entry) => entry.path === LIST_PATH);

  /** A list template that draws the cards decision the way a UI kit's does. */
  async function useDecisionAwareList(): Promise<void> {
    await useKitShapedTemplates();
    await put(
      ".simplix/templates/list.hbs",
      [
        "/**\n * @simplix-generated widget/list\n */",
        "export function {{EntityPascal}}List() {",
        "  return (",
        "    <RecordList",
        "{{#if listCards}}",
        '      presentation="cards"',
        "      viewToggle",
        "{{/if}}",
        "{{#if cardTitle}}",
        '      cardTitle="{{cardTitle}}"',
        "{{/if}}",
        "    />",
        "  );",
        "}",
        "",
      ].join("\n"),
    );
  }

  /** A table list a person turned into the cards list its design asks for, by hand. */
  async function editIntoCards(): Promise<void> {
    const path = join(root, LIST_PATH);
    const text = await readFile(path, "utf-8");
    await writeFile(path, text.replace("    <RecordList\n", '    <RecordList\n      presentation="cards"\n      viewToggle\n      cardTitle="name"\n'), "utf-8");
  }

  it("moves the origin of an edited list to the cards decision and leaves its edits and its merge a no-op", async () => {
    await useDecisionAwareList();
    await scaffold();
    await editIntoCards();
    expect(await originOf()).toMatch(/^scaffold product --module mymod$/);

    const changes = await planOriginChange(root, root, [join(root, LIST_PATH)], CARDS_ORIGIN);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.refusal).toBeUndefined();
    await applyOriginChange(changes);

    expect(await originOf()).toBe(CARDS_ORIGIN);
    const text = (await snapshot()).get(LIST_PATH) ?? "";
    expect(text).toContain('cardTitle="name"');
    expect(text.match(/presentation="cards"/g)).toHaveLength(1);
    // Still the author's file, and a regeneration from the new origin changes nothing in it.
    expect(await entryOf()).toMatchObject({ state: "edited", origin: CARDS_ORIGIN, merge: "current" });
    await withSilentLog(() => regenerateAll(root));
    expect((await snapshot()).get(LIST_PATH)).toBe(text);
  });

  it("leaves a list that was not edited into cards showing the move the new origin makes", async () => {
    await useDecisionAwareList();
    await scaffold();
    // An untouched table list given the cards origin is stale: the render now draws cards.
    const [change] = await planOriginChange(root, root, [join(root, LIST_PATH)], CARDS_ORIGIN);
    await applyOriginChange([change!]);
    expect(await entryOf()).toMatchObject({ state: "stale", origin: CARDS_ORIGIN });
  });

  it("refuses an origin that does not render the file, and writes nothing", async () => {
    await useDecisionAwareList();
    await scaffold();
    const before = await snapshot();
    const [change] = await planOriginChange(root, root, [join(root, LIST_PATH)], "scaffold product --output elsewhere --list-presentation cards");
    expect(change?.refusal).toMatch(/does not render this file/);
    await applyOriginChange([change!]);
    expect(await snapshot()).toEqual(before);
  });

  it("names the paths that hold no generated file", async () => {
    await useDecisionAwareList();
    await scaffold();
    await expect(planOriginChange(root, root, [join(root, "modules/none")], CARDS_ORIGIN)).rejects.toThrow(/no generated file at or under/);
  });
});
