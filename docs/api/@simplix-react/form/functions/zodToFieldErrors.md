[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/form](../README.md) / zodToFieldErrors

# Function: zodToFieldErrors()

> **zodToFieldErrors**\<`S`\>(`schema`, `values`): `Record`\<`string`, `string`\> \| `null`

Defined in: [utils/zod-field-errors.ts:46](https://github.com/simplix-react/simplix-react/blob/main/utils/zod-field-errors.ts#L46)

Adapter that turns a failed Zod `safeParse` into the
`Record<field, message>` shape used by `@simplix-react/ui`'s
`useCrudFormSubmit({ validator })` option.

Returns `null` on success — pass-through with no field errors.
Returns a record of `dot.joined.path` → first issue message on
failure. When the same field has multiple issues, only the FIRST
one is kept (Zod typically reports the most relevant issue first,
and a single message per field keeps the form UI compact).

## Type Parameters

### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`S`

Any Zod schema (object, refined, intersection, etc.)

### values

`unknown`

Form values to validate

## Returns

`Record`\<`string`, `string`\> \| `null`

A field-error record on failure, or `null` on success

## Examples

```ts
import { z } from "zod";
import { zodToFieldErrors } from "@simplix-react/form";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// Inside a useCrudFormSubmit caller:
const { handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
  ...,
  validator: (v) => zodToFieldErrors(createUserSchema, v),
});
```

```ts
const schema = z.object({
  profile: z.object({ phone: z.string().min(1) }),
  tags: z.array(z.object({ name: z.string().min(1) })),
});

zodToFieldErrors(schema, { profile: { phone: "" }, tags: [{ name: "" }] });
// { "profile.phone": "...", "tags.0.name": "..." }
```
