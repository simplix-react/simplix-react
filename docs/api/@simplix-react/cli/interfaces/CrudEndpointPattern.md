[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / CrudEndpointPattern

# Interface: CrudEndpointPattern

Defined in: [types.ts:12](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L12)

Defines how a CRUD role maps to HTTP method(s) and path pattern(s).

Path patterns use basePath-relative segments:
- `/` — basePath itself (collection)
- `/:id` — basePath + any path param
- `/*` — basePath + any single segment
- `/literal` — basePath + exact literal segment

## Properties

### method

> **method**: `HttpMethod` \| `HttpMethod`[]

Defined in: [types.ts:14](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L14)

HTTP method(s). Array for multiple methods (e.g., `["PUT", "PATCH"]`).

***

### path

> **path**: `string` \| `string`[]

Defined in: [types.ts:16](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L16)

BasePath-relative path pattern(s). Array for multiple patterns.
