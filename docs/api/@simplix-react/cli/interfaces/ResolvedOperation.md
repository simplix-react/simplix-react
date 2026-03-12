[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / ResolvedOperation

# Interface: ResolvedOperation

Defined in: [openapi/naming/naming-strategy.ts:64](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L64)

Result of resolving an operation — determines its CRUD role and hook name.

## Properties

### hookName

> **hookName**: `string`

Defined in: [openapi/naming/naming-strategy.ts:68](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L68)

Hook name without "use" prefix — Orval adds it automatically

***

### role

> **role**: `string`

Defined in: [openapi/naming/naming-strategy.ts:66](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L66)

CRUD role — standard roles (list, get, create, update, delete, getForEdit) or extended roles (search, batchUpdate, batchDelete, multiUpdate, order, etc.)
