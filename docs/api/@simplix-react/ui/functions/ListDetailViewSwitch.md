[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetailViewSwitch

# Function: ListDetailViewSwitch()

> **ListDetailViewSwitch**(`__namedParameters`): `Element` \| `null`

Defined in: [packages/ui/src/crud/patterns/list-detail-view-switch.tsx:33](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail-view-switch.tsx#L33)

Declarative view-switch for list-detail layouts.
Replaces the repeated conditional rendering block (~20 lines) in every
list-detail page template.

## Parameters

### \_\_namedParameters

[`ListDetailViewSwitchProps`](../interfaces/ListDetailViewSwitchProps.md)

## Returns

`Element` \| `null`

## Example

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
