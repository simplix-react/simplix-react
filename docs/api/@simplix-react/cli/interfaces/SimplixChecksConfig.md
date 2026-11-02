[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixChecksConfig

# Interface: SimplixChecksConfig

Defined in: [config/types.ts:343](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L343)

Inputs of `simplix cycles` and `simplix meta-removals`, relative to the project root.

## Properties

### cycles?

> `optional` **cycles**: `object`

Defined in: [config/types.ts:344](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L344)

#### roots?

> `optional` **roots**: `string`[]

Directories whose source files are the nodes of the import graph.

***

### metaRemovals?

> `optional` **metaRemovals**: `object`

Defined in: [config/types.ts:348](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L348)

#### acknowledged?

> `optional` **acknowledged**: `string`

A JSON file `{ "acknowledged": ["field Owner.name", ...] }` listing removals that are
intended. Absent, nothing is acknowledged.

#### roots?

> `optional` **roots**: `string`[]

Directories whose source files are searched for names the snapshot lost.

#### snapshot?

> `optional` **snapshot**: `string`

The SimpliX Meta snapshot to compare. Absent, the one `openapi[].meta.snapshot` the config
declares is used.
