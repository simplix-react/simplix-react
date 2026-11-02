[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixConfig

# Interface: SimplixConfig

Defined in: [config/types.ts:64](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L64)

Project-level configuration loaded from `simplix.config.ts` at the project root.

## Remarks

Controls code generation behavior, mock layer defaults, package naming,
and OpenAPI domain splitting. All fields are optional — sensible defaults
are applied when omitted.

## Example

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
  api: { baseUrl: "/api/v1" },
  packages: { prefix: "acme" },
  codegen: { header: true },
  openapi: [
    {
      spec: "openapi.json",
      profile: "simplix-boot",
      domains: {
        project: ["Projects", "Tasks"],
        auth: ["Auth", "Users"],
      },
    },
  ],
});
```

## See

[defineConfig](../functions/defineConfig.md) — identity wrapper for type-safe autocompletion

## Properties

### api?

> `optional` **api**: `object`

Defined in: [config/types.ts:81](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L81)

API settings — used for basePath in code generation

#### baseUrl?

> `optional` **baseUrl**: `string`

API base path (default: "/api")

***

### apps?

> `optional` **apps**: `Readonly`\<`Record`\<`string`, [`SimplixAppConfig`](SimplixAppConfig.md)\>\>

Defined in: [config/types.ts:133](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L133)

Settings that differ between the apps of one workspace, keyed by the app's directory name under
`apps/` (`"acme-admin"`).

#### Remarks

Two apps in one frontend workspace can be drawn by different UI kits and designed in different
references: an operator console from a console kit on a mockup board, a customer site from a
site kit on a Storybook of its own. A page generated for an app reads that app's settings:
`simplix add-page --app <name>` names the app outright, and `--module <group>/<name>` (as
`simplix scaffold --module` does) reaches the app whose `moduleGroups` holds the group. A page
no app claims, and every page of a project without this block, reads the top-level
`templates` alone.

#### Example

```ts
apps: {
  "acme-admin": {
    design: { source: "screen-design", manifest: "design/screen-design.json" },
  },
  "acme-site": {
    moduleGroups: ["site"],
    templates: { from: "@acme-kits/site-clarity" },
    design: { source: "story-manifest", manifest: "design/site-design-manifest.json" },
  },
}
```

***

### checks?

> `optional` **checks**: [`SimplixChecksConfig`](SimplixChecksConfig.md)

Defined in: [config/types.ts:251](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L251)

What the project checks run over; each command also takes its roots as arguments.

***

### codegen?

> `optional` **codegen**: `object`

Defined in: [config/types.ts:234](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L234)

Code generation options

#### header?

> `optional` **header**: `boolean`

Prepend auto-generated header comment to generated files (default: true)

***

### generated?

> `optional` **generated**: `object`

Defined in: [config/types.ts:228](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L228)

How generated files are written.

#### after?

> `optional` **after**: readonly `GeneratedAfterStep`[]

#### format()?

> `optional` **format**: (`source`, `filePath`) => `string` \| `Promise`\<`string`\>

##### Parameters

###### source

`string`

###### filePath

`string`

##### Returns

`string` \| `Promise`\<`string`\>

#### Remarks

`format` runs the project's own formatter over every render before it is written, recorded as
the merge base under `.simplix/generated`, or compared with the file on disk. A project that
formats generated files before committing them sets it, so an untouched file stays untouched
after formatting and a three-way merge reads the edits against the text they were made on.
It receives the render and the path the file goes to, and returns the formatted text. Without
it a render is used exactly as the template produced it.

`after` lists commands that bring something derived from the generated files up to date (a
design reference's catalogs, an index). They run once, in order, after `simplix scaffold`,
`simplix add-page` and `simplix generated --all` have written their files, never from a
report-only `simplix generated`. A step that exits non-zero ends the run: the remaining steps
are skipped, the exit code is reported and the command fails. Without it nothing runs.

***

### http?

> `optional` **http**: `object`

Defined in: [config/types.ts:96](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L96)

.http file environment settings

#### environments?

> `optional` **environments**: `Record`\<`string`, [`SimplixHttpEnvironment`](SimplixHttpEnvironment.md)\>

***

### i18n?

> `optional` **i18n**: `object`

Defined in: [config/types.ts:240](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L240)

Internationalization settings

#### defaultLocale?

> `optional` **defaultLocale**: `string`

Default locale code (default: "en")

#### locales?

> `optional` **locales**: `string`[]

Supported locale codes (default: ["en", "ko", "ja"])

***

### modules?

> `optional` **modules**: `object`

Defined in: [config/types.ts:141](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L141)

How UI modules are laid out under `modules/`. `groups` names directories that hold modules
rather than being one (`["admin", "portal", "shared"]`), so `--module admin/user` addresses
`modules/admin/user` and every other value names a module directly under `modules/`.
`dependencies` is what `add-module` puts in each new module's `package.json`.

#### dependencies?

> `optional` **dependencies**: `Readonly`\<`Record`\<`string`, `string`\>\>

Packages every module `add-module` writes declares as a dependency, by name → version range
(`{ "@acme/identity-ui": "workspace:*" }`). A package all the project's screens import, such
as the one holding its signed-in subject, belongs here so each new module resolves it
without a hand edit. Absent or empty, a module declares none of its own.

#### groups?

> `optional` **groups**: `string`[]

***

### openapi?

> `optional` **openapi**: [`OpenAPISpecConfig`](OpenAPISpecConfig.md)[]

Defined in: [config/types.ts:248](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L248)

OpenAPI code generation — array of per-spec configurations

***

### packages?

> `optional` **packages**: `object`

Defined in: [config/types.ts:90](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L90)

Package naming options

#### prefix?

> `optional` **prefix**: `string`

Short prefix for generated package names (default: derived from root package.json name)

***

### plugins?

> `optional` **plugins**: `string`[]

Defined in: [config/types.ts:78](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L78)

CLI extension plugin modules to load before running any command.

#### Remarks

Each entry is a package specifier (e.g. `"@simplix-react-ext/simplix-boot-cli-plugin"`).
Plugins register spec profiles and response adapters needed for correct
code generation. The core CLI is backend-agnostic and does not know about
any specific extension — the target backend is declared here.

If a [profile](OpenAPISpecConfig.md#profile) is referenced but its
plugin is not listed (or cannot be resolved), the `openapi` command warns
and exits rather than silently generating incorrect code.

***

### queryBuilder?

> `optional` **queryBuilder**: `unknown`

Defined in: [config/types.ts:87](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L87)

Global QueryBuilder — applied to all domains

***

### references?

> `optional` **references**: `object`

Defined in: [config/types.ts:207](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L207)

#### peeks?

> `optional` **peeks**: `Readonly`\<`Record`\<`string`, `string`\>\>

***

### routes?

> `optional` **routes**: `Readonly`\<`Record`\<`string`, `RouteTarget`\>\>

Defined in: [config/types.ts:167](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L167)

The route file a list screen is reached through, by module group (`admin` for
`--module admin/<name>`). Absent, no route is written.

#### Remarks

`dir` is the app's file-route directory, relative to the project root. `template` names the
route template (default `route`; the console-clarity kit ships `route.tanstack` for TanStack
file routes). The path is the entity's plural in kebab case unless `paths` names another
(`{ "job-position": "positions" }`). `menu` inserts the screen's menu entry, rendered from the
`menu-entry` template beside the route template, on the line before `marker` in `file` when no
entry for the path exists yet; `catalogs` names, per locale, the JSON catalog the entry's
label goes into under `keyPath`, written from the entity's plural name in SimpliX Meta.
`menu.gate` names how the entry's gate refers to the permission group, for a project that
keeps its groups in one table instead of writing them inline.

***

### scaffold?

> `optional` **scaffold**: `object`

Defined in: [config/types.ts:201](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L201)

What a scaffold decides where SimpliX Meta is silent.

#### defaultSortFields?

> `readonly` `optional` **defaultSortFields**: readonly (`string` \| \{ `direction?`: `"asc"` \| `"desc"`; `field`: `string`; \})[]

#### maskedSuffix?

> `readonly` `optional` **maskedSuffix**: `string`

#### referencePickers?

> `readonly` `optional` **referencePickers**: `Readonly`\<`Record`\<`string`, \{ `facet?`: `string`; `from`: `string`; `hook`: `string`; \}\>\>

#### Remarks

`defaultSortFields` names the fields a generated list may open sorted by, in order of
preference, each newest first unless it gives a direction
(`["occurredAt", "createdAt", { field: "sortOrder", direction: "asc" }]`). An entity whose
Meta declares `defaultSort` uses that instead; a list whose row carries none of them, or
carries one the backend cannot order by, opens in the server's order. The row's key is
never used. Defaults to none.

`maskedSuffix` names the suffix of a masked form of a field (`"Masked"`): a record carrying
both `recipientEmail` and `recipientEmailMasked` is drawn with the masked one only, since
SimpliX Meta marks no personal data and the pairing is the only statement of which form a
screen may show. Defaults to none.

`referencePickers` maps a peek kind (the referenced entity's name in camel case) to the hook
that searches that entity for a form's picker, and the module it is imported from. A form field
that references an entity listed here is edited through that picker; a required reference to
an entity not listed is reported by `simplix check-screen`, since its id would be typed by hand.
`facet` names the hook (from the same module, made by `createEntityFacet`) that searches the
entity for a list filter: a list over a key of that entity is filtered by the record's name.

***

### templates?

> `optional` **templates**: [`SimplixTemplatesConfig`](SimplixTemplatesConfig.md)

Defined in: [config/types.ts:104](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L104)

Where the page and widget templates come from, beneath the project's own
`.simplix/templates`. An app listed in [SimplixConfig.apps](#apps) may override each key.
