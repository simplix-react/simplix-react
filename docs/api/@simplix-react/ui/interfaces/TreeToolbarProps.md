[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeToolbarProps

# Interface: TreeToolbarProps

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:144](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L144)

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:169](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L169)

***

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:145](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L145)

***

### count?

> `optional` **count**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:159](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L159)

The figure the row is about, drawn in the badge a list's `FilterBar` draws.

<p>A number is phrased by the framework as its `Total N`. **Anything else is
rendered as the badge's words**, which is how a tree says what one number
cannot — 「조직 39개 · 사용자 212명」, where the tree counts nodes and the
column beside it counts the people under them. Omitted, the row draws no
badge and the first child is the lead as before.

<p>It exists so a tree does not have to draw its own: a hand-rolled
`<Badge variant="outline">` next to a list's icon-and-label badge is the same
row wearing two shapes, and nothing about the screen says why.

***

### leading?

> `optional` **leading**: `ReactNode`

Defined in: [packages/ui/src/crud/tree/crud-tree.tsx:168](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/tree/crud-tree.tsx#L168)

What narrows the rows, drawn immediately after the count it changes.

<p>Separate from `children`, which is the control group at the far end — the search box, the
expand toggles. A chip filter belongs beside the figure rather than beside those: it is the
other half of what the number is counting, and the row breaks between the two groups, so a
chip left among the controls goes below the count the moment the tree is narrowed.
