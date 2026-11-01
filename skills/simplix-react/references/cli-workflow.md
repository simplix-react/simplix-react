# CLI & Scaffolding Workflow

The `simplix` CLI is the front door to the framework. New projects, domain packages, feature modules, and CRUD UI are **generated**, not hand-written - generation keeps everything aligned with the structure the validators and the derivation pipeline expect. When an OpenAPI spec exists, treat generation as the source of truth and refine with `customizeApi`, never by editing generated files.

## Command reference

| Command | Purpose |
| --- | --- |
| `simplix init <name>` | Scaffold a new monorepo (`packages/`, `modules/`, `apps/`, `simplix.config.ts`) |
| `simplix openapi <spec>` | Generate domain code from an OpenAPI spec via Orval (file path or URL) |
| `simplix add-domain <name>` | Add a domain package **skeleton** to fill in by hand |
| `simplix add-module <name>` | Add a new FSD feature module |
| `simplix scaffold <entity>` | Generate CRUD widgets into a module's `widgets/` layer |
| `simplix init-ui` | Initialize `@simplix-react/ui` with shadcn/ui integration |
| `simplix validate` | Validate project structure, FSD layer rules, imports, and i18n |
| `simplix i18n-codegen` | Generate TypeScript types from i18n JSON files |

The command is `simplix scaffold` (not `scaffold-crud`).

### simplix init `<project-name>`

Creates a new simplix-react monorepo and its `simplix.config.ts`.

| Option | Effect |
| --- | --- |
| `-s, --scope <scope>` | npm scope for generated packages |
| `--no-demo` | Skip the demo app |
| `--no-i18n` | Skip i18n setup |
| `--no-auth` | Skip auth setup |
| `--no-access` | Skip access-control setup |
| `-y, --yes` | Accept all defaults (non-interactive) |

### simplix openapi `<spec>`

Generates domain packages from an OpenAPI spec (file path or URL) using Orval. Reads `openapi[]`, `api.baseUrl`, and `plugins` from `simplix.config.ts`. If a spec entry declares a `profile` whose plugin is not loaded, the command warns and exits rather than generating incorrect code.

| Option | Effect |
| --- | --- |
| `-d, --domain <name>` | Generate a single domain (default: all configured domains) |
| `-e, --entities <names>` | Comma-separated entity names (default: all) |
| `-o, --output <dir>` | Output directory (default: `packages/`) |
| `-f, --force` | Regenerate even when no changes are detected |
| `--no-http` | Skip `.http` file generation |
| `-y, --yes` | Auto-confirm without prompts |

Without `-d`, all configured domains are generated; operations not mapped to any configured domain are grouped into a spec-title fallback that has no package and is skipped with a notice (the run still exits 0). Per-domain `-d <name>` avoids the fallback entirely.

### simplix add-domain `<name>`

Adds a domain package **skeleton only** - you then author the contract's `operations` by hand. Reads `api.baseUrl` (for `basePath`) and `openapi` (to detect a matching spec).

| Option | Effect |
| --- | --- |
| `--no-i18n` | Skip i18n translations setup |
| `-y, --yes` | Accept all defaults |

### simplix add-module `<name>`

Adds a new FSD feature module with `features/`, `widgets/`, `shared/{lib,ui,config}`, `manifest.ts`, and (optionally) `locales/`. Reads `i18n.locales` and `packages.prefix`.

| Option | Effect |
| --- | --- |
| `--no-i18n` | Skip i18n locales setup |
| `-y, --yes` | Accept all defaults |

### simplix scaffold `<entity>`

Generates CRUD widgets (list / form / detail) into a module's `widgets/<entity>/` layer. Reads `i18n.locales`.

| Option | Effect |
| --- | --- |
| `--module <dir>` | Target FSD module directory (relative to `modules/`) |
| `--output <dir>` | Explicit output directory (overrides `--module`, relative to cwd) |

With neither option, it auto-detects the module when exactly one exists; otherwise pass `--module`.

### simplix validate

Validates project structure, FSD layer rules (`features/` ↛ `widgets/`, `shared/` ↛ `features/`/`widgets/`, modules require `manifest.ts`), import boundaries, and i18n. `--fix` auto-fixes where possible. Does not read `simplix.config.ts`.

### simplix init-ui / simplix i18n-codegen

- `simplix init-ui` (`-y, --yes`) wires `@simplix-react/ui` with shadcn/ui.
- `simplix i18n-codegen` (`--watch`) generates TypeScript types from i18n JSON files.

## Workflow: new project

```bash
simplix init my-app -y
cd my-app
pnpm install
```

This produces `packages/`, `modules/`, `apps/`, and a `simplix.config.ts` preconfigured with a CLI plugin, `api.baseUrl`, and an HTTP environment.

## Workflow: add a domain from an OpenAPI spec (preferred)

1. Add a spec entry to `simplix.config.ts` `openapi[]` with the spec path, a `profile`, and the `domains` tag mapping (see [Configuration](./configuration.md)).
2. Generate:

   ```bash
   simplix openapi openapi.json -y
   pnpm install
   ```

   This emits `packages/<prefix>-domain-<name>/` containing the contract (`defineApi` with an `operations` map), Zod schemas, derived hooks, and mock handlers.
3. Refine without editing generated files - wrap the generated contract with `customizeApi` to add, replace, or remove operations.

If the spec is Swagger 2.0, convert first: `npx -y swagger2openapi spec.json -o spec-v3.json`.

## Workflow: add a domain by hand (no spec)

```bash
simplix add-domain inventory -y
```

Then author the contract's entities. Each entity is `schema` + an `operations` map (`list` / `get` / `create` / `update` / `delete`, each with `method` + `path`; `create` / `update` with `input`). See [Authoring a contract](../SKILL.md) and [Recipes](./recipes.md).

## Workflow: add a feature module and its CRUD UI

```bash
simplix add-module catalog -y          # creates modules/catalog with FSD layers
simplix scaffold product --module catalog
```

`scaffold` writes CRUD widgets into `modules/catalog/src/widgets/product/`, consuming the derived hooks from the domain package. Keep domain derivation in `packages/` and feature/UI code in `modules/` - `simplix validate` enforces the boundary.

## Workflow: a screen from kit templates

Every screen, new or existing, is made in this order.

1. **Template on the kit.** The UI kit ships `.hbs` templates next to the parts they wire: list frame, detail presentations, record head, empty and loading states, action dialogs. A part and its template change in one commit.
2. **Scaffold.** `simplix scaffold <entity> --module <name>` renders, for each template name, the first template it finds: the project's `.simplix/templates/<name>.hbs`, then the kit's, then the CLI's bundled one. Keep the project folder for what is specific to the project, ideally empty. The kit is found from `templates.from` in `simplix.config.ts`, or from the one root dependency whose `package.json` declares `simplix.templates`. A page that is not CRUD is generated with `simplix add-page <record|dashboard|static|error|app-shell> <name> --module <m>` (or `--app <a>`); `app-shell` has no bundled template, so the kit or the project supplies one. Each widget has a `<widget>.blocks` file that is written once and never rewritten, and the generated widget beside it is rewritten on every run while it is untouched.
3. **Customise to the design reference.** Change the scaffolded screen to match its Storybook frame. Screen-only decisions go in the block files the templates leave (`page.blocks.tsx` and the like); a generated file may be customised too. Every render the CLI writes is kept as that file's merge base in `.simplix/generated/<path>` (committed, so a fresh clone merges the same way), and a later scaffold or `simplix generated --all` merges the template change into the edited file three-way: base (the last render), ours (the edited file), theirs (the new render). A clean merge is written; a conflict is not, and is reported with its hunks until it is resolved by hand or written with conflict markers by `simplix generated --all --write-conflicts`.
4. **Bring the reference into agreement.** Update the Storybook frame so it draws what the screen now draws, and generate a frame from the kit's Storybook template for a screen that has none. A generated story may be customised; it is merged like a screen file. Compare the two by rendered metrics, never by eye.

An existing screen is regenerated, and its old files are read only as the list of behaviours (data, filters, columns, actions, confirmations, permissions, copy) to re-apply in the blocks, then deleted. Where the CLI has no page kind or no overridable template for a screen, add one to the CLI generically before building the screen.

### The generated-state report

`simplix generated` lists every generated file and story with its state against the current templates:

| State | Meaning |
| --- | --- |
| `untouched` | what the generator laid down and would lay down now |
| `stale` | untouched, but the templates render something else; `--all` rewrites it |
| `edited (merges cleanly)` | customised, and `--all` would carry a template change into it |
| `edited (merge is a no-op)` | customised, and already carries everything the templates render |
| `edited (conflict)` | customised where the template also changed; the hunks are printed |
| `edited, no base` | customised, with no stored base and a fingerprint no current render reproduces; kept, and a template change is carried in by hand |
| `unchecked` | stamped without the command that made it, so it cannot be re-rendered |

An edited file with no stored base gets one when its recorded fingerprint is the fingerprint of the current render, since that render is then the one it was laid down as. The report exits non-zero for a stale file; with `--check` it also exits non-zero for an edited file that would take a merge or that conflicts. An edited file with no base, or a story stamped with no origin, is adopted after a reviewed diff: `simplix generated --adopt <path...>` prints the diff between the file and its current render, a person confirms that every difference is a deliberate customisation (a template change the diff shows is brought into the file first), and `--yes` or the prompt then records that render as the base, writing the origin into a story that lacked one when its file name and title identify the command that made it.

### Routes, menu gates and follow-up commands

`routes.<group>` in `simplix.config.ts` makes `simplix scaffold` write the list screen's route and register its menu entry before the `menu.marker` line of `menu.file`. The entry's gate is `{ action, subject }` read from the list endpoint's permission, with the group as a string literal. A project that reads every group from one table sets `menu.gate`:

```ts
menu: {
  file: "apps/admin/src/shell/menu.ts",
  marker: "@simplix-menu admin",
  gate: { subject: "SUBJECTS.{{entityCamel}}", table: { file: "packages/identity/src/subjects.ts", name: "SUBJECTS" } },
},
```

`subject` is a Handlebars template over the route's render context plus `entityCamel` and `group`. When the rendered expression is `<table.name>.<key>` and the scaffold put that gate into the menu, `table.file` gains `<key>: "<group>"` if it has no such key; a key it already has keeps its value. A scaffold that finds an entry already holding its own gate leaves the table alone.

`generated.after` lists commands that bring what is derived from the generated files up to date, such as a design reference's catalogs:

```ts
generated: { after: [{ cwd: "../board", command: "node scripts/entity-catalogs.mjs" }] },
```

They run once, in order, after `simplix scaffold`, `simplix add-page` and `simplix generated --all` have written their files (`cwd` is relative to the project root and must exist). A report-only `simplix generated` does not run them. Each exit code is reported; a step that fails skips the ones after it and fails the command.

## Workflow: verify

```bash
simplix validate          # structure, FSD rules, imports, i18n
pnpm typecheck && pnpm build
```
