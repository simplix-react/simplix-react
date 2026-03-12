import type {ComponentType} from "react";

import type {
  BadgeProps,
  ButtonProps,
  CalendarProps,
  CheckboxProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogTitleProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubTriggerProps,
  InputProps,
  LabelProps,
  PopoverContentProps,
  RadioGroupItemProps,
  RadioGroupProps,
  SelectContentProps,
  SelectItemProps,
  SelectTriggerProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetTitleProps,
  SkeletonProps,
  SwitchProps,
  TableBodyProps,
  TableCellProps,
  TableHeaderProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  TabsContentProps,
  TabsListProps,
  TabsTriggerProps,
  TextareaProps,
  TooltipContentProps,
  TooltipProviderProps,
} from "../base";
import type {
  CardProps,
  ContainerProps,
  FlexProps,
  GridProps,
  HeadingProps,
  SectionProps,
  StackProps,
  TextProps,
} from "../primitives";
import type {CrudDeleteProps} from "../crud/delete";
import type {QueryFallbackProps} from "../crud/shared";
import type {SectionShellProps} from "../crud/shared/section-shell";
import type {DetailFieldWrapperProps, FieldWrapperProps} from "../fields";

// ── Compound component interfaces ──

export interface SelectComponents {
  Root: ComponentType<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string; disabled?: boolean }>;
  Trigger: ComponentType<SelectTriggerProps>;
  Value: ComponentType<{ placeholder?: string }>;
  Content: ComponentType<SelectContentProps>;
  Item: ComponentType<SelectItemProps>;
}

export interface RadioGroupComponents {
  Root: ComponentType<RadioGroupProps>;
  Item: ComponentType<RadioGroupItemProps>;
}

export interface DialogComponents {
  Root: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  Trigger: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
  Content: ComponentType<DialogContentProps>;
  Header: ComponentType<DialogHeaderProps>;
  Footer: ComponentType<DialogFooterProps>;
  Title: ComponentType<DialogTitleProps>;
  Description: ComponentType<DialogDescriptionProps>;
  Overlay: ComponentType<DialogOverlayProps>;
  Close: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
}

export interface SheetComponents {
  Root: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  Trigger: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
  Content: ComponentType<SheetContentProps>;
  Header: ComponentType<SheetHeaderProps>;
  Footer: ComponentType<SheetFooterProps>;
  Title: ComponentType<SheetTitleProps>;
  Description: ComponentType<SheetDescriptionProps>;
  Close: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
}

export interface PopoverComponents {
  Root: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  Trigger: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
  Content: ComponentType<PopoverContentProps>;
}

export interface TooltipComponents {
  Provider: ComponentType<TooltipProviderProps>;
  Root: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  Trigger: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
  Content: ComponentType<TooltipContentProps>;
}

export interface DropdownMenuComponents {
  Root: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  Trigger: ComponentType<{ children?: React.ReactNode; asChild?: boolean }>;
  Content: ComponentType<DropdownMenuContentProps>;
  Item: ComponentType<DropdownMenuItemProps>;
  CheckboxItem: ComponentType<DropdownMenuCheckboxItemProps>;
  RadioItem: ComponentType<DropdownMenuRadioItemProps>;
  Label: ComponentType<DropdownMenuLabelProps>;
  Separator: ComponentType<DropdownMenuSeparatorProps>;
  Group: ComponentType<{ children?: React.ReactNode }>;
  RadioGroup: ComponentType<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void }>;
  Sub: ComponentType<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  SubTrigger: ComponentType<DropdownMenuSubTriggerProps>;
  SubContent: ComponentType<DropdownMenuSubContentProps>;
}

export interface TabsComponents {
  Root: ComponentType<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string }>;
  List: ComponentType<TabsListProps>;
  Trigger: ComponentType<TabsTriggerProps>;
  Content: ComponentType<TabsContentProps>;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- command palette components have library-dependent props */
export interface CommandComponents {
  Root: ComponentType<any>;
  Input: ComponentType<any>;
  List: ComponentType<any>;
  Empty: ComponentType<any>;
  Group: ComponentType<any>;
  Item: ComponentType<any>;
  Separator: ComponentType<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface TableComponents {
  Root: ComponentType<TableProps>;
  Header: ComponentType<TableHeaderProps>;
  Body: ComponentType<TableBodyProps>;
  Row: ComponentType<TableRowProps>;
  Head: ComponentType<TableHeadProps>;
  Cell: ComponentType<TableCellProps>;
}

// ── Main interface ──

/**
 * All UI components that can be overridden via {@link UIProvider}.
 *
 * Override individual components:
 * ```tsx
 * <UIProvider overrides={{ Button: MyButton, Skeleton: MyLoader }}>
 *   <App />
 * </UIProvider>
 * ```
 *
 * Override sub-components of compound components:
 * ```tsx
 * <UIProvider overrides={{
 *   Dialog: { Content: MyDialogContent },          // only Content
 *   Table: { Row: MyTableRow, Cell: MyTableCell },  // Row + Cell
 *   Select: { Trigger: MySelectTrigger },           // only Trigger
 * }}>
 *   <App />
 * </UIProvider>
 * ```
 *
 * Override CRUD building blocks:
 * ```tsx
 * <UIProvider overrides={{
 *   SectionShell: MySectionShell,   // card/flat section layout
 *   QueryFallback: MyFallback,      // loading / not-found state
 *   CrudDelete: MyDeleteDialog,     // delete confirmation dialog
 *   FieldWrapper: MyFieldWrapper,   // form field wrapper (label, error, description)
 *   DetailFieldWrapper: MyWrapper,  // read-only field wrapper
 * }}>
 *   <App />
 * </UIProvider>
 * ```
 *
 * Scoped overrides (nesting):
 * ```tsx
 * <UIProvider overrides={{ Button: CompactButton }}>
 *   {/* CompactButton used here *\/}
 *   <UIProvider overrides={{ Button: LargeButton }}>
 *     {/* LargeButton used here — inner provider wins *\/}
 *   </UIProvider>
 * </UIProvider>
 * ```
 */
export interface UIComponents {
  // Base components
  Input: ComponentType<InputProps>;
  Textarea: ComponentType<TextareaProps>;
  Label: ComponentType<LabelProps>;
  Switch: ComponentType<SwitchProps>;
  Checkbox: ComponentType<CheckboxProps>;
  Badge: ComponentType<BadgeProps>;
  Calendar: ComponentType<CalendarProps>;
  Button: ComponentType<ButtonProps>;
  Skeleton: ComponentType<SkeletonProps>;
  // Compound base components
  Select: SelectComponents;
  RadioGroup: RadioGroupComponents;
  Dialog: DialogComponents;
  Sheet: SheetComponents;
  Popover: PopoverComponents;
  Tooltip: TooltipComponents;
  DropdownMenu: DropdownMenuComponents;
  Tabs: TabsComponents;
  Command: CommandComponents;
  Table: TableComponents;
  // Primitives
  Container: ComponentType<ContainerProps>;
  Stack: ComponentType<StackProps>;
  Flex: ComponentType<FlexProps>;
  Grid: ComponentType<GridProps>;
  Heading: ComponentType<HeadingProps>;
  Text: ComponentType<TextProps>;
  Card: ComponentType<CardProps>;
  Section: ComponentType<SectionProps>;
  // CRUD components
  SectionShell: ComponentType<SectionShellProps>;
  QueryFallback: ComponentType<QueryFallbackProps>;
  CrudDelete: ComponentType<CrudDeleteProps>;
  // Field wrappers
  FieldWrapper: ComponentType<FieldWrapperProps>;
  DetailFieldWrapper: ComponentType<DetailFieldWrapperProps>;
}
