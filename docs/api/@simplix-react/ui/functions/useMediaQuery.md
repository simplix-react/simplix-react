[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useMediaQuery

# Function: useMediaQuery()

> **useMediaQuery**(`query`): `boolean`

Defined in: [packages/ui/src/crud/list/use-media-query.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/list/use-media-query.ts#L14)

Responsive breakpoint detection hook using the `matchMedia` API.

## Parameters

### query

`string`

CSS media query string (e.g. `"(min-width: 768px)"`).

## Returns

`boolean`

`true` when the query matches, `false` otherwise.

## Example

```ts
const isDesktop = useMediaQuery("(min-width: 1024px)");
```
