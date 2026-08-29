[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / ContainerMapping

# Interface: ContainerMapping

Defined in: [openapi/orchestration/spec-profile.ts:13](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L13)

What a Java container name from SimpliX Meta becomes on the TypeScript side.

## Remarks

SimpliX Meta names a container as the backend spells it (`List`, `Map`, `Page`,
`SimpliXApiResponse`); which TypeScript type and zod factory it turns into is a decision
belonging to the spec profile, not to SimpliX Meta.

## Properties

### import?

> `optional` **import**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:19](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L19)

Module the TS type and zod factory are imported from.

***

### keyType?

> `optional` **keyType**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:23](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L23)

For `Map`: the key type, which SimpliX Meta does not carry.

***

### ts?

> `optional` **ts**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:15](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L15)

The TypeScript type name, or absent when the container disappears from client types.

***

### unwrap?

> `optional` **unwrap**: `boolean`

Defined in: [openapi/orchestration/spec-profile.ts:21](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L21)

The mutator strips this container before React Query sees it, so it has no client type.

***

### zod?

> `optional` **zod**: `string`

Defined in: [openapi/orchestration/spec-profile.ts:17](https://github.com/simplix-react/simplix-react/blob/main/openapi/orchestration/spec-profile.ts#L17)

The zod factory that wraps the inner schema.
