[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SignaturePad

# Function: SignaturePad()

> **SignaturePad**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/inputs/signature-pad.tsx:40](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/inputs/signature-pad.tsx#L40)

Signature capture surface with two modes: freehand drawing on a canvas and a
typed name rendered in a signature typeface. Either mode reports the result
as a PNG data URL through `onChange`, so submit paths upload one format
regardless of how the signature was captured.

## Parameters

### \_\_namedParameters

[`SignaturePadProps`](../interfaces/SignaturePadProps.md)

## Returns

`Element`

## Example

```tsx
<SignaturePad mode="drawn" onChange={setSignatureDataUrl} />
<SignaturePad mode="typed" typedName={name} onChange={setSignatureDataUrl} />
```
