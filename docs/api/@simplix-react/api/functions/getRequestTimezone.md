[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / getRequestTimezone

# Function: getRequestTimezone()

> **getRequestTimezone**(): `string`

Defined in: [packages/api/src/index.ts:87](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L87)

Returns the client's IANA timezone identifier (e.g. `"Asia/Seoul"`).

## Returns

`string`

## Remarks

Auto-detected from the browser/OS via `Intl.DateTimeFormat`.
`X-Timezone` header is injected at the `createFetch()` layer
so all HTTP requests include it automatically.
