[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / MockPolicyOptions

# Interface: MockPolicyOptions

Defined in: [mock-policy.ts:7](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/testing/src/mock-policy.ts#L7)

Options for [createMockPolicy](../functions/createMockPolicy.md).

## Properties

### allowAll?

> `optional` **allowAll**: `boolean`

Defined in: [mock-policy.ts:17](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/testing/src/mock-policy.ts#L17)

When `true` and no `rules` are provided, grants `manage` on `all`.

#### Default Value

```ts
true
```

***

### rules?

> `optional` **rules**: `SubjectRawRule`\<`DefaultActions`, `string`, `MongoQuery`\>[]

Defined in: [mock-policy.ts:9](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/testing/src/mock-policy.ts#L9)

CASL rules to apply. Defaults to `[]`.

***

### user?

> `optional` **user**: `AccessUser`\<`Record`\<`string`, `unknown`\>\>

Defined in: [mock-policy.ts:11](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/testing/src/mock-policy.ts#L11)

Test user identity.
