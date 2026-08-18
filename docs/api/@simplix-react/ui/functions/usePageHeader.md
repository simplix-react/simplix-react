[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / usePageHeader

# Function: usePageHeader()

> **usePageHeader**(`header`): `void`

Defined in: [packages/ui/src/layout/page-header.tsx:98](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/layout/page-header.tsx#L98)

Registers what the page header shows, for as long as the caller is mounted.

<p>Published on every render of the caller, so whatever is put in `actions`, `metadata`, or
`center` is the current one rather than the one that existed when the title was last set. A
render that changes nothing publishes nothing — the values are compared slot by slot first,
so a caller passing stable nodes costs the header no work at all.

## Parameters

### header

what to show, or null to leave whatever another component registered

[`PageHeaderState`](../interfaces/PageHeaderState.md) | `null`

## Returns

`void`
