[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DetailProfileFeatsProps

# Interface: DetailProfileFeatsProps

Defined in: [packages/ui/src/crud/detail/detail-profile.tsx:63](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/detail-profile.tsx#L63)

Props for the [DetailProfile.Feats](../variables/DetailProfile.md) sub-component.

## Properties

### emptyLabel

> **emptyLabel**: `string`

Defined in: [packages/ui/src/crud/detail/detail-profile.tsx:72](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/detail-profile.tsx#L72)

Already-localized "no active features" text. Required — the library ships no
default string (visible strings are caller-owned).

***

### items

> **items**: readonly `string`[]

Defined in: [packages/ui/src/crud/detail/detail-profile.tsx:65](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/detail-profile.tsx#L65)

Already-localized badge labels. Empty array → `emptyLabel` is shown instead.

***

### max?

> `optional` **max**: `number`

Defined in: [packages/ui/src/crud/detail/detail-profile.tsx:67](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/detail-profile.tsx#L67)

Max badges before collapsing the remainder into a "+N" badge. Default `5`.

***

### overflowLabel()?

> `optional` **overflowLabel**: (`hiddenCount`) => `string`

Defined in: [packages/ui/src/crud/detail/detail-profile.tsx:77](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/detail-profile.tsx#L77)

Already-localized accessible label for the "+N" overflow badge, e.g.
`(n) => t("detail.moreFeatures", { count: n })`. Falls back to the visible "+N".

#### Parameters

##### hiddenCount

`number`

#### Returns

`string`
