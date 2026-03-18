[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useFlatUIComponents

# Function: useFlatUIComponents()

> **useFlatUIComponents**(): `object`

Defined in: [packages/ui/src/provider/ui-provider.tsx:202](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L202)

Flat-destructuring variant of [useUIComponents](useUIComponents.md).

Returns all overridable components — including compound sub-components —
with the same names used in direct base imports (e.g. `Table`, `TableRow`).

## Returns

`object`

### Badge

> **Badge**: `ComponentType`\<[`BadgeProps`](../interfaces/BadgeProps.md)\> = `ui.Badge`

### Button

> **Button**: `ComponentType`\<[`ButtonProps`](../interfaces/ButtonProps.md)\> = `ui.Button`

### Calendar

> **Calendar**: `ComponentType`\<[`CalendarProps`](../interfaces/CalendarProps.md)\> = `ui.Calendar`

### Card

> **Card**: `ComponentType`\<[`CardProps`](../interfaces/CardProps.md)\> = `ui.Card`

### Checkbox

> **Checkbox**: `ComponentType`\<`CheckboxProps` & `RefAttributes`\<`HTMLButtonElement`\>\> = `ui.Checkbox`

### Command

> **Command**: `ComponentType`\<`any`\> = `ui.Command.Root`

### CommandEmpty

> **CommandEmpty**: `ComponentType`\<`any`\> = `ui.Command.Empty`

### CommandGroup

> **CommandGroup**: `ComponentType`\<`any`\> = `ui.Command.Group`

### CommandInput

> **CommandInput**: `ComponentType`\<`any`\> = `ui.Command.Input`

### CommandItem

> **CommandItem**: `ComponentType`\<`any`\> = `ui.Command.Item`

### CommandList

> **CommandList**: `ComponentType`\<`any`\> = `ui.Command.List`

### CommandSeparator

> **CommandSeparator**: `ComponentType`\<`any`\> = `ui.Command.Separator`

### Container

> **Container**: `ComponentType`\<[`ContainerProps`](../interfaces/ContainerProps.md)\> = `ui.Container`

### CrudDelete

> **CrudDelete**: `ComponentType`\<[`CrudDeleteProps`](../interfaces/CrudDeleteProps.md)\> = `ui.CrudDelete`

### DetailFieldWrapper

> **DetailFieldWrapper**: `ComponentType`\<[`DetailFieldWrapperProps`](../interfaces/DetailFieldWrapperProps.md)\> = `ui.DetailFieldWrapper`

### Dialog

> **Dialog**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.Dialog.Root`

### DialogClose

> **DialogClose**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Dialog.Close`

### DialogContent

> **DialogContent**: `ComponentType`\<[`DialogContentProps`](../type-aliases/DialogContentProps.md)\> = `ui.Dialog.Content`

### DialogDescription

> **DialogDescription**: `ComponentType`\<`DialogDescriptionProps` & `RefAttributes`\<`HTMLParagraphElement`\>\> = `ui.Dialog.Description`

### DialogFooter

> **DialogFooter**: `ComponentType`\<[`DialogFooterProps`](../type-aliases/DialogFooterProps.md)\> = `ui.Dialog.Footer`

### DialogHeader

> **DialogHeader**: `ComponentType`\<[`DialogHeaderProps`](../type-aliases/DialogHeaderProps.md)\> = `ui.Dialog.Header`

### DialogOverlay

> **DialogOverlay**: `ComponentType`\<`DialogOverlayProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.Dialog.Overlay`

### DialogTitle

> **DialogTitle**: `ComponentType`\<`DialogTitleProps` & `RefAttributes`\<`HTMLHeadingElement`\>\> = `ui.Dialog.Title`

### DialogTrigger

> **DialogTrigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Dialog.Trigger`

### DropdownMenu

> **DropdownMenu**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.DropdownMenu.Root`

### DropdownMenuCheckboxItem

> **DropdownMenuCheckboxItem**: `ComponentType`\<`DropdownMenuCheckboxItemProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.DropdownMenu.CheckboxItem`

### DropdownMenuContent

> **DropdownMenuContent**: `ComponentType`\<`DropdownMenuContentProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.DropdownMenu.Content`

### DropdownMenuGroup

> **DropdownMenuGroup**: `ComponentType`\<\{ `children?`: `ReactNode`; \}\> = `ui.DropdownMenu.Group`

### DropdownMenuItem

> **DropdownMenuItem**: `ComponentType`\<[`DropdownMenuItemProps`](../type-aliases/DropdownMenuItemProps.md)\> = `ui.DropdownMenu.Item`

### DropdownMenuLabel

> **DropdownMenuLabel**: `ComponentType`\<[`DropdownMenuLabelProps`](../type-aliases/DropdownMenuLabelProps.md)\> = `ui.DropdownMenu.Label`

### DropdownMenuRadioGroup

> **DropdownMenuRadioGroup**: `ComponentType`\<\{ `children?`: `ReactNode`; `onValueChange?`: (`value`) => `void`; `value?`: `string`; \}\> = `ui.DropdownMenu.RadioGroup`

### DropdownMenuRadioItem

> **DropdownMenuRadioItem**: `ComponentType`\<`DropdownMenuRadioItemProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.DropdownMenu.RadioItem`

### DropdownMenuSeparator

> **DropdownMenuSeparator**: `ComponentType`\<`DropdownMenuSeparatorProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.DropdownMenu.Separator`

### DropdownMenuSub

> **DropdownMenuSub**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.DropdownMenu.Sub`

### DropdownMenuSubContent

> **DropdownMenuSubContent**: `ComponentType`\<`DropdownMenuSubContentProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.DropdownMenu.SubContent`

### DropdownMenuSubTrigger

> **DropdownMenuSubTrigger**: `ComponentType`\<[`DropdownMenuSubTriggerProps`](../type-aliases/DropdownMenuSubTriggerProps.md)\> = `ui.DropdownMenu.SubTrigger`

### DropdownMenuTrigger

> **DropdownMenuTrigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.DropdownMenu.Trigger`

### FieldWrapper

> **FieldWrapper**: `ComponentType`\<[`FieldWrapperProps`](../interfaces/FieldWrapperProps.md)\> = `ui.FieldWrapper`

### Flex

> **Flex**: `ComponentType`\<[`StackProps`](../interfaces/StackProps.md)\> = `ui.Flex`

### Grid

> **Grid**: `ComponentType`\<[`GridProps`](../interfaces/GridProps.md)\> = `ui.Grid`

### Heading

> **Heading**: `ComponentType`\<[`HeadingProps`](../interfaces/HeadingProps.md)\> = `ui.Heading`

### Input

> **Input**: `ComponentType`\<`DetailedHTMLProps`\<`InputHTMLAttributes`\<`HTMLInputElement`\>, `HTMLInputElement`\>\> = `ui.Input`

### Label

> **Label**: `ComponentType`\<`LabelProps` & `RefAttributes`\<`HTMLLabelElement`\>\> = `ui.Label`

### Popover

> **Popover**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.Popover.Root`

### PopoverContent

> **PopoverContent**: `ComponentType`\<`PopoverContentProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.Popover.Content`

### PopoverTrigger

> **PopoverTrigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Popover.Trigger`

### QueryFallback

> **QueryFallback**: `ComponentType`\<[`QueryFallbackProps`](../interfaces/QueryFallbackProps.md)\> = `ui.QueryFallback`

### RadioGroup

> **RadioGroup**: `ComponentType`\<`RadioGroupProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.RadioGroup.Root`

### RadioGroupItem

> **RadioGroupItem**: `ComponentType`\<`RadioGroupItemProps` & `RefAttributes`\<`HTMLButtonElement`\>\> = `ui.RadioGroup.Item`

### Section

> **Section**: `ComponentType`\<[`SectionProps`](../interfaces/SectionProps.md)\> = `ui.Section`

### SectionShell

> **SectionShell**: `ComponentType`\<[`SectionShellProps`](../interfaces/SectionShellProps.md)\> = `ui.SectionShell`

### Select

> **Select**: `ComponentType`\<\{ `children?`: `ReactNode`; `defaultValue?`: `string`; `disabled?`: `boolean`; `onValueChange?`: (`value`) => `void`; `value?`: `string`; \}\> = `ui.Select.Root`

### SelectContent

> **SelectContent**: `ComponentType`\<`SelectContentProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.Select.Content`

### SelectItem

> **SelectItem**: `ComponentType`\<`SelectItemProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.Select.Item`

### SelectTrigger

> **SelectTrigger**: `ComponentType`\<`SelectTriggerProps` & `RefAttributes`\<`HTMLButtonElement`\>\> = `ui.Select.Trigger`

### SelectValue

> **SelectValue**: `ComponentType`\<\{ `placeholder?`: `string`; \}\> = `ui.Select.Value`

### Sheet

> **Sheet**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.Sheet.Root`

### SheetClose

> **SheetClose**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Sheet.Close`

### SheetContent

> **SheetContent**: `ComponentType`\<[`SheetContentProps`](../type-aliases/SheetContentProps.md)\> = `ui.Sheet.Content`

### SheetDescription

> **SheetDescription**: `ComponentType`\<`DialogDescriptionProps` & `RefAttributes`\<`HTMLParagraphElement`\>\> = `ui.Sheet.Description`

### SheetFooter

> **SheetFooter**: `ComponentType`\<[`SheetFooterProps`](../type-aliases/SheetFooterProps.md)\> = `ui.Sheet.Footer`

### SheetHeader

> **SheetHeader**: `ComponentType`\<[`SheetHeaderProps`](../type-aliases/SheetHeaderProps.md)\> = `ui.Sheet.Header`

### SheetTitle

> **SheetTitle**: `ComponentType`\<`DialogTitleProps` & `RefAttributes`\<`HTMLHeadingElement`\>\> = `ui.Sheet.Title`

### SheetTrigger

> **SheetTrigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Sheet.Trigger`

### Skeleton

> **Skeleton**: `ComponentType`\<[`SkeletonProps`](../type-aliases/SkeletonProps.md)\> = `ui.Skeleton`

### Stack

> **Stack**: `ComponentType`\<[`StackProps`](../interfaces/StackProps.md)\> = `ui.Stack`

### Switch

> **Switch**: `ComponentType`\<[`SwitchProps`](../type-aliases/SwitchProps.md)\> = `ui.Switch`

### Table

> **Table**: `ComponentType`\<[`TableProps`](../type-aliases/TableProps.md)\> = `ui.Table.Root`

### TableBody

> **TableBody**: `ComponentType`\<`DetailedHTMLProps`\<`HTMLAttributes`\<`HTMLTableSectionElement`\>, `HTMLTableSectionElement`\>\> = `ui.Table.Body`

### TableCell

> **TableCell**: `ComponentType`\<`DetailedHTMLProps`\<`TdHTMLAttributes`\<`HTMLTableDataCellElement`\>, `HTMLTableDataCellElement`\>\> = `ui.Table.Cell`

### TableHead

> **TableHead**: `ComponentType`\<`DetailedHTMLProps`\<`ThHTMLAttributes`\<`HTMLTableHeaderCellElement`\>, `HTMLTableHeaderCellElement`\>\> = `ui.Table.Head`

### TableHeader

> **TableHeader**: `ComponentType`\<`DetailedHTMLProps`\<`HTMLAttributes`\<`HTMLTableSectionElement`\>, `HTMLTableSectionElement`\>\> = `ui.Table.Header`

### TableRow

> **TableRow**: `ComponentType`\<`DetailedHTMLProps`\<`HTMLAttributes`\<`HTMLTableRowElement`\>, `HTMLTableRowElement`\>\> = `ui.Table.Row`

### Tabs

> **Tabs**: `ComponentType`\<\{ `children?`: `ReactNode`; `defaultValue?`: `string`; `onValueChange?`: (`value`) => `void`; `value?`: `string`; \}\> = `ui.Tabs.Root`

### TabsContent

> **TabsContent**: `ComponentType`\<[`TabsContentProps`](../interfaces/TabsContentProps.md)\> = `ui.Tabs.Content`

### TabsList

> **TabsList**: `ComponentType`\<[`TabsListProps`](../interfaces/TabsListProps.md)\> = `ui.Tabs.List`

### TabsTrigger

> **TabsTrigger**: `ComponentType`\<`TabsTriggerProps` & `RefAttributes`\<`HTMLButtonElement`\>\> = `ui.Tabs.Trigger`

### Text

> **Text**: `ComponentType`\<[`TextProps`](../interfaces/TextProps.md)\> = `ui.Text`

### Textarea

> **Textarea**: `ComponentType`\<`DetailedHTMLProps`\<`TextareaHTMLAttributes`\<`HTMLTextAreaElement`\>, `HTMLTextAreaElement`\>\> = `ui.Textarea`

### Tooltip

> **Tooltip**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\> = `ui.Tooltip.Root`

### TooltipContent

> **TooltipContent**: `ComponentType`\<`TooltipContentProps` & `RefAttributes`\<`HTMLDivElement`\>\> = `ui.Tooltip.Content`

### TooltipProvider

> **TooltipProvider**: `ComponentType`\<`TooltipProviderProps`\> = `ui.Tooltip.Provider`

### TooltipTrigger

> **TooltipTrigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\> = `ui.Tooltip.Trigger`

## Example

```tsx
function MyList() {
  const { Button, Table, TableHeader, TableRow, TableCell } = useFlatUIComponents();
  return <Table>...</Table>;
}
```
