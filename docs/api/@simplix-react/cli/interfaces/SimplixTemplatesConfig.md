[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixTemplatesConfig

# Interface: SimplixTemplatesConfig

Defined in: [config/types.ts:266](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L266)

Where page and widget templates come from, and where the generated design-reference stories go.

## Remarks

`from` names a UI kit package (resolved from the project root, then from the workspace's
packages) or a directory path. The kit's `package.json` says where its templates are under
`simplix.templates`; a path is read as the template directory itself. Without this setting the
CLI looks for one dependency of the project root that declares `simplix.templates`.

Under an app of [SimplixConfig.apps](SimplixConfig.md#apps), each key set here replaces the top-level key of the
same name for that app's pages, and each key left out falls back to it.

## Properties

### from?

> `optional` **from**: `string`

Defined in: [config/types.ts:267](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L267)

***

### storiesDir?

> `optional` **storiesDir**: `string` \| `null`

Defined in: [config/types.ts:277](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L277)

Where generated Storybook stories are written, relative to the project root: the design
reference's screens directory. A template with a `.stories` sibling (`list.stories.hbs`)
renders one story per scaffolded entity there. Without it no story is generated.
The directory must exist: `simplix generated` and the commands that write there refuse a
path that does not resolve to one, naming the option and the resolved path.
An app sets `null` to write no stories where the top level names a directory: its design
reference is not the one the top-level stories go to.

***

### story?

> `optional` **story**: `object`

Defined in: [config/types.ts:284](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L284)

The board story's id and title, as patterns over `{entity}` (kebab case) and `{Entity}`
(Pascal case), so the design reference's own navigation can link to a generated frame
(`{ id: "backoffice-{entity}", title: "Back office/{Entity}" }`). Absent, the story keeps
Storybook's title-derived id under `Generated/{Entity}`.

#### files?

> `readonly` `optional` **files**: `Readonly`\<`Record`\<`string`, `string`\>\>

The file a scaffold writes its story to, relative to `storiesDir`, by scaffold key: an
entity's kebab name for `scaffold` (`{ "background-job": "jobs.stories.tsx" }`), a page
story's default file name without `.stories.tsx` for `add-page`. A board that already
draws the screen maps it here, so the generated story is that frame rather than a second
one beside it; `simplix generated --adopt` then records the frame's merge base.

#### id?

> `readonly` `optional` **id**: `string`

#### title?

> `readonly` `optional` **title**: `string`
