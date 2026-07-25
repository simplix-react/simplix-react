[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalMutationLike

# Interface: OrvalMutationLike

Defined in: [packages/headless/dist/index.d.ts:289](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L289)

Loose mutation shape that accepts any Orval-generated hook result.
Orval hooks return concretely typed `mutate` signatures (e.g. `{ petId: number }`)
that are incompatible with generic `Record<string, unknown>` due to contravariance.
We use `any` at this adapter boundary intentionally.

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:292](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L292)

***

### mutate()

> **mutate**: (...`args`) => `void`

Defined in: [packages/headless/dist/index.d.ts:290](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L290)

#### Parameters

##### args

...`any`[]

#### Returns

`void`

***

### mutateAsync()

> **mutateAsync**: (...`args`) => `Promise`\<`any`\>

Defined in: [packages/headless/dist/index.d.ts:291](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L291)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`any`\>
