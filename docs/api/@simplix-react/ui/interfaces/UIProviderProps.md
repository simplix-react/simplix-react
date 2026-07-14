[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProviderProps

# Interface: UIProviderProps

Defined in: [packages/ui/src/provider/ui-provider.tsx:27](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L27)

Props for the [UIProvider](../functions/UIProvider.md) component.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/provider/ui-provider.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L36)

***

### overrides?

> `optional` **overrides**: `Partial`\<[`UIComponents`](UIComponents.md)\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L29)

Partial overrides for default base and primitive components.

***

### statusTones?

> `optional` **statusTones**: `Partial`\<`Record`\<[`StatusTone`](../type-aliases/StatusTone.md), `Partial`\<[`StatusToneToken`](StatusToneToken.md)\>\>\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L35)

Per-tone, per-slot class overrides for the status/severity palette
(success/warning/danger/…). Status tones are palette-literal, so this is
the channel for globally retoning status colors without forking components.
