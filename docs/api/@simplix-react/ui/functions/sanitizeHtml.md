[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / sanitizeHtml

# Function: sanitizeHtml()

> **sanitizeHtml**(`dirty`): `string`

Defined in: [packages/ui/src/utils/sanitize.ts:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/sanitize.ts#L19)

Sanitize an HTML string by stripping dangerous tags and attributes.

## Parameters

### dirty

`string`

Untrusted HTML string.

## Returns

`string`

Sanitized HTML string with dangerous elements removed.

## Remarks

Uses DOMPurify under the hood. Suitable for cleaning user-generated
HTML content before rendering.

## Example

```ts
const safe = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
// → '<p>Hello</p>'
```
