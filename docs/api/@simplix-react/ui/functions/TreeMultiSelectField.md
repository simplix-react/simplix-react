[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / TreeMultiSelectField

# Function: TreeMultiSelectField()

> **TreeMultiSelectField**\<`T`\>(`__namedParameters`): `Element`

Defined in: [packages/ui/src/fields/form/tree-multi-select-field.tsx:181](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/form/tree-multi-select-field.tsx#L181)

Multi-select variant of [TreeSelectField](TreeSelectField.md): picks any number of nodes
from a hierarchical dataset. Selected nodes render as removable badge chips
in the trigger; the popover keeps the tree open across toggles and supports
search with ancestor-preserving filtering.

## Type Parameters

### T

`T`

## Parameters

### \_\_namedParameters

[`TreeMultiSelectFieldProps`](../interfaces/TreeMultiSelectFieldProps.md)\<`T`\>

## Returns

`Element`

## Example

```tsx
<TreeMultiSelectField<OrgNode>
  label="Organizations"
  value={orgIds}
  onChange={setOrgIds}
  treeData={orgTree}
  config={{ idField: "orgId", childrenField: "children" }}
  getDisplayName={(org) => org.orgName}
/>
```
