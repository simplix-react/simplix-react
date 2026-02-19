[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudErrorBoundaryProps

# Interface: CrudErrorBoundaryProps

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:7](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/error-boundary.tsx#L7)

Props for the [CrudErrorBoundary](../classes/CrudErrorBoundary.md) component.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:8](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/error-boundary.tsx#L8)

***

### fallback?

> `optional` **fallback**: `ReactNode` \| (`error`, `reset`) => `ReactNode`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:9](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/error-boundary.tsx#L9)

***

### onError()?

> `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:10](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/shared/error-boundary.tsx#L10)

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`
