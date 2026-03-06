[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / ResolvedOperation

# Interface: ResolvedOperation

Defined in: [openapi/naming/naming-strategy.ts:65](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L65)

Result of resolving an operation — determines its CRUD role and hook name.

## Properties

### hookName

> **hookName**: `string`

Defined in: [openapi/naming/naming-strategy.ts:69](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L69)

Hook name without "use" prefix — Orval adds it automatically

***

### role

> **role**: `string`

Defined in: [openapi/naming/naming-strategy.ts:67](https://github.com/simplix-react/simplix-react/blob/main/openapi/naming/naming-strategy.ts#L67)

CRUD role — standard roles (list, get, create, update, delete, getForEdit) or extended roles (search, batchUpdate, batchDelete, multiUpdate, order, etc.)
