[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetail

# Variable: ListDetail

> `const` **ListDetail**: *typeof* [`ListDetailRoot`](../functions/ListDetailRoot.md) & `object`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:511](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L511)

List-detail layout in three shapes:
- `"panel"`: side-by-side, with a draggable divider. The framework's default.
- `"drawer"`: the list keeps its full width and the detail slides in from the right edge.
- `"dialog"`: the list keeps its full width and the detail opens as a centred modal.

**`variant` is normally not passed.** Panel and drawer are the same screen said two ways — the
same detail, the same content, opened by the same act and closed back to the same list — and
which one an installation gets is set once through `UIProvider`'s `detailPresentation`. A screen
that hardcodes `variant="panel"` takes that choice away from every installation, usually without
meaning to, because the scaffold wrote it there. Pass one only where the shape is genuinely this
screen's own, and `"dialog"` is the case that usually is.

**A wireframe board draws this as a list with a panel beside it whichever shape is in force.**
The board's claim is that the detail opens next to the list, not that it is a panel; a screen
rendering a drawer against a board drawn as list-detail is not a divergence.

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
