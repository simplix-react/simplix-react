[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / OpenApiNamingStrategy

# Interface: OpenApiNamingStrategy

Defined in: [openapi/naming/naming-strategy.ts:93](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L93)

Strategy interface for per-spec naming customization.

## Remarks

Injected into the CLI pipeline to control how entity names and operation
hook names are derived from OpenAPI tags and operations. Each [SpecProfile](SpecProfile.md)
includes a naming strategy.

## Example

```ts
import type { OpenApiNamingStrategy } from "@simplix-react/cli";

const strategy: OpenApiNamingStrategy = {
  resolveEntityName: (ctx) => camelCase(ctx.tag ?? "unknown"),
  resolveOperation: (ctx) => ({
    role: inferRole(ctx.method, ctx.path),
    hookName: camelCase(ctx.operationId),
  }),
};
```

## Methods

### resolveEntityName()

> **resolveEntityName**(`context`): `string`

Defined in: [openapi/naming/naming-strategy.ts:100](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L100)

Derives a camelCase entity name from an OpenAPI tag group.

#### Parameters

##### context

[`EntityNameContext`](EntityNameContext.md)

The tag group context containing tag name, paths, operations, and schemas

#### Returns

`string`

A camelCase entity name (e.g., `"projectTask"`)

***

### resolveOperation()

> **resolveOperation**(`context`): [`ResolvedOperation`](ResolvedOperation.md)

Defined in: [openapi/naming/naming-strategy.ts:107](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L107)

Maps an OpenAPI operation to a CRUD role and hook name.

#### Parameters

##### context

[`OperationContext`](OperationContext.md)

The operation context containing method, path, entity name, and schema info

#### Returns

[`ResolvedOperation`](ResolvedOperation.md)

A [ResolvedOperation](ResolvedOperation.md) with the determined role and hook name
