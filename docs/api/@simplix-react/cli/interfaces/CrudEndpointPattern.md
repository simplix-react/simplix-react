[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / CrudEndpointPattern

# Interface: CrudEndpointPattern

Defined in: [config/types.ts:15](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L15)

Defines how a CRUD role maps to HTTP method(s) and path pattern(s).

Path patterns use basePath-relative segments:
- `/` — basePath itself (collection)
- `/:id` — basePath + any path param
- `/*` — basePath + any single segment
- `/literal` — basePath + exact literal segment

## Properties

### method

> **method**: `HttpMethod` \| `HttpMethod`[]

Defined in: [config/types.ts:17](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L17)

HTTP method(s). Array for multiple methods (e.g., `["PUT", "PATCH"]`).

***

### path

> **path**: `string` \| `string`[]

Defined in: [config/types.ts:19](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L19)

BasePath-relative path pattern(s). Array for multiple patterns.
