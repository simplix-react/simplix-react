[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/contract](../README.md) / buildPath

# Function: buildPath()

> **buildPath**(`template`, `params?`): `string`

Defined in: [packages/contract/src/helpers/path-builder.ts:23](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/contract/src/helpers/path-builder.ts#L23)

Substitutes `:paramName` placeholders in a URL path template with actual values.

Values are URI-encoded to ensure safe inclusion in URLs. Used internally by
[deriveClient](deriveClient.md) for building operation URLs, and available as a public
utility for custom URL construction.

## Parameters

### template

`string`

URL path template with `:paramName` placeholders.

### params?

`Record`\<`string`, `string`\> = `{}`

Map of parameter names to their string values.

## Returns

`string`

The resolved URL path with all placeholders replaced.

## Example

```ts
import { buildPath } from "@simplix-react/contract";

buildPath("/projects/:projectId/tasks", { projectId: "abc" });
// "/projects/abc/tasks"

buildPath("/tasks/:taskId/assign", { taskId: "task-1" });
// "/tasks/task-1/assign"
```
