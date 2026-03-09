[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalMutationLike

# Interface: OrvalMutationLike

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L9)

Loose mutation shape that accepts any Orval-generated hook result.
Orval hooks return concretely typed `mutate` signatures (e.g. `{ petId: number }`)
that are incompatible with generic `Record<string, unknown>` due to contravariance.
We use `any` at this adapter boundary intentionally.

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L14)

***

### mutate()

> **mutate**: (...`args`) => `void`

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L11)

#### Parameters

##### args

...`any`[]

#### Returns

`void`

***

### mutateAsync()

> **mutateAsync**: (...`args`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/crud/form/adapt-orval-mutation.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/adapt-orval-mutation.ts#L13)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`any`\>
