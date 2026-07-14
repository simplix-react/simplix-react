[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CropModalProps

# Interface: CropModalProps

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L16)

## Properties

### file

> **file**: `File` \| `null`

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L18)

***

### initialRatio?

> `optional` **initialRatio**: `number`

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L26)

Aspect ratio preselected each time the modal opens: -1 = original (default),
0 = free, > 0 = fixed ratio (e.g. 1 for a square avatar crop).

***

### onClose()

> **onClose**: () => `void`

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:19](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L19)

#### Returns

`void`

***

### onSave()

> **onSave**: (`area`) => `void`

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:21](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L21)

area === null means "original" — upload the source file without cropping.

#### Parameters

##### area

[`CropArea`](CropArea.md) | `null`

#### Returns

`void`

***

### open

> **open**: `boolean`

Defined in: [packages/ui/src/fields/image-attachment/components/crop-modal.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/fields/image-attachment/components/crop-modal.tsx#L17)
