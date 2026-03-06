[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockResponseWrapper

# Interface: MockResponseWrapper

Defined in: [derive-mock-handlers.ts:91](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L91)

Transforms raw mock data into a server-specific response envelope.

## Properties

### error()

> **error**: (`error`) => `Record`\<`string`, `unknown`\>

Defined in: [derive-mock-handlers.ts:95](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L95)

Wraps an error result.

#### Parameters

##### error

\{ `code?`: `string`; `message?`: `string`; \} | `undefined`

#### Returns

`Record`\<`string`, `unknown`\>

***

### success()

> **success**: (`data`) => `Record`\<`string`, `unknown`\>

Defined in: [derive-mock-handlers.ts:93](https://github.com/simplix-react/simplix-react/blob/main/derive-mock-handlers.ts#L93)

Wraps a successful result payload.

#### Parameters

##### data

`unknown`

#### Returns

`Record`\<`string`, `unknown`\>
