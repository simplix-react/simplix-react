import { resolve } from "node:path";
import type { HttpMethod, CrudRole } from "@simplix-react/contract";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ResponseAdapterConfig } from "../openapi/adaptation/response-adapter.js";

/**
 * Defines how a CRUD role maps to HTTP method(s) and path pattern(s).
 *
 * Path patterns use basePath-relative segments:
 * - `/` — basePath itself (collection)
 * - `/:id` — basePath + any path param
 * - `/*` — basePath + any single segment
 * - `/literal` — basePath + exact literal segment
 */
export interface CrudEndpointPattern {
  /** HTTP method(s). Array for multiple methods (e.g., `["PUT", "PATCH"]`). */
  method: HttpMethod | HttpMethod[];
  /** BasePath-relative path pattern(s). Array for multiple patterns. */
  path: string | string[];
}

/**
 * Environment entry for `.http` file generation.
 *
 * @see {@link SimplixConfig.http} for environment configuration
 */
export interface SimplixHttpEnvironment {
  /** Absolute base URL for HTTP requests in this environment. */
  baseUrl: string;
}

/**
 * Project-level configuration loaded from `simplix.config.ts` at the project root.
 *
 * @remarks
 * Controls code generation behavior, mock layer defaults, package naming,
 * and OpenAPI domain splitting. All fields are optional — sensible defaults
 * are applied when omitted.
 *
 * @example
 * ```ts
 * import { defineConfig } from "@simplix-react/cli";
 *
 * export default defineConfig({
 *   plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
 *   api: { baseUrl: "/api/v1" },
 *   packages: { prefix: "acme" },
 *   codegen: { header: true },
 *   openapi: [
 *     {
 *       spec: "openapi.json",
 *       profile: "simplix-boot",
 *       domains: {
 *         project: ["Projects", "Tasks"],
 *         auth: ["Auth", "Users"],
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @see {@link defineConfig} — identity wrapper for type-safe autocompletion
 */
export interface SimplixConfig {
  /**
   * CLI extension plugin modules to load before running any command.
   *
   * @remarks
   * Each entry is a package specifier (e.g. `"@simplix-react-ext/simplix-boot-cli-plugin"`).
   * Plugins register spec profiles and response adapters needed for correct
   * code generation. The core CLI is backend-agnostic and does not know about
   * any specific extension — the target backend is declared here.
   *
   * If a {@link OpenAPISpecConfig.profile | profile} is referenced but its
   * plugin is not listed (or cannot be resolved), the `openapi` command warns
   * and exits rather than silently generating incorrect code.
   */
  plugins?: string[];

  /** API settings — used for basePath in code generation */
  api?: {
    /** API base path (default: "/api") */
    baseUrl?: string;
  };

  /** Global QueryBuilder — applied to all domains */
  queryBuilder?: unknown;

  /** Package naming options */
  packages?: {
    /** Short prefix for generated package names (default: derived from root package.json name) */
    prefix?: string;
  };

  /** .http file environment settings */
  http?: {
    environments?: Record<string, SimplixHttpEnvironment>;
  };

  /**
   * Where the page and widget templates come from, beneath the project's own
   * `.simplix/templates`. An app listed in {@link SimplixConfig.apps} may override each key.
   */
  templates?: SimplixTemplatesConfig;

  /**
   * Settings that differ between the apps of one workspace, keyed by the app's directory name under
   * `apps/` (`"acme-admin"`).
   *
   * @remarks
   * Two apps in one frontend workspace can be drawn by different UI kits and designed in different
   * references: an operator console from a console kit on a mockup board, a customer site from a
   * site kit on a Storybook of its own. A page generated for an app reads that app's settings:
   * `simplix add-page --app <name>` names the app outright, and `--module <group>/<name>` (as
   * `simplix scaffold --module` does) reaches the app whose `moduleGroups` holds the group. A page
   * no app claims, and every page of a project without this block, reads the top-level
   * `templates` alone.
   *
   * @example
   * ```ts
   * apps: {
   *   "acme-admin": {
   *     design: { source: "screen-design", manifest: "design/screen-design.json" },
   *   },
   *   "acme-site": {
   *     moduleGroups: ["site"],
   *     templates: { from: "@acme-kits/site-clarity" },
   *     design: { source: "story-manifest", manifest: "design/site-design-manifest.json" },
   *   },
   * }
   * ```
   */
  apps?: Readonly<Record<string, SimplixAppConfig>>;

  /**
   * How UI modules are laid out under `modules/`. `groups` names directories that hold modules
   * rather than being one (`["admin", "portal", "shared"]`), so `--module admin/user` addresses
   * `modules/admin/user` and every other value names a module directly under `modules/`.
   * `dependencies` is what `add-module` puts in each new module's `package.json`.
   */
  modules?: {
    groups?: string[];
    /**
     * Packages every module `add-module` writes declares as a dependency, by name → version range
     * (`{ "@acme/identity-ui": "workspace:*" }`). A package all the project's screens import, such
     * as the one holding its signed-in subject, belongs here so each new module resolves it
     * without a hand edit. Absent or empty, a module declares none of its own.
     */
    dependencies?: Readonly<Record<string, string>>;
  };

  /**
   * The route file a list screen is reached through, by module group (`admin` for
   * `--module admin/<name>`). Absent, no route is written.
   *
   * @remarks
   * `dir` is the app's file-route directory, relative to the project root. `template` names the
   * route template (default `route`; the console-clarity kit ships `route.tanstack` for TanStack
   * file routes). The path is the entity's plural in kebab case unless `paths` names another
   * (`{ "job-position": "positions" }`). `menu` inserts the screen's menu entry, rendered from the
   * `menu-entry` template beside the route template, on the line before `marker` in `file` when no
   * entry for the path exists yet; `catalogs` names, per locale, the JSON catalog the entry's
   * label goes into under `keyPath`, written from the entity's plural name in SimpliX Meta.
   * `menu.gate` names how the entry's gate refers to the permission group, for a project that
   * keeps its groups in one table instead of writing them inline.
   */
  routes?: Readonly<Record<string, RouteTarget>>;

  /**
   * What a scaffold decides where SimpliX Meta is silent.
   *
   * @remarks
   * `defaultSortFields` names the fields a generated list may open sorted by, in order of
   * preference, each newest first unless it gives a direction
   * (`["occurredAt", "createdAt", { field: "sortOrder", direction: "asc" }]`). An entity whose
   * Meta declares `defaultSort` uses that instead; a list whose row carries none of them, or
   * carries one the backend cannot order by, opens in the server's order. The row's key is
   * never used. Defaults to none.
   *
   * `maskedSuffix` names the suffix of a masked form of a field (`"Masked"`): a record carrying
   * both `recipientEmail` and `recipientEmailMasked` is drawn with the masked one only, since
   * SimpliX Meta marks no personal data and the pairing is the only statement of which form a
   * screen may show. Defaults to none.
   *
   * `referencePickers` maps a peek kind (the referenced entity's name in camel case) to the hook
   * that searches that entity for a form's picker, and the module it is imported from. A form field
   * that references an entity listed here is edited through that picker; a required reference to
   * an entity not listed is reported by `simplix check-screen`, since its id would be typed by hand.
   * `facet` names the hook (from the same module, made by `createEntityFacet`) that searches the
   * entity for a list filter: a list over a key of that entity is filtered by the record's name.
   * A facet resolves the records it has picked by one column of the filtered list, so a fixed hook
   * serves only the column it was made for. `facetFor` names a factory instead (from the same
   * module, taking the filtered column and returning the hook), which a generated list calls once
   * per filtered column (`createUserFacet("ownerUserId")`); it wins over `facet`.
   *
   * `holders` maps a scaffolded entity (camel case, as `scaffold <entity>` names it) to the holders
   * its detail leaves out: `exclude` lists a holding entity (`"creditAccount"`, every holder of that
   * entity) or one holder by its key field (`"userNote.authorId"`). An excluded holder gets no tab,
   * no import and no module dependency, so a regeneration never adds a tab a screen dropped on
   * purpose. A holder whose module already depends on the screen's own module is left out without
   * being listed, since its tab would close a dependency cycle.
   */
  scaffold?: {
    readonly defaultSortFields?: readonly (string | { readonly field: string; readonly direction?: "asc" | "desc" })[];
    readonly maskedSuffix?: string;
    readonly referencePickers?: Readonly<Record<string, { readonly hook: string; readonly from: string; readonly facet?: string; readonly facetFor?: string }>>;
    readonly holders?: Readonly<Record<string, { readonly exclude?: readonly string[] }>>;
  };

  /**
   * How references are drawn.
   *
   * @remarks
   * `peeks` names the peek a reference opens. Where the contract does not name the referenced
   * entity it is keyed by the reference's stem (`user` for `userId` beside `userName`): a key whose
   * record arrives nested is named by that record's type, a flat key only by its own name, which
   * need not be the entity the app registers a peek for (`{ user: "userAccount", owner: "userAccount" }`).
   * A reference SimpliX Meta declares names its entity, and the entity's name in camel case is the
   * peek kind; an entry keyed by that name maps it to the kind the app registers
   * (`{ userRole: "role" }`). A stem entry is not read for a declared reference, and the scaffold
   * warns where one names another kind than the one the reference opens.
   */
  references?: {
    peeks?: Readonly<Record<string, string>>;
  };

  /**
   * How generated files are written.
   *
   * @remarks
   * `format` runs the project's own formatter over every render before it is written, recorded as
   * the merge base under `.simplix/generated`, or compared with the file on disk. A project that
   * formats generated files before committing them sets it, so an untouched file stays untouched
   * after formatting and a three-way merge reads the edits against the text they were made on.
   * It receives the render and the path the file goes to, and returns the formatted text. Without
   * it a render is used exactly as the template produced it.
   *
   * `after` lists commands that bring something derived from the generated files up to date (a
   * design reference's catalogs, an index). They run once, in order, after `simplix scaffold`,
   * `simplix add-page` and `simplix generated --all` have written their files, never from a
   * report-only `simplix generated`. A step that exits non-zero ends the run: the remaining steps
   * are skipped, the exit code is reported and the command fails. Without it nothing runs.
   */
  generated?: {
    format?: (source: string, filePath: string) => string | Promise<string>;
    after?: readonly GeneratedAfterStep[];
  };

  /** Code generation options */
  codegen?: {
    /** Prepend auto-generated header comment to generated files (default: true) */
    header?: boolean;
  };

  /** Internationalization settings */
  i18n?: {
    /** Supported locale codes (default: ["en", "ko", "ja"]) */
    locales?: string[];
    /** Default locale code (default: "en") */
    defaultLocale?: string;
  };

  /** OpenAPI code generation — array of per-spec configurations */
  openapi?: OpenAPISpecConfig[];

  /** What the project checks run over; each command also takes its roots as arguments. */
  checks?: SimplixChecksConfig;
}

/**
 * Where page and widget templates come from, and where the generated design-reference stories go.
 *
 * @remarks
 * `from` names a UI kit package (resolved from the project root, then from the workspace's
 * packages) or a directory path. The kit's `package.json` says where its templates are under
 * `simplix.templates`; a path is read as the template directory itself. Without this setting the
 * CLI looks for one dependency of the project root that declares `simplix.templates`.
 *
 * Under an app of {@link SimplixConfig.apps}, each key set here replaces the top-level key of the
 * same name for that app's pages, and each key left out falls back to it.
 */
export interface SimplixTemplatesConfig {
  from?: string;
  /**
   * Where generated Storybook stories are written, relative to the project root: the design
   * reference's screens directory. A template with a `.stories` sibling (`list.stories.hbs`)
   * renders one story per scaffolded entity there. Without it no story is generated.
   * The directory must exist: `simplix generated` and the commands that write there refuse a
   * path that does not resolve to one, naming the option and the resolved path.
   * An app sets `null` to write no stories where the top level names a directory: its design
   * reference is not the one the top-level stories go to.
   */
  storiesDir?: string | null;
  /**
   * The board story's id and title, as patterns over `{entity}` (kebab case) and `{Entity}`
   * (Pascal case), so the design reference's own navigation can link to a generated frame
   * (`{ id: "backoffice-{entity}", title: "Back office/{Entity}" }`). Absent, the story keeps
   * Storybook's title-derived id under `Generated/{Entity}`.
   */
  story?: {
    readonly id?: string;
    readonly title?: string;
    /**
     * The file a scaffold writes its story to, relative to `storiesDir`, by scaffold key: an
     * entity's kebab name for `scaffold` (`{ "background-job": "jobs.stories.tsx" }`), a page
     * story's default file name without `.stories.tsx` for `add-page`. A board that already
     * draws the screen maps it here, so the generated story is that frame rather than a second
     * one beside it; `simplix generated --adopt` then records the frame's merge base.
     */
    readonly files?: Readonly<Record<string, string>>;
  };
}

/** One app's own settings (see {@link SimplixConfig.apps}). */
export interface SimplixAppConfig {
  /**
   * Module groups (from `modules.groups`) whose modules hold this app's screens, so a page or a
   * scaffold for `--module <group>/<name>` is drawn from this app's templates. A group belongs to
   * at most one app; a group no app names keeps the top-level templates.
   */
  readonly moduleGroups?: readonly string[];
  /**
   * The app's templates. Read in this order, name by name: the project's
   * `.simplix/templates/<app>/`, the project's `.simplix/templates/`, the kit `from` names (this
   * app's, else the top-level one), then the CLI's bundled template.
   */
  readonly templates?: SimplixTemplatesConfig;
  /** Where the app's screens are designed before they are made; absent, no design gate runs for the app. */
  readonly design?: SimplixDesignSource;
}

/**
 * The design reference an app's routed screens are checked against by `simplix generated` and
 * `simplix check-screen`: every routed screen of the app needs its design before it is made.
 *
 * @remarks
 * The kind names the manifest's shape:
 *
 * - `screen-design`: `{ "screens": [{ "app": "<app>", "route": "/path", ... }] }`, one design entry
 *   per routed screen of every app the file covers, matched on the app's name and the route.
 * - `story-manifest`: `{ "rows": [{ "route": "/path", "state": "...", "stories": { "<width>":
 *   ["<story id>", ...] }, "fixture": "..." }], "exempt": [{ "route": "/path", "reason": "..." }] }`,
 *   the file of one app: a route is designed by a row naming at least one story id. A route that
 *   draws nothing to design (a sign-in callback) is listed under `exempt` with its reason.
 *
 * Routes are read from the app's TanStack file routes: every `.ts`/`.tsx` file under `routes`
 * whose name does not start with `__`, by the path its `createFileRoute("...")` call names. That
 * path is the route's id, so a manifest names `login_.complete.tsx` as `"/login_/complete"`.
 */
export interface SimplixDesignSource {
  readonly source: "screen-design" | "story-manifest";
  /** The manifest, relative to the project root. */
  readonly manifest: string;
  /** The app's file-route directory, relative to the project root. Default `apps/<app>/src/routes`. */
  readonly routes?: string;
}

/** Inputs of `simplix cycles` and `simplix meta-removals`, relative to the project root. */
export interface SimplixChecksConfig {
  cycles?: {
    /** Directories whose source files are the nodes of the import graph. */
    roots?: string[];
  };
  metaRemovals?: {
    /** Directories whose source files are searched for names the snapshot lost. */
    roots?: string[];
    /**
     * The SimpliX Meta snapshot to compare. Absent, the one `openapi[].meta.snapshot` the config
     * declares is used.
     */
    snapshot?: string;
    /**
     * A JSON file `{ "acknowledged": ["field Owner.name", ...] }` listing removals that are
     * intended. Absent, nothing is acknowledged.
     */
    acknowledged?: string;
  };
}

/**
 * DTO metadata generation for one spec.
 *
 * @remarks
 * SimpliX Meta is served by the backend and carries what an OpenAPI document loses — validation
 * constraints, search operators, `@PreAuthorize` and labeled enums. It is generated into
 * `src/generated-meta/` of every domain package the spec produces.
 */
export interface OpenAPIMetaConfig {
  /**
   * Endpoint URL or snapshot path. Omit it and the source is built the way the i18n download
   * already builds its own: the origin of `spec` plus the profile's `metaEndpoint`.
   */
  source?: string;
  /** Where a fetched SimpliX Meta is written for offline regeneration. */
  snapshot?: string;
  /** Domains whose barrel exports the meta output instead of the orval output. */
  export?: string[];
  /**
   * Tags no domain claims on purpose (a development controller, an API browser), as glob patterns
   * over the dot-separated tag: `*` matches within one segment, `**` across segments. A tag matched
   * here is neither warned about nor refused by `--strict`.
   */
  ignoreTags?: string[];
}

/** Per-spec OpenAPI configuration */
export interface OpenAPISpecConfig {
  /** OpenAPI spec file path (relative to project root) or URL */
  /**
   * The OpenAPI document the Orval half reads. Optional: a project that has finished migrating
   * runs `simplix meta`, which needs no document — it states `meta.source` instead. `simplix
   * openapi` still requires one and says so.
   */
  spec?: string;
  /** Spec Profile preset name (bundles naming + responseAdapter) */
  profile?: string;
  /** NamingStrategy — overrides profile's naming if both are set */
  naming?: OpenApiNamingStrategy;
  /** ResponseAdapter — overrides profile's responseAdapter if both are set */
  responseAdapter?: ResponseAdapterConfig;
  /** Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/) */
  domains: Record<string, string[]>;
  /** CRUD role detection patterns. When omitted, no CRUD roles are assigned. */
  crud?: Partial<Record<CrudRole, CrudEndpointPattern>>;
  /** DTO metadata generation. Omit the block and the meta pipeline does not run for this spec. */
  meta?: OpenAPIMetaConfig;
}

/** Find the spec config that contains the given domain name */
export function findSpecForDomain(
  specs: OpenAPISpecConfig[] | undefined,
  domainName: string,
): OpenAPISpecConfig | undefined {
  return specs?.find((s) => domainName in s.domains);
}

/** Find the spec config matching a given source path/URL */
export function findSpecBySource(
  specs: OpenAPISpecConfig[] | undefined,
  source: string,
  rootDir: string,
): OpenAPISpecConfig | undefined {
  return specs?.find((s) => {
    // A migrated project states no document at all, so it matches no source.
    if (s.spec === undefined) return false;
    if (isUrlSpec(s.spec) || isUrlSpec(source)) {
      return s.spec === source;
    }
    return resolve(rootDir, s.spec) === resolve(rootDir, source);
  });
}

function isUrlSpec(source: string): boolean {
  return source.startsWith("http://") || source.startsWith("https://");
}

/** Per-entity CRUD role → operationId mapping */
export interface CrudEntityConfig {
  list?: string;
  get?: string;
  getForEdit?: string;
  create?: string;
  update?: string;
  delete?: string;
  multiUpdate?: string;
  batchUpdate?: string;
  batchDelete?: string;
  search?: string;
  tree?: string;
  subtree?: string;
  /** Extended roles (e.g. order, activate, archive) */
  [role: string]: string | undefined;
}

/** Entity name → CRUD config mapping for a domain package */
export type CrudMap = Record<string, CrudEntityConfig>;

/** One command run after a generator has written its files (see `SimplixConfig.generated`). */
export interface GeneratedAfterStep {
  /** The directory the command runs in, relative to the project root. Absent, the project root. */
  readonly cwd?: string;
  /** The command line, run through the shell. */
  readonly command: string;
  /**
   * What the run does when this command does not exit with 0: `stop` (the default) skips the steps after it, since a
   * later step may read what this one writes; `continue` runs them anyway, for a gate whose verdict no later step
   * depends on (a design check beside a typecheck). The run still exits 1 when any step failed.
   */
  readonly onFailure?: "stop" | "continue";
}

/**
 * How a menu entry's gate names the permission group its list endpoint requires.
 *
 * @remarks
 * Without it the gate is `{ action: "list", subject: "<GROUP>" }` with the group as a string
 * literal. A project that reads every group from one table (`SUBJECTS`) states the expression
 * instead, so the menu and the screens it leads to move with the table.
 */
export interface MenuGateConfig {
  /**
   * The `subject` expression, a Handlebars template over the route's render context, which also
   * holds `entityCamel` (the entity's name in camel case) and `group` (the permission group).
   */
  readonly subject: string;
  /**
   * The table the expression reads from. A scaffold that inserts an entry whose expression is
   * `<name>.<key>` adds `<key>: "<group>"` to the table when it has no such key; a key it already
   * has keeps its value.
   */
  readonly table?: {
    /** The file declaring `export const <name> = { ... }`, relative to the project root. */
    readonly file: string;
    /** The exported object's name. Default `SUBJECTS`. */
    readonly name?: string;
  };
}

/** Where one module group's list screens are routed (see `SimplixConfig.routes`). */
export interface RouteTarget {
  readonly dir: string;
  readonly template?: string;
  readonly paths?: Readonly<Record<string, string>>;
  /** Entities (kebab case) whose list is reached only inside another screen, so gets no route. */
  readonly except?: readonly string[];
  readonly menu?: {
    readonly file: string;
    readonly marker: string;
    /** The icon the entry names; the menu file must import it. */
    readonly icon?: string;
    readonly catalogs?: Readonly<Record<string, string>>;
    readonly keyPath?: string;
    /** How the entry's gate names its permission group; absent, the group is written as a string literal. */
    readonly gate?: MenuGateConfig;
  };
}
