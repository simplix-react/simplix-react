import { mkdtemp, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAddPage } from "../commands/add-page.js";
import { generatedFailures } from "../commands/generated.js";
import { moduleGroupOf } from "../commands/check-screen.js";
import {
  appDesignProblems,
  designProblems,
  readRoutePath,
  routedPaths,
  screenDesignProblems,
  storyManifestProblems,
} from "../checks/design-source.js";
import type { SimplixConfig } from "../config/types.js";
import { findOutputDirProblems } from "../config/output-dirs.js";
import { appFor, storyTargets, templatesFor, templatesOption } from "../utils/app-config.js";
import { captureWrites } from "../utils/fs.js";
import { appTemplateDir, loadProjectTemplates, templateFor } from "../utils/project-templates.js";

const made: string[] = [];
async function scratch(prefix: string): Promise<string> {
  const dir = await realpath(await mkdtemp(join(tmpdir(), prefix)));
  made.push(dir);
  return dir;
}

async function put(root: string, files: Record<string, string>): Promise<void> {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content, "utf-8");
  }
}

/** A kit package whose manifest names its template directory, under the workspace's `kits/`. */
function kit(name: string, dir: string, templates: Record<string, string>): Record<string, string> {
  const files: Record<string, string> = { [`kits/${dir}/package.json`]: JSON.stringify({ name, simplix: { templates: "templates" } }) };
  for (const [file, content] of Object.entries(templates)) files[`kits/${dir}/templates/${file}`] = content;
  return files;
}

const page = (body: string) => `/**\n * @simplix-generated page/static-page\n */\nexport function {{NamePascal}}Page() {\n  return "${body}";\n}\n`;
const story = (body: string) => `/**\n * @simplix-generated story/static-page\n */\nexport default { title: "{{storyTitle}}" };\nexport const Frame = "${body}";\n`;

/**
 * Two apps in one frontend workspace: `console` draws with the console kit and has no `apps`
 * entry, so it reads the top-level settings exactly as a project without `apps` does; `site`
 * draws with the site kit, writes its frames elsewhere and owns the `site` module group.
 */
const TWO_APPS = `export default {
  modules: { groups: ["console", "site"] },
  templates: { from: "@kits/console", storiesDir: "board" },
  apps: {
    site: {
      moduleGroups: ["site"],
      templates: { from: "@kits/site", storiesDir: "site-stories", story: { files: { "site-pricing": "pricing.stories.tsx" } } },
    },
  },
};
`;

async function twoApps(): Promise<string> {
  const root = await scratch("simplix-apps-");
  await put(root, {
    "simplix.config.ts": TWO_APPS,
    "pnpm-workspace.yaml": "packages:\n  - kits/*\n  - apps/*\n",
    ...kit("@kits/console", "console", { "static-page.hbs": page("console kit"), "static-page.stories.hbs": story("console frame") }),
    ...kit("@kits/site", "site", { "static-page.hbs": page("site kit"), "static-page.stories.hbs": story("site frame"), "record-page.hbs": page("site record") }),
    "board/.keep": "",
    "site-stories/.keep": "",
  });
  return root;
}

afterEach(async () => {
  for (const dir of made.splice(0)) await rm(dir, { recursive: true, force: true });
});

describe("which app a page is drawn for", () => {
  const config: SimplixConfig = { apps: { site: { moduleGroups: ["site"] }, docs: {} } };

  it("takes the app --app names, else the app claiming the module's group, else none", () => {
    expect(appFor(config, { app: "console" })).toBe("console");
    expect(appFor(config, { moduleGroup: "site" })).toBe("site");
    expect(appFor(config, { moduleGroup: "shared" })).toBeUndefined();
    expect(appFor(config, {})).toBeUndefined();
    expect(appFor({}, { moduleGroup: "site" })).toBeUndefined();
  });

  it("refuses a module group two apps claim, naming both", () => {
    const twice: SimplixConfig = { apps: { a: { moduleGroups: ["shared"] }, b: { moduleGroups: ["shared"] } } };
    expect(() => appFor(twice, { moduleGroup: "shared" })).toThrow(/module group "shared" is listed in the moduleGroups of apps a, b/);
  });

  it("reads the group of a screen's module from its directory", () => {
    expect(moduleGroupOf("/p", "/p/modules/site/pricing/src/widgets/plan")).toBe("site");
    expect(moduleGroupOf("/p", "/p/modules/user/src/widgets/user")).toBeUndefined();
  });
});

describe("an app's template settings", () => {
  const config: SimplixConfig = {
    templates: { from: "@kits/console", storiesDir: "board", story: { id: "board-{entity}" } },
    apps: { site: { templates: { from: "@kits/site" } }, bare: {} },
  };

  it("takes each key the app sets and the top-level value of every key it leaves out", () => {
    expect(templatesFor(config, "site")).toEqual({ from: "@kits/site", storiesDir: "board", story: { id: "board-{entity}" } });
  });

  it("is the top-level settings, unchanged, for no app, an app with no templates and an app the config does not list", () => {
    expect(templatesFor(config, undefined)).toBe(config.templates);
    expect(templatesFor(config, "bare")).toBe(config.templates);
    expect(templatesFor(config, "unlisted")).toBe(config.templates);
  });

  it("names the option a value came from, so an error points at the line to fix", () => {
    expect(templatesOption(config, "from", "site")).toBe('apps["site"].templates.from');
    expect(templatesOption(config, "from", "bare")).toBe("templates.from");
  });

  it("lists every story directory once, each with its own naming", () => {
    const targets = storyTargets({ ...config, apps: { site: { templates: { storiesDir: "site-stories", story: { id: "site-{entity}" } } }, same: { templates: { storiesDir: "board" } } } });
    expect(targets).toEqual([
      { storiesDir: "board", story: { id: "board-{entity}" } },
      { storiesDir: "site-stories", story: { id: "site-{entity}" } },
    ]);
  });

  it("checks an app's story directory as it checks the top-level one", async () => {
    const root = await scratch("simplix-apps-dirs-");
    const problems = await findOutputDirProblems(root, { apps: { site: { templates: { storiesDir: "missing" } } } });
    expect(problems.map((one) => one.option)).toEqual(['apps["site"].templates.storiesDir']);
  });
});

describe("templates in force for an app, name by name", () => {
  it("reads the app's own folder, then the project's, then the kit, then the bundled template", async () => {
    const root = await twoApps();
    await put(root, {
      ".simplix/templates/site/static-page.hbs": "app override",
      ".simplix/templates/static-page.hbs": "project",
      ".simplix/templates/dashboard-page.hbs": "project dashboard",
    });
    const site = await loadProjectTemplates(root, "@kits/site", "site");
    expect(templateFor(site, "static-page", "bundled")).toBe("app override");
    expect(templateFor(site, "dashboard-page", "bundled")).toBe("project dashboard");
    expect(templateFor(site, "record-page", "bundled")).toContain("site record");
    expect(templateFor(site, "error-page", "bundled")).toBe("bundled");
  });

  it("never lets one app's folder reach another app or a page no app owns", async () => {
    const root = await twoApps();
    await put(root, { ".simplix/templates/site/static-page.hbs": "app override" });
    const console = await loadProjectTemplates(root, "@kits/console", "console");
    expect(templateFor(console, "static-page", "bundled")).toContain("console kit");
    const unowned = await loadProjectTemplates(root, "@kits/console");
    expect([...unowned]).toEqual([...console]);
  });

  it("names the app's option when the app's kit cannot be found", async () => {
    const root = await twoApps();
    await expect(loadProjectTemplates(root, "@kits/missing", "site", 'apps["site"].templates.from')).rejects.toThrow(/apps\["site"\]\.templates\.from names "@kits\/missing"/);
  });

  it("refuses an app name that is not one directory", () => {
    expect(() => appTemplateDir("/p", "../x")).toThrow(/is not an app name/);
    expect(() => appTemplateDir("/p", "a/b")).toThrow(/is not an app name/);
  });
});

describe("add-page in a workspace of two apps", () => {
  let cwd: string;
  let root: string;
  beforeEach(async () => {
    cwd = process.cwd();
    root = await twoApps();
    process.chdir(root);
  });
  afterEach(() => process.chdir(cwd));

  const written = async (owner: { app?: string; module?: string }) => {
    const files = await captureWrites(() => runAddPage("static", "pricing", owner));
    return new Map([...files].map(([path, text]) => [path.slice(root.length + 1), text]));
  };

  it("draws an app's page from its kit and writes its frame to its own story directory under its own name", async () => {
    const files = await written({ app: "site" });
    expect(files.get("apps/site/src/pages/pricing/page.tsx")).toContain('return "site kit"');
    expect(files.get("site-stories/pricing.stories.tsx")).toContain('Frame = "site frame"');
    expect([...files.keys()].some((path) => path.startsWith("board/"))).toBe(false);
  });

  it("draws a page of an app with no apps entry exactly as a project without apps does", async () => {
    const files = await written({ app: "console" });
    expect(files.get("apps/console/src/pages/pricing/page.tsx")).toContain('return "console kit"');
    expect(files.get("board/console-pricing.stories.tsx")).toContain('Frame = "console frame"');

    await writeFile(join(root, "simplix.config.ts"), 'export default { modules: { groups: ["console", "site"] }, templates: { from: "@kits/console", storiesDir: "board" } };\n');
    const without = await written({ app: "console" });
    expect([...without]).toEqual([...files]);
  });

  it("writes no frame for an app that sets storiesDir to null, though the top level names a directory", async () => {
    await writeFile(join(root, "simplix.config.ts"), TWO_APPS.replace('storiesDir: "site-stories"', "storiesDir: null"));
    const files = await written({ app: "site" });
    expect(files.get("apps/site/src/pages/pricing/page.tsx")).toContain('return "site kit"');
    expect([...files.keys()].filter((path) => path.endsWith(".stories.tsx"))).toEqual([]);
    expect(storyTargets({ templates: { storiesDir: "board" }, apps: { site: { templates: { storiesDir: null } } } })).toEqual([{ storiesDir: "board", story: undefined }]);
  });

  it("draws a module page for the app that claims the module's group", async () => {
    await put(root, { "modules/site/plans/package.json": JSON.stringify({ name: "@acme/site-plans" }) });
    const files = await written({ module: "site/plans" });
    expect(files.get("modules/site/plans/src/pages/pricing/page.tsx")).toContain('return "site kit"');
    // A capture run of a module with no pages index yet writes the index and does not read it back.
    expect(files.get("modules/site/plans/src/pages/index.ts")).toContain('export { PricingPage } from "./pricing/page";');
  });
});

describe("the design gate", () => {
  it("reads a TanStack file route's path", () => {
    expect(readRoutePath('export const Route = createFileRoute("/pricing")({})')).toBe("/pricing");
    expect(readRoutePath("export const Route = createRootRoute({})")).toBeUndefined();
  });

  it("reads every route under the directory, at any depth, and skips layouts", async () => {
    const root = await scratch("simplix-routes-");
    await put(root, {
      "r/__root.tsx": 'createFileRoute("/__root")',
      "r/index.tsx": 'createFileRoute("/")',
      "r/account/credits.tsx": 'createFileRoute("/account/credits")',
      "r/notes.md": 'createFileRoute("/notes")',
    });
    expect(await routedPaths(join(root, "r"))).toEqual(["/", "/account/credits"]);
    expect(await routedPaths(join(root, "missing"))).toBeUndefined();
  });

  describe("screen-design", () => {
    const manifest = { screens: [{ app: "admin", route: "/users" }, { app: "site", route: "/pricing" }] };

    it("passes a route with an entry of its own app", () => {
      expect(screenDesignProblems(manifest, "admin", ["/users"], "design/screens.json")).toEqual([]);
    });

    it("refuses a route whose only entry is another app's, naming the app, the route and the manifest", () => {
      const problems = screenDesignProblems(manifest, "admin", ["/users", "/pricing"], "design/screens.json");
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(/^admin \/pricing: routed screen with no entry in design\/screens\.json \(design\.source screen-design\)/);
    });

    it("refuses a manifest with no screens list", () => {
      expect(screenDesignProblems({ rows: [] }, "admin", ["/"], "m.json")).toEqual(['admin: m.json has no "screens" list (design.source screen-design)']);
    });
  });

  describe("story-manifest", () => {
    const manifest = {
      rows: [
        { route: "/pricing", state: "visitor", stories: { desktop: ["web-pricing--desktop"], phone: ["web-pricing--phone"] }, fixture: "visitor" },
        { route: "/download", state: "visitor", stories: { desktop: [] } },
      ],
      exempt: [{ route: "/login/complete", reason: "Sign-in callback, draws nothing" }],
    };

    it("passes a route with a row naming a story, and an exempt route with its reason", () => {
      expect(storyManifestProblems(manifest, "site", ["/pricing", "/login/complete"], "site-design.json")).toEqual([]);
    });

    it("refuses a route with no row, and a route whose rows name no story, naming the app, the route and the manifest", () => {
      const problems = storyManifestProblems(manifest, "site", ["/pricing", "/download", "/help"], "site-design.json");
      expect(problems).toHaveLength(2);
      expect(problems[0]).toMatch(/^site \/download: routed screen with no row naming a story in site-design\.json \(design\.source story-manifest\)/);
      expect(problems[1]).toMatch(/^site \/help: routed screen with no row naming a story in site-design\.json/);
    });

    it("refuses an exemption without its reason", () => {
      const problems = storyManifestProblems({ rows: [], exempt: [{ route: "/x", reason: " " }] }, "site", ["/x"], "m.json");
      expect(problems[0]).toBe("site /x: exempt in m.json without a reason");
      expect(problems[1]).toMatch(/^site \/x: routed screen with no row/);
    });
  });

  it("judges each app against its own source, and refuses a manifest that is not there by naming the app and the path", async () => {
    const root = await scratch("simplix-design-");
    await put(root, {
      "apps/admin/src/routes/__root.tsx": "createRootRoute({})",
      "apps/admin/src/routes/users.tsx": 'createFileRoute("/users")',
      "apps/site/src/routes/pricing.tsx": 'createFileRoute("/pricing")',
      "apps/site/src/routes/help.tsx": 'createFileRoute("/help")',
      "design/screens.json": JSON.stringify({ screens: [{ app: "admin", route: "/users" }] }),
      "design/site.json": JSON.stringify({ rows: [{ route: "/pricing", stories: { desktop: ["web-pricing--desktop"] } }] }),
    });
    const config: SimplixConfig = {
      apps: {
        admin: { design: { source: "screen-design", manifest: "design/screens.json" } },
        site: { design: { source: "story-manifest", manifest: "design/site.json" } },
        docs: {},
      },
    };
    const verdict = await designProblems(root, config);
    expect(verdict.apps).toEqual(["admin", "site"]);
    expect(verdict.routes).toBe(3);
    expect(verdict.problems).toHaveLength(1);
    expect(verdict.problems[0]).toMatch(/^site \/help: routed screen with no row naming a story in design\/site\.json/);

    const missing = await appDesignProblems(root, "site", { source: "story-manifest", manifest: "design/none.json" });
    expect(missing.problems[0]).toMatch(/^site: apps\["site"\]\.design\.manifest "design\/none\.json" resolves to .*none\.json, which is not a file \(design\.source story-manifest\)/);

    const noRoutes = await appDesignProblems(root, "site", { source: "story-manifest", manifest: "design/site.json", routes: "apps/site/src/nowhere" });
    expect(noRoutes.problems[0]).toMatch(/^site: apps\["site"\]\.design\.routes "apps\/site\/src\/nowhere" .* which is not a directory/);
  });

  it("judges nothing in a project whose apps declare no design source", async () => {
    const root = await scratch("simplix-design-none-");
    expect(await designProblems(root, {})).toEqual({ apps: [], routes: 0, problems: [] });
    expect(await designProblems(root, { apps: { site: { moduleGroups: ["site"] } } })).toEqual({ apps: [], routes: 0, problems: [] });
  });

  it("fails the generated report on a design finding, and adds nothing without one", () => {
    expect(generatedFailures([], { check: false, conflicted: false, design: ["site /help: routed screen with no row"] })).toEqual(["site /help: routed screen with no row"]);
    expect(generatedFailures([], { check: false, conflicted: false, design: [] })).toEqual([]);
  });
});
