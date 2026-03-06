[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / ErrorCategory

# Type Alias: ErrorCategory

> **ErrorCategory** = `"validation"` \| `"auth"` \| `"client"` \| `"server"` \| `"network"` \| `"unknown"`

Defined in: [packages/api/src/error-utils.ts:28](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/error-utils.ts#L28)

Classification category for server errors.

- `"validation"` — 4xx with field-level errors (e.g. 400, 422).
- `"auth"` — 401 Unauthorized or 403 Forbidden.
- `"client"` — 4xx without validation errors (e.g. 404, 409).
- `"server"` — 5xx server errors.
- `"network"` — `TypeError` with no HTTP status (fetch failure).
- `"unknown"` — Unclassifiable errors.
