[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / RowActionCell

# Function: RowActionCell()

> **RowActionCell**\<`T`\>(`__namedParameters`): `Element` \| `null`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:136](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L136)

Per-row action cluster shared by the list and tree tables.

## Type Parameters

### T

`T`

## Parameters

### \_\_namedParameters

#### actions

[`RowActionDef`](../interfaces/RowActionDef.md)\<`T`\>[]

#### row

`T`

#### size?

`"xs"` \| `"sm"` = `"xs"`

Button size for the outline/ghost variant. Lists render `xs`, trees `sm`.

#### variant

[`ActionVariant`](../type-aliases/ActionVariant.md)

## Returns

`Element` \| `null`
