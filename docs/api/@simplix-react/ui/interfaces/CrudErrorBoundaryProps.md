[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudErrorBoundaryProps

# Interface: CrudErrorBoundaryProps

Defined in: packages/ui/src/crud/shared/error-boundary.tsx:7

Props for the [CrudErrorBoundary](../classes/CrudErrorBoundary.md) component.

## Properties

### children

> **children**: `ReactNode`

Defined in: packages/ui/src/crud/shared/error-boundary.tsx:8

***

### fallback?

> `optional` **fallback**: `ReactNode` \| (`error`, `reset`) => `ReactNode`

Defined in: packages/ui/src/crud/shared/error-boundary.tsx:9

***

### onError()?

> `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: packages/ui/src/crud/shared/error-boundary.tsx:10

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`
