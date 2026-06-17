[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudListColumnContextValue

# Interface: CrudListColumnContextValue

Defined in: [packages/ui/src/crud/shared/column-context.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L10)

## Properties

### canGridView

> **canGridView**: `boolean`

Defined in: [packages/ui/src/crud/shared/column-context.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L22)

True when the table declares grid as a selectable view (Table `gridView` + card slots).

***

### columns

> **columns**: [`ColumnInfo`](ColumnInfo.md)[]

Defined in: [packages/ui/src/crud/shared/column-context.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L11)

***

### hiddenColumns

> **hiddenColumns**: `Set`\<`string`\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L13)

***

### isCardMode

> **isCardMode**: `boolean`

Defined in: [packages/ui/src/crud/shared/column-context.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L16)

Effective card-mode mirror (responsive OR manual grid) — used to hide the column toggle.

***

### responsiveCardMode

> **responsiveCardMode**: `boolean`

Defined in: [packages/ui/src/crud/shared/column-context.tsx:25](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L25)

True when width < cardBreakpoint forces cards — used to hide the view toggle.

***

### setCanGridView

> **setCanGridView**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L23)

***

### setColumns

> **setColumns**: `Dispatch`\<`SetStateAction`\<[`ColumnInfo`](ColumnInfo.md)[]\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L12)

***

### setHiddenColumns

> **setHiddenColumns**: `Dispatch`\<`SetStateAction`\<`Set`\<`string`\>\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L14)

***

### setIsCardMode

> **setIsCardMode**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L17)

***

### setResponsiveCardMode

> **setResponsiveCardMode**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L26)

***

### setViewMode

> **setViewMode**: `Dispatch`\<`SetStateAction`\<[`CrudListViewMode`](../type-aliases/CrudListViewMode.md)\>\>

Defined in: [packages/ui/src/crud/shared/column-context.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L20)

***

### viewMode

> **viewMode**: [`CrudListViewMode`](../type-aliases/CrudListViewMode.md)

Defined in: [packages/ui/src/crud/shared/column-context.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/column-context.tsx#L19)

User-selected view. Drives manual grid rendering when the table opts into `gridView`.
