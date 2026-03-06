[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/mock](../README.md) / MockEntityStore

# Interface: MockEntityStore\<T\>

Defined in: [mock-entity-store.ts:20](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L20)

## Type Parameters

### T

`T`

## Methods

### create()

> **create**(`data`): `T`

Defined in: [mock-entity-store.ts:30](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L30)

Create a new record (auto-assigns ID if missing)

#### Parameters

##### data

`Partial`\<`T`\>

#### Returns

`T`

***

### filter()

> **filter**(`predicate`): `T`[]

Defined in: [mock-entity-store.ts:26](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L26)

Filter records by predicate

#### Parameters

##### predicate

(`item`) => `boolean`

#### Returns

`T`[]

***

### getById()

> **getById**(`id`): `T` \| `undefined`

Defined in: [mock-entity-store.ts:28](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L28)

Find by primary key

#### Parameters

##### id

`string` | `number`

#### Returns

`T` \| `undefined`

***

### list()

> **list**(): `T`[]

Defined in: [mock-entity-store.ts:22](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L22)

All records

#### Returns

`T`[]

***

### listPaged()

> **listPaged**(`page`, `size`, `sort?`): [`PagedResult`](PagedResult.md)\<`T`\>

Defined in: [mock-entity-store.ts:24](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L24)

Paginated list (0-based page index). Sort format: `"field.direction"` (e.g. `"createdAt.desc"`).

#### Parameters

##### page

`number`

##### size

`number`

##### sort?

`string`

#### Returns

[`PagedResult`](PagedResult.md)\<`T`\>

***

### remove()

> **remove**(`id`): `boolean`

Defined in: [mock-entity-store.ts:36](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L36)

Delete by PK

#### Parameters

##### id

`string` | `number`

#### Returns

`boolean`

***

### reset()

> **reset**(): `void`

Defined in: [mock-entity-store.ts:38](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L38)

Reset to initial seed data

#### Returns

`void`

***

### update()

> **update**(`id`, `data`): `T` \| `undefined`

Defined in: [mock-entity-store.ts:32](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L32)

Update an existing record by PK

#### Parameters

##### id

`string` | `number`

##### data

`Partial`\<`T`\>

#### Returns

`T` \| `undefined`

***

### upsert()

> **upsert**(`data`): `T`

Defined in: [mock-entity-store.ts:34](https://github.com/simplix-react/simplix-react/blob/main/mock-entity-store.ts#L34)

Update if exists, create if not

#### Parameters

##### data

`T`

#### Returns

`T`
