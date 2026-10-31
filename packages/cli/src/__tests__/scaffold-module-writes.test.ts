import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { regenerateAll } from "../commands/generated.js";
import { runScaffold } from "../commands/scaffold-crud.js";
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
