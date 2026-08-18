[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProviderProps

# Interface: UIProviderProps

Defined in: [packages/ui/src/provider/ui-provider.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L28)

Props for the [UIProvider](../functions/UIProvider.md) component.

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/provider/ui-provider.tsx:44](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L44)

***

### defaults?

> `optional` **defaults**: `Partial`\<[`UIDefaults`](UIDefaults.md)\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L43)

Prop defaults for this whole console — see [UIDefaults](UIDefaults.md).

<p>Set here rather than on every screen: a default written per screen is one a new screen
forgets, and the screens then disagree about something the product decided once.

***

### overrides?

> `optional` **overrides**: `Partial`\<[`UIComponents`](UIComponents.md)\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L30)

Partial overrides for default base and primitive components.

***

### statusTones?

> `optional` **statusTones**: `Partial`\<`Record`\<[`StatusTone`](../type-aliases/StatusTone.md), `Partial`\<[`StatusToneToken`](StatusToneToken.md)\>\>\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L36)

Per-tone, per-slot class overrides for the status/severity palette
(success/warning/danger/…). Status tones are palette-literal, so this is
the channel for globally retoning status colors without forking components.
