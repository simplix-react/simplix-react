[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ActionType

# Type Alias: ActionType

> **ActionType** = `"view"` \| `"edit"` \| `"delete"` \| `"download"` \| `"cancel"` \| `"duplicate"` \| `"locate"` \| `"add-child"` \| `"reorder"` \| `"move"` \| `"unlink"` \| `"select"`

Defined in: [packages/ui/src/crud/shared/row-actions.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/row-actions.tsx#L33)

Row-level action kinds a list or tree row can offer.

<p><b>`download` and `cancel` are here rather than typed as a `view` carrying its own icon.</b>
The type decides the glyph, and the glyph is the whole control in the icon strip — so a row
offering a verb this list does not name gets whatever the author reached for, and a ledger
fetching a file and a ledger destroying one both ended up under a trash can. Both verbs are
generic enough that any console row can want them, and the set says which glyph the reader will
meet.
