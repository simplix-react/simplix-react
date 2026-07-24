[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SignaturePadProps

# Interface: SignaturePadProps

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:5](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L5)

Props for the [SignaturePad](../functions/SignaturePad.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L21)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L20)

***

### height?

> `optional` **height**: `number`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L19)

Canvas height in CSS pixels; defaults to 160. The width tracks the container.

***

### mode

> **mode**: `"drawn"` \| `"typed"`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:10](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L10)

Capture mode: `drawn` opens a freehand canvas (finger / stylus / mouse),
`typed` renders [SignaturePadProps.typedName](#typedname) in a script typeface.

***

### onChange()?

> `optional` **onChange**: (`dataUrl`) => `void`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L17)

Fires with the captured signature as a PNG data URL, or `null` while the
pad is empty (nothing drawn / blank typed name).

#### Parameters

##### dataUrl

`string` | `null`

#### Returns

`void`

***

### typedName?

> `optional` **typedName**: `string`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L12)

Name rendered as the signature in `typed` mode.
