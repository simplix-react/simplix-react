[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createAccessTestWrapper

# Function: createAccessTestWrapper()

> **createAccessTestWrapper**(`options?`): `FC`\<\{ `children`: `ReactNode`; \}\>

Defined in: [access-test-wrapper.ts:46](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/testing/src/access-test-wrapper.ts#L46)

Creates a React wrapper component that provides both [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider)
and [AccessProvider](../@simplix-react/access/functions/AccessProvider.md) for testing hooks and components that depend on
access control.

## Parameters

### options?

[`AccessTestWrapperOptions`](../interfaces/AccessTestWrapperOptions.md)

## Returns

`FC`\<\{ `children`: `ReactNode`; \}\>

## Remarks

Pass the returned component as the `wrapper` option to `renderHook` or
`render` from `@testing-library/react`.

## Examples

```tsx
import { renderHook } from "@testing-library/react";
import { createAccessTestWrapper, createMockPolicy } from "@simplix-react/testing";

const wrapper = createAccessTestWrapper();
const { result } = renderHook(() => useCan("view", "Pet"), { wrapper });
```

```tsx
const policy = createMockPolicy({
  rules: [{ action: "view", subject: "Pet" }],
  allowAll: false,
});
const wrapper = createAccessTestWrapper({ policy });
```
