[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / DynamicColorIconProps

# Interface: DynamicColorIconProps

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L13)

Props for the [DynamicColorIcon](../functions/DynamicColorIcon.md) component.

## Properties

### className?

> `optional` **className**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:52](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L52)

Additional CSS classes applied to the icon element.

***

### color?

> `optional` **color**: `string` \| `null`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:30](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L30)

Icon color as a CSS color value (e.g. `"#3b82f6"`).
Accepts `null` for DTO compatibility; falls back to `defaultColor`.

***

### defaultColor?

> `optional` **defaultColor**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L42)

Fallback color when `color` is not provided.

#### Default Value

```ts
"#94a3b8"
```

***

### defaultIcon?

> `optional` **defaultIcon**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L36)

Fallback icon name when `iconName` is not found or not provided.

#### Default Value

```ts
"circle"
```

***

### fallbackText?

> `optional` **fallbackText**: `string`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:49](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L49)

Fallback text shown when `iconName` is empty/null.
The first character (after trim) is rendered as a letter glyph at the same
box size. When set, takes precedence over `defaultIcon`.

***

### iconLibrary?

> `optional` **iconLibrary**: [`IconLibrary`](../type-aliases/IconLibrary.md)

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L24)

Icon library to use.

#### Default Value

```ts
"lucide"
```

***

### iconName?

> `optional` **iconName**: `string` \| `null`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L18)

Icon name in any format (kebab-case, PascalCase, camelCase, snake_case).
Normalized to kebab-case internally. Accepts `null` for DTO compatibility.

***

### size?

> `optional` **size**: `string` \| `number`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L58)

Icon size. Numbers are converted to pixels; strings are used as-is.

#### Default Value

```ts
16
```

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [packages/ui/src/base/display/dynamic-color-icon.tsx:61](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/dynamic-color-icon.tsx#L61)

Inline style overrides applied after computed styles.
