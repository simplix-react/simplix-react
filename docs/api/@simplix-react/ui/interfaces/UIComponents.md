[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIComponents

# Interface: UIComponents

Defined in: [packages/ui/src/provider/types.ts:204](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L204)

All UI components that can be overridden via [UIProvider](../functions/UIProvider.md).

Override individual components:
```tsx
<UIProvider overrides={{ Button: MyButton, Skeleton: MyLoader }}>
  <App />
</UIProvider>
```

Override sub-components of compound components:
```tsx
<UIProvider overrides={{
  Dialog: { Content: MyDialogContent },          // only Content
  Table: { Row: MyTableRow, Cell: MyTableCell },  // Row + Cell
  Select: { Trigger: MySelectTrigger },           // only Trigger
}}>
  <App />
</UIProvider>
```

Override CRUD building blocks:
```tsx
<UIProvider overrides={{
  SectionShell: MySectionShell,   // card/flat section layout
  QueryFallback: MyFallback,      // loading / not-found state
  CrudDelete: MyDeleteDialog,     // delete confirmation dialog
  FieldWrapper: MyFieldWrapper,   // form field wrapper (label, error, description)
  DetailFieldWrapper: MyWrapper,  // read-only field wrapper
}}>
  <App />
</UIProvider>
```

Scoped overrides (nesting):
```tsx
<UIProvider overrides={{ Button: CompactButton }}>
  {/* CompactButton used here */}
  <UIProvider overrides={{ Button: LargeButton }}>
    {/* LargeButton used here — inner provider wins */}
  </UIProvider>
</UIProvider>
```

## Properties

### Badge

> **Badge**: `ComponentType`\<[`BadgeProps`](BadgeProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:211](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L211)

***

### Button

> **Button**: `ComponentType`\<[`ButtonProps`](ButtonProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:213](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L213)

***

### Calendar

> **Calendar**: `ComponentType`\<[`CalendarProps`](CalendarProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:212](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L212)

***

### Card

> **Card**: `ComponentType`\<[`CardProps`](CardProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:233](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L233)

***

### Checkbox

> **Checkbox**: `ComponentType`\<`CheckboxProps` & `RefAttributes`\<`HTMLButtonElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:210](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L210)

***

### Command

> **Command**: [`CommandComponents`](CommandComponents.md)

Defined in: [packages/ui/src/provider/types.ts:224](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L224)

***

### Container

> **Container**: `ComponentType`\<[`ContainerProps`](ContainerProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:227](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L227)

***

### CrudDelete

> **CrudDelete**: `ComponentType`\<[`CrudDeleteProps`](CrudDeleteProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:238](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L238)

***

### DetailFieldWrapper

> **DetailFieldWrapper**: `ComponentType`\<[`DetailFieldWrapperProps`](DetailFieldWrapperProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:241](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L241)

***

### Dialog

> **Dialog**: [`DialogComponents`](DialogComponents.md)

Defined in: [packages/ui/src/provider/types.ts:218](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L218)

***

### DropdownMenu

> **DropdownMenu**: [`DropdownMenuComponents`](DropdownMenuComponents.md)

Defined in: [packages/ui/src/provider/types.ts:222](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L222)

***

### FieldWrapper

> **FieldWrapper**: `ComponentType`\<[`FieldWrapperProps`](FieldWrapperProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:240](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L240)

***

### Flex

> **Flex**: `ComponentType`\<[`StackProps`](StackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:229](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L229)

***

### Grid

> **Grid**: `ComponentType`\<[`GridProps`](GridProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:230](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L230)

***

### Heading

> **Heading**: `ComponentType`\<[`HeadingProps`](HeadingProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:231](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L231)

***

### Input

> **Input**: `ComponentType`\<`DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:206](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L206)

***

### Label

> **Label**: `ComponentType`\<`LabelProps` & `RefAttributes`\<`HTMLLabelElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:208](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L208)

***

### Popover

> **Popover**: [`PopoverComponents`](PopoverComponents.md)

Defined in: [packages/ui/src/provider/types.ts:220](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L220)

***

### QueryFallback

> **QueryFallback**: `ComponentType`\<[`QueryFallbackProps`](QueryFallbackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:237](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L237)

***

### RadioGroup

> **RadioGroup**: [`RadioGroupComponents`](RadioGroupComponents.md)

Defined in: [packages/ui/src/provider/types.ts:217](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L217)

***

### Section

> **Section**: `ComponentType`\<[`SectionProps`](SectionProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:234](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L234)

***

### SectionShell

> **SectionShell**: `ComponentType`\<[`SectionShellProps`](SectionShellProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:236](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L236)

***

### Select

> **Select**: [`SelectComponents`](SelectComponents.md)

Defined in: [packages/ui/src/provider/types.ts:216](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L216)

***

### Sheet

> **Sheet**: [`SheetComponents`](SheetComponents.md)

Defined in: [packages/ui/src/provider/types.ts:219](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L219)

***

### Skeleton

> **Skeleton**: `ComponentType`\<[`SkeletonProps`](../type-aliases/SkeletonProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:214](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L214)

***

### Stack

> **Stack**: `ComponentType`\<[`StackProps`](StackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:228](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L228)

***

### Switch

> **Switch**: `ComponentType`\<[`SwitchProps`](../type-aliases/SwitchProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:209](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L209)

***

### Table

> **Table**: [`TableComponents`](TableComponents.md)

Defined in: [packages/ui/src/provider/types.ts:225](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L225)

***

### Tabs

> **Tabs**: [`TabsComponents`](TabsComponents.md)

Defined in: [packages/ui/src/provider/types.ts:223](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L223)

***

### Text

> **Text**: `ComponentType`\<[`TextProps`](TextProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:232](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L232)

***

### Textarea

> **Textarea**: `ComponentType`\<`DetailedHTMLProps`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `HTMLTextAreaElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:207](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L207)

***

### Tooltip

> **Tooltip**: [`TooltipComponents`](TooltipComponents.md)

Defined in: [packages/ui/src/provider/types.ts:221](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L221)
