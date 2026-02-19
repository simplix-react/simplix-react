[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / QueryFallback

# Function: QueryFallback()

> **QueryFallback**(`__namedParameters`): `ReactNode`

Defined in: [packages/ui/src/crud/shared/query-fallback.tsx:23](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/query-fallback.tsx#L23)

Fallback component for query loading and not-found states.

Use as an early-return guard in pages that fetch a single entity:

```tsx
const { data, isLoading } = useGet(id);
if (isLoading || !data) return <QueryFallback isLoading={isLoading} notFoundMessage="Pet not found." />;
```

## Parameters

### \_\_namedParameters

[`QueryFallbackProps`](../interfaces/QueryFallbackProps.md)

## Returns

`ReactNode`
