[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / ColorTheme

# Interface: ColorTheme

Defined in: [theme-manifest.ts:12](https://github.com/simplix-react/simplix-react/blob/main/theme-manifest.ts#L12)

Registry of the color themes shipped by @simplix-react/ui.

Pure data (no imports) so consumers can read it without pulling the
component barrel. The actual token values live in `theme/presets/*.css`
(and `theme/base.css` for the neutral `default`); each entry's
`primaryColor` mirrors that theme's light `--primary` for picker swatches.

`value` maps to the `data-color-theme` attribute. `default` carries no
attribute — it is the bare `:root` base; selecting it clears the attribute.

## Properties

### label

> **label**: `string`

Defined in: [theme-manifest.ts:16](https://github.com/simplix-react/simplix-react/blob/main/theme-manifest.ts#L16)

Human-readable picker label.

***

### primaryColor

> **primaryColor**: `string`

Defined in: [theme-manifest.ts:18](https://github.com/simplix-react/simplix-react/blob/main/theme-manifest.ts#L18)

Light-mode `--primary` of this theme, for the picker swatch.

***

### value

> **value**: `string`

Defined in: [theme-manifest.ts:14](https://github.com/simplix-react/simplix-react/blob/main/theme-manifest.ts#L14)

Identifier set as `data-color-theme` (`default` = no attribute / base).
