[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseFadeTransitionOptions

# Interface: UseFadeTransitionOptions

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:5](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/use-fade-transition.ts#L5)

Options for [useFadeTransition](../functions/useFadeTransition.md).

## Properties

### active

> **active**: `boolean`

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:7](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/use-fade-transition.ts#L7)

Whether the detail panel is currently showing (e.g. `view === "detail"`).

***

### duration?

> `optional` **duration**: `number`

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:11](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/use-fade-transition.ts#L11)

Fade duration in milliseconds.

#### Default Value

```ts
200
```

***

### targetId

> **targetId**: `string` \| `null`

Defined in: [packages/ui/src/crud/patterns/use-fade-transition.ts:9](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/crud/patterns/use-fade-transition.ts#L9)

The id of the item to display.
