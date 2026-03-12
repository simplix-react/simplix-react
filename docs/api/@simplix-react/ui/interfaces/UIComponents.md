[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIComponents

# Interface: UIComponents

Defined in: [packages/ui/src/provider/types.ts:206](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L206)

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

Defined in: [packages/ui/src/provider/types.ts:213](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L213)

***

### Button

> **Button**: `ComponentType`\<[`ButtonProps`](ButtonProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:215](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L215)

***

### Calendar

> **Calendar**: `ComponentType`\<[`CalendarProps`](CalendarProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:214](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L214)

***

### Card

> **Card**: `ComponentType`\<[`CardProps`](CardProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:235](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L235)

***

### Checkbox

> **Checkbox**: `ComponentType`\<`CheckboxProps` & `RefAttributes`\<`HTMLButtonElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:212](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L212)

***

### Command

> **Command**: [`CommandComponents`](CommandComponents.md)

Defined in: [packages/ui/src/provider/types.ts:226](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L226)

***

### Container

> **Container**: `ComponentType`\<[`ContainerProps`](ContainerProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:229](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L229)

***

### CrudDelete

> **CrudDelete**: `ComponentType`\<[`CrudDeleteProps`](CrudDeleteProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:240](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L240)

***

### DetailFieldWrapper

> **DetailFieldWrapper**: `ComponentType`\<[`DetailFieldWrapperProps`](DetailFieldWrapperProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:243](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L243)

***

### Dialog

> **Dialog**: [`DialogComponents`](DialogComponents.md)

Defined in: [packages/ui/src/provider/types.ts:220](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L220)

***

### DropdownMenu

> **DropdownMenu**: [`DropdownMenuComponents`](DropdownMenuComponents.md)

Defined in: [packages/ui/src/provider/types.ts:224](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L224)

***

### FieldWrapper

> **FieldWrapper**: `ComponentType`\<[`FieldWrapperProps`](FieldWrapperProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:242](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L242)

***

### Flex

> **Flex**: `ComponentType`\<[`StackProps`](StackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:231](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L231)

***

### Grid

> **Grid**: `ComponentType`\<[`GridProps`](GridProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:232](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L232)

***

### Heading

> **Heading**: `ComponentType`\<[`HeadingProps`](HeadingProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:233](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L233)

***

### Input

> **Input**: `ComponentType`\<`DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:208](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L208)

***

### Label

> **Label**: `ComponentType`\<`LabelProps` & `RefAttributes`\<`HTMLLabelElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:210](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L210)

***

### Popover

> **Popover**: [`PopoverComponents`](PopoverComponents.md)

Defined in: [packages/ui/src/provider/types.ts:222](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L222)

***

### QueryFallback

> **QueryFallback**: `ComponentType`\<[`QueryFallbackProps`](QueryFallbackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:239](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L239)

***

### RadioGroup

> **RadioGroup**: [`RadioGroupComponents`](RadioGroupComponents.md)

Defined in: [packages/ui/src/provider/types.ts:219](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L219)

***

### Section

> **Section**: `ComponentType`\<[`SectionProps`](SectionProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:236](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L236)

***

### SectionShell

> **SectionShell**: `ComponentType`\<[`SectionShellProps`](SectionShellProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:238](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L238)

***

### Select

> **Select**: [`SelectComponents`](SelectComponents.md)

Defined in: [packages/ui/src/provider/types.ts:218](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L218)

***

### Sheet

> **Sheet**: [`SheetComponents`](SheetComponents.md)

Defined in: [packages/ui/src/provider/types.ts:221](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L221)

***

### Skeleton

> **Skeleton**: `ComponentType`\<[`SkeletonProps`](../type-aliases/SkeletonProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:216](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L216)

***

### Stack

> **Stack**: `ComponentType`\<[`StackProps`](StackProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:230](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L230)

***

### Switch

> **Switch**: `ComponentType`\<[`SwitchProps`](../type-aliases/SwitchProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:211](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L211)

***

### Table

> **Table**: [`TableComponents`](TableComponents.md)

Defined in: [packages/ui/src/provider/types.ts:227](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L227)

***

### Tabs

> **Tabs**: [`TabsComponents`](TabsComponents.md)

Defined in: [packages/ui/src/provider/types.ts:225](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L225)

***

### Text

> **Text**: `ComponentType`\<[`TextProps`](TextProps.md)\>

Defined in: [packages/ui/src/provider/types.ts:234](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L234)

***

### Textarea

> **Textarea**: `ComponentType`\<`DetailedHTMLProps`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `HTMLTextAreaElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:209](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L209)

***

### Tooltip

> **Tooltip**: [`TooltipComponents`](TooltipComponents.md)

Defined in: [packages/ui/src/provider/types.ts:223](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L223)
