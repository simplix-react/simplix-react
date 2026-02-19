[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / AccessTestWrapperOptions

# Interface: AccessTestWrapperOptions

Defined in: [access-test-wrapper.ts:12](https://github.com/simplix-react/simplix-react/blob/main/access-test-wrapper.ts#L12)

Options for [createAccessTestWrapper](../functions/createAccessTestWrapper.md).

## Properties

### policy?

> `optional` **policy**: [`AccessPolicy`](../@simplix-react/access/interfaces/AccessPolicy.md)\<`DefaultActions`, `string`\>

Defined in: [access-test-wrapper.ts:16](https://github.com/simplix-react/simplix-react/blob/main/access-test-wrapper.ts#L16)

Custom [AccessPolicy](../@simplix-react/access/interfaces/AccessPolicy.md). Falls back to [createMockPolicy](../functions/createMockPolicy.md) (full access).

***

### queryClient?

> `optional` **queryClient**: [`QueryClient`](https://tanstack.com/query/latest/docs/reference/QueryClient)

Defined in: [access-test-wrapper.ts:14](https://github.com/simplix-react/simplix-react/blob/main/access-test-wrapper.ts#L14)

Custom [QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient). Falls back to [createTestQueryClient](../functions/createTestQueryClient.md).
