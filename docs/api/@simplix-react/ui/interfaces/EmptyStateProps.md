[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / EmptyStateProps

# Interface: EmptyStateProps

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:4](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L4)

## Properties

### action?

> `optional` **action**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L8)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L29)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L7)

***

### footer?

> `optional` **footer**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L28)

A quiet line under the actions — a status number, a correlation id, whatever support reads and
the operator does not act on.

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L5)

***

### iconClassName?

> `optional` **iconClassName**: `string`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L23)

The tint the icon's badge is painted with, where the KIND of state has a colour.

<p>A caller wanting one used to wrap the icon in a badge of its own, which landed inside the
badge this already draws — two nested circles, the inner one an inline element that a
`rounded-full` stretches into an oval. The tint belongs to the badge that exists rather than
to a second one.

***

### size?

> `optional` **size**: `"default"` \| `"sm"`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L14)

Vertical weight. `"default"` fills an empty page or table body; `"sm"` is for
a panel section, where a full-height placeholder pushes the real content
off-screen for a state that carries no information.

***

### title

> **title**: `string`

Defined in: [packages/ui/src/crud/shared/empty-state.tsx:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/empty-state.tsx#L6)
