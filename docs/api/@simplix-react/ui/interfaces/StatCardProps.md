[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / StatCardProps

# Interface: StatCardProps

Defined in: [packages/ui/src/base/charts/stat-card.tsx:6](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L6)

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L26)

Optional content rendered below the value/description block.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L24)

Extra classes merged onto the card root.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L12)

Optional supporting text below the value.

***

### headerExtra?

> `optional` **headerExtra**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L16)

Extra content rendered next to the title (e.g. a badge).

***

### highlighted?

> `optional` **highlighted**: `boolean`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L22)

When true (and `tone` is set), tints the card surface with the tone instead of the default card background.

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L14)

Optional icon rendered in the header's trailing slot.

***

### title

> **title**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L8)

Card title shown above the value.

***

### tone?

> `optional` **tone**: [`StatusTone`](../type-aliases/StatusTone.md)

Defined in: [packages/ui/src/base/charts/stat-card.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L20)

Status tone for the soft surface tint; only applied when `highlighted` is true.

***

### trend?

> `optional` **trend**: `object`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L18)

Optional trend indicator; non-negative values render in the success tone, negative in danger.

#### label?

> `optional` **label**: `string`

#### value

> **value**: `number`

***

### value

> **value**: `string` \| `number`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L10)

Primary metric value.
