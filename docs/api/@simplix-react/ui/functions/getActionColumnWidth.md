[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / getActionColumnWidth

# Function: getActionColumnWidth()

> **getActionColumnWidth**(`actions`, `variant`): `number`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:129](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L129)

Column width the action cluster needs for the given variant.

<p><b>The labelled variants scale with the action count, same as the icon one.</b> A flat width
held for every count is right only at one count: two labelled buttons measure 157px of content
before the cell's own padding, so a column fixed at the one-button width puts the second button
past the cell and the reader finds it by scrolling a table that gives no sign of scrolling. The
numbers are measured off a `size="xs"` button carrying an icon and a two-to-four syllable label,
which is what a console row draws.

<p><b>The one-button case keeps the old width as a floor</b>, because a single long label is
wider than the average this is built from and there is nothing beside it to reveal the clip.

<p><b>Both variants pay for the cell's own horizontal padding</b>, which is the `+ 24` on each
line — a table cell is `px-3`, so a width covering only the buttons hands the cluster a content
box 24px narrower than what it asked for. The icon strip is the case where that goes silent: it
is one `overflow-hidden` box, so the last glyph is simply cut in half with no scrollbar, no
ellipsis and nothing in the DOM saying the row is wider than its column. A two-icon cluster
measures 59px of content (two `size-7` buttons, the divider between them, and the strip's own
border) against the 40px a padding-blind 64 leaves it, and the trash can beside every 보기 was
drawn with its right edge missing on every row of the list.

## Parameters

### actions

[`RowActionDef`](../interfaces/RowActionDef.md)\<`unknown`\>[]

every action declared for the row, including the ones a given row hides

### variant

[`ActionVariant`](../type-aliases/ActionVariant.md)

how the cluster renders — bare glyphs, or buttons carrying their labels

## Returns

`number`

the column width in px
