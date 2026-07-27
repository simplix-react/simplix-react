[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ColorTheme

# Interface: ColorTheme

Defined in: [packages/headless/dist/index.d.ts:706](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L706)

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

Defined in: [packages/headless/dist/index.d.ts:710](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L710)

Human-readable picker label.

***

### primaryColor

> **primaryColor**: `string`

Defined in: [packages/headless/dist/index.d.ts:712](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L712)

Light-mode `--primary` of this theme, for the picker swatch.

***

### value

> **value**: `string`

Defined in: [packages/headless/dist/index.d.ts:708](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L708)

Identifier set as `data-color-theme` (`default` = no attribute / base).
