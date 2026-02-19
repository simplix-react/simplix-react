[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseFadeTransitionOptions

# Interface: UseFadeTransitionOptions

Defined in: packages/ui/src/crud/patterns/use-fade-transition.ts:5

Options for [useFadeTransition](../functions/useFadeTransition.md).

## Properties

### active

> **active**: `boolean`

Defined in: packages/ui/src/crud/patterns/use-fade-transition.ts:7

Whether the detail panel is currently showing (e.g. `view === "detail"`).

***

### duration?

> `optional` **duration**: `number`

Defined in: packages/ui/src/crud/patterns/use-fade-transition.ts:11

Fade duration in milliseconds.

#### Default Value

```ts
200
```

***

### targetId

> **targetId**: `string` \| `null`

Defined in: packages/ui/src/crud/patterns/use-fade-transition.ts:9

The id of the item to display.
