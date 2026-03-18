[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / AssignmentPanel

# Variable: AssignmentPanel

> `const` **AssignmentPanel**: (`__namedParameters`) => `Element` & `object`

Defined in: [packages/ui/src/crud/assignment/assignment-panel.tsx:189](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/assignment/assignment-panel.tsx#L189)

Assignment panel for 1:N relationship management UIs.
Provides a consistent frame (Card + header + body) where modules inject data and rendering.

## Type Declaration

### Chip()

> **Chip**: (`__namedParameters`) => `Element` = `AssignmentChip`

#### Parameters

##### \_\_namedParameters

[`AssignmentChipProps`](../interfaces/AssignmentChipProps.md)

#### Returns

`Element`

### Chips()

> **Chips**: \<`T`\>(`__namedParameters`) => `Element` = `AssignmentChips`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_\_namedParameters

`AssignmentChipsProps`\<`T`\>

#### Returns

`Element`

### Column()

> **Column**: \<`T`\>(`_props`) => `ReactNode` = `CrudList.Column`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_props

[`ListColumnProps`](../interfaces/ListColumnProps.md)\<`T`\>

#### Returns

`ReactNode`

### Table()

> **Table**: \<`T`\>(`__namedParameters`) => `Element` = `AssignmentTable`

#### Type Parameters

##### T

`T`

#### Parameters

##### \_\_namedParameters

`AssignmentTableProps`\<`T`\>

#### Returns

`Element`

## Example

```tsx
// Table mode
<AssignmentPanel title="Access Levels" count={levels.length}
  action={<SearchPopover triggerText="Assign" ... />}
>
  <AssignmentPanel.Table data={levels} rowId={(r) => r.id} actions={[{ type: "unlink", onClick: handleUnlink }]}>
    <AssignmentPanel.Column field="name" header="Name">
      {({ row }) => <Text>{row.name}</Text>}
    </AssignmentPanel.Column>
  </AssignmentPanel.Table>
</AssignmentPanel>

// Chips mode
<AssignmentPanel title="Groups" count={groups.length}
  action={<SearchPopover triggerText="Add" ... />}
>
  <AssignmentPanel.Chips data={groups} renderItem={(g) => (
    <AssignmentPanel.Chip key={g.id} label={g.name} onRemove={() => handleRemove(g)} />
  )} />
</AssignmentPanel>
```
