[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalMutationLike

# Interface: OrvalMutationLike

Defined in: [packages/headless/dist/index.d.ts:203](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L203)

Loose mutation shape that accepts any Orval-generated hook result.
Orval hooks return concretely typed `mutate` signatures (e.g. `{ petId: number }`)
that are incompatible with generic `Record<string, unknown>` due to contravariance.
We use `any` at this adapter boundary intentionally.

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [packages/headless/dist/index.d.ts:206](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L206)

***

### mutate()

> **mutate**: (...`args`) => `void`

Defined in: [packages/headless/dist/index.d.ts:204](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L204)

#### Parameters

##### args

...`any`[]

#### Returns

`void`

***

### mutateAsync()

> **mutateAsync**: (...`args`) => `Promise`\<`any`\>

Defined in: [packages/headless/dist/index.d.ts:205](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L205)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`any`\>
