[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetail

# Variable: ListDetail

> `const` **ListDetail**: *typeof* [`ListDetailRoot`](../functions/ListDetailRoot.md) & `object`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:376](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L376)

List-detail layout with two variants:
- `"panel"` (default): Side-by-side layout with draggable divider.
- `"dialog"`: List takes full width, detail opens in a modal dialog.

Sub-components: List, Detail, ViewSwitch, useListDetail.

## Type Declaration

### Detail

> **Detail**: `ForwardRefExoticComponent`\<[`ListDetailPanelProps`](../interfaces/ListDetailPanelProps.md) & `RefAttributes`\<`HTMLElement`\>\> = `DetailPanel`

### List

> **List**: `ForwardRefExoticComponent`\<[`ListDetailPanelProps`](../interfaces/ListDetailPanelProps.md) & `RefAttributes`\<`HTMLElement`\>\> = `ListPanel`

### useListDetail()

> **useListDetail**: () => [`ListDetailContextValue`](../interfaces/ListDetailContextValue.md)

#### Returns

[`ListDetailContextValue`](../interfaces/ListDetailContextValue.md)

### ViewSwitch()

> **ViewSwitch**: (`__namedParameters`) => `Element` \| `null` = `ListDetailViewSwitch`

Declarative view-switch for list-detail layouts.
Replaces the repeated conditional rendering block (~20 lines) in every
list-detail page template.

#### Parameters

##### \_\_namedParameters

[`ListDetailViewSwitchProps`](../interfaces/ListDetailViewSwitchProps.md)

#### Returns

`Element` \| `null`

#### Example

```tsx
<ListDetail.Detail>
  <ListDetail.ViewSwitch
    state={state}
    fade={fade}
    renderDetail={(id) => <PetDetail petId={id} ... />}
    renderNew={() => <PetForm ... />}
    renderEdit={(id) => <PetForm petId={id} ... />}
  />
</ListDetail.Detail>
```
