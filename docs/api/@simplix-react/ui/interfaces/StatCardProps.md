[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / StatCardProps

# Interface: StatCardProps

Defined in: [packages/ui/src/base/charts/stat-card.tsx:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L5)

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L25)

Optional content rendered below the value/description block.

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L23)

Extra classes merged onto the card root.

***

### description?

> `optional` **description**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L11)

Optional supporting text below the value.

***

### headerExtra?

> `optional` **headerExtra**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L15)

Extra content rendered next to the title (e.g. a badge).

***

### highlighted?

> `optional` **highlighted**: `boolean`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L21)

When true (and `tone` is set), tints the card surface with the tone instead of the default card background.

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L13)

Optional icon rendered in the header's trailing slot.

***

### title

> **title**: `string`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L7)

Card title shown above the value.

***

### tone?

> `optional` **tone**: [`StatusTone`](../type-aliases/StatusTone.md)

Defined in: [packages/ui/src/base/charts/stat-card.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L19)

Status tone for the soft surface tint; only applied when `highlighted` is true.

***

### trend?

> `optional` **trend**: `object`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L17)

Optional trend indicator; non-negative values render in the success tone, negative in danger.

#### label?

> `optional` **label**: `string`

#### value

> **value**: `number`

***

### value

> **value**: `string` \| `number`

Defined in: [packages/ui/src/base/charts/stat-card.tsx:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/charts/stat-card.tsx#L9)

Primary metric value.
