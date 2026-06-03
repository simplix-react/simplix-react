[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DynamicColorIconProps

# Interface: DynamicColorIconProps

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:12](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L12)

Props for the [DynamicColorIcon](../functions/DynamicColorIcon.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:51](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L51)

Additional CSS classes applied to the icon element.

***

### color?

> `optional` **color**: `string` \| `null`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:29](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L29)

Icon color as a CSS color value (e.g. `"#3b82f6"`).
Accepts `null` for DTO compatibility; falls back to `defaultColor`.

***

### defaultColor?

> `optional` **defaultColor**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:41](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L41)

Fallback color when `color` is not provided.

#### Default Value

```ts
"#94a3b8"
```

***

### defaultIcon?

> `optional` **defaultIcon**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L35)

Fallback icon name when `iconName` is not found or not provided.

#### Default Value

```ts
"circle"
```

***

### fallbackText?

> `optional` **fallbackText**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:48](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L48)

Fallback text shown when `iconName` is empty/null.
The first character (after trim) is rendered as a letter glyph at the same
box size. When set, takes precedence over `defaultIcon`.

***

### iconLibrary?

> `optional` **iconLibrary**: [`IconLibrary`](../type-aliases/IconLibrary.md)

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L23)

Icon library to use.

#### Default Value

```ts
"lucide"
```

***

### iconName?

> `optional` **iconName**: `string` \| `null`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L17)

Icon name in any format (kebab-case, PascalCase, camelCase, snake_case).
Normalized to kebab-case internally. Accepts `null` for DTO compatibility.

***

### size?

> `optional` **size**: `string` \| `number`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:57](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L57)

Icon size. Numbers are converted to pixels; strings are used as-is.

#### Default Value

```ts
16
```

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:60](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L60)

Inline style overrides applied after computed styles.
