[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / getMutator

# Function: getMutator()

> **getMutator**(`strategy?`): [`OrvalMutator`](../type-aliases/OrvalMutator.md)

Defined in: [packages/api/src/index.ts:92](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L92)

Retrieve a previously registered mutator by strategy name.

## Parameters

### strategy?

`string` = `"default"`

Strategy name (defaults to `"default"`).

## Returns

[`OrvalMutator`](../type-aliases/OrvalMutator.md)

The registered [OrvalMutator](../type-aliases/OrvalMutator.md) function.

## Throws

When the requested strategy has not been configured.

## Example

```ts
const fetcher = getMutator();          // default
const admin = getMutator("admin");     // named strategy
```
