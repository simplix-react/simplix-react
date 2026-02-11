[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createTestWrapper

# Function: createTestWrapper()

> **createTestWrapper**(`options?`): `FC`\<\{ `children`: `ReactNode`; \}\>

Defined in: [test-wrapper.ts:39](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/testing/src/test-wrapper.ts#L39)

Creates a React wrapper component that provides all necessary context providers
for rendering hooks and components under test.

## Parameters

### options?

Optional configuration object.

#### queryClient?

[`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient)

A custom [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) to use instead of the
  default test client.

## Returns

`FC`\<\{ `children`: `ReactNode`; \}\>

A React functional component that wraps its children with all required providers.

## Remarks

The wrapper includes a [QueryClientProvider](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider) with either a caller-supplied
[QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient) or one created via [createTestQueryClient](createTestQueryClient.md).
Pass the returned component as the `wrapper` option to
`renderHook` or `render` from `@testing-library/react`.

## Examples

```tsx
import { renderHook } from "@testing-library/react";
import { createTestWrapper } from "@simplix-react/testing";

const wrapper = createTestWrapper();

const { result } = renderHook(() => useMyQuery(), { wrapper });
```

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createTestWrapper } from "@simplix-react/testing";

const queryClient = new QueryClient();
const wrapper = createTestWrapper({ queryClient });
```
