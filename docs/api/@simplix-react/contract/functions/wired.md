[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / wired

# Function: wired()

> **wired**\<`TWire`, `TData`\>(`wire`, `data`, `wrap`, `unwrap`): [`WiredSchema`](../interfaces/WiredSchema.md)\<`TWire`, `TData`\>

Defined in: [packages/contract/src/types.ts:64](https://github.com/simplix-react/simplix-react/blob/main/packages/contract/src/types.ts#L64)

Creates a [WiredSchema](../interfaces/WiredSchema.md) that pairs a wire-format schema with a
business-data schema, along with `wrap` / `unwrap` transform functions.

## Type Parameters

### TWire

`TWire` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

### TData

`TData` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### wire

`TWire`

Zod schema for the full server response.

### data

`TData`

Zod schema for the business payload after envelope removal.

### wrap

(`data`) => `output`\<`TWire`\>

Transforms business data into the wire format.

### unwrap

(`wire`) => `output`\<`TData`\>

Extracts business data from the wire format.

## Returns

[`WiredSchema`](../interfaces/WiredSchema.md)\<`TWire`, `TData`\>

## Example

```ts
import { wired } from "@simplix-react/contract";

const output = wired(wireSchema, dataSchema,
  (data) => ({ type: "SUCCESS", body: data, timestamp: new Date().toISOString() }),
  (wire) => wire.body,
);
```
