[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / WiredSchema

# Interface: WiredSchema\<TWire, TData\>

Defined in: [packages/contract/src/types.ts:30](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L30)

Compound output type carrying both the server wire format and the business
data schema. Used for operations where the transport envelope (e.g. a
`SimpliXApiResponse` wrapper) differs from the payload the client needs.

## Example

```ts
import { wired } from "@simplix-react/contract";
import { z } from "zod";

const output = wired(
  z.object({ type: z.string(), body: petSchema, timestamp: z.string() }),
  petSchema,
  (data) => ({ type: "SUCCESS", body: data, timestamp: new Date().toISOString() }),
  (wire) => wire.body,
);
```

## See

 - [wired](../functions/wired.md) for the factory function.
 - [isWiredSchema](../functions/isWiredSchema.md) for the runtime type guard.

## Type Parameters

### TWire

`TWire` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the full server response shape.

### TData

`TData` *extends* `z.ZodType` = `z.ZodType`

Zod schema for the business data after envelope removal.

## Properties

### \_tag

> `readonly` **\_tag**: `"WiredSchema"`

Defined in: [packages/contract/src/types.ts:34](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L34)

***

### data

> `readonly` **data**: `TData`

Defined in: [packages/contract/src/types.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L38)

Zod schema describing the business data after transport envelope removal.

***

### unwrap()

> **unwrap**: (`wire`) => `output`\<`TData`\>

Defined in: [packages/contract/src/types.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L42)

Extracts business data from the wire format (used for type inference).

#### Parameters

##### wire

`output`\<`TWire`\>

#### Returns

`output`\<`TData`\>

***

### wire

> `readonly` **wire**: `TWire`

Defined in: [packages/contract/src/types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L36)

Zod schema describing the full server response (wire format).

***

### wrap()

> **wrap**: (`data`) => `output`\<`TWire`\>

Defined in: [packages/contract/src/types.ts:40](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L40)

Wraps business data into the wire format (used by mock handlers).

#### Parameters

##### data

`output`\<`TData`\>

#### Returns

`output`\<`TWire`\>
