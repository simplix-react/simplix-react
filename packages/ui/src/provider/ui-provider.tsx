import { type ReactNode, useContext, useMemo } from "react";

import {
  Badge,
  Button,
  Calendar,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../base";
import { CrudDelete } from "../crud/delete";
import { QueryFallback } from "../crud/shared";
import { SectionShell } from "../crud/shared/section-shell";
import { DetailFieldWrapper, FieldWrapper } from "../fields";
import { Card, Container, Flex, Grid, Heading, Section, Stack, Text } from "../primitives";
import type { UIComponents } from "./types";
import { UIComponentContext } from "./ui-component-context";

const defaultComponents: UIComponents = {
  // Base
  Input,
  Textarea,
  Label,
  Switch,
  Checkbox,
  Badge,
  Calendar,
  Button,
  Skeleton,
  // Compound base
  Select: { Root: Select, Trigger: SelectTrigger, Value: SelectValue, Content: SelectContent, Item: SelectItem },
  RadioGroup: { Root: RadioGroup, Item: RadioGroupItem },
  Dialog: { Root: Dialog, Trigger: DialogTrigger, Content: DialogContent, Header: DialogHeader, Footer: DialogFooter, Title: DialogTitle, Description: DialogDescription, Overlay: DialogOverlay, Close: DialogClose },
  Sheet: { Root: Sheet, Trigger: SheetTrigger, Content: SheetContent, Header: SheetHeader, Footer: SheetFooter, Title: SheetTitle, Description: SheetDescription, Close: SheetClose },
  Popover: { Root: Popover, Trigger: PopoverTrigger, Content: PopoverContent },
  Tooltip: { Provider: TooltipProvider, Root: Tooltip, Trigger: TooltipTrigger, Content: TooltipContent },
  DropdownMenu: { Root: DropdownMenu, Trigger: DropdownMenuTrigger, Content: DropdownMenuContent, Item: DropdownMenuItem, CheckboxItem: DropdownMenuCheckboxItem, RadioItem: DropdownMenuRadioItem, Label: DropdownMenuLabel, Separator: DropdownMenuSeparator, Group: DropdownMenuGroup, RadioGroup: DropdownMenuRadioGroup, Sub: DropdownMenuSub, SubTrigger: DropdownMenuSubTrigger, SubContent: DropdownMenuSubContent },
  Tabs: { Root: Tabs, List: TabsList, Trigger: TabsTrigger, Content: TabsContent },
  Command: { Root: Command, Input: CommandInput, List: CommandList, Empty: CommandEmpty, Group: CommandGroup, Item: CommandItem, Separator: CommandSeparator },
  Table: { Root: Table, Header: TableHeader, Body: TableBody, Row: TableRow, Head: TableHead, Cell: TableCell },
  // Primitives
  Container,
  Stack,
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  Section,
  // CRUD
  SectionShell,
  QueryFallback,
  CrudDelete,
  // Field wrappers
  FieldWrapper,
  DetailFieldWrapper,
};

/** Compound component keys that need deep merge. */
const COMPOUND_KEYS = [
  "Select", "RadioGroup", "Dialog", "Sheet", "Popover",
  "Tooltip", "DropdownMenu", "Tabs", "Command", "Table",
] as const;

/** Props for the {@link UIProvider} component. */
export interface UIProviderProps {
  /** Partial overrides for default base and primitive components. */
  overrides?: Partial<UIComponents>;
  children: ReactNode;
}

/**
 * Provides overridable base component implementations to the component tree.
 * Supports nesting for scoped overrides.
 *
 * @example
 * ```tsx
 * <UIProvider overrides={{ Button: MyButton, SectionShell: MySectionShell }}>
 *   <App />
 * </UIProvider>
 * ```
 */
export function UIProvider({ overrides, children }: UIProviderProps) {
  const parent = useContext(UIComponentContext);

  const merged = useMemo(
    () => ({ ...parent, ...overrides }),
    [parent, overrides],
  );

  return (
    <UIComponentContext.Provider value={merged}>
      {children}
    </UIComponentContext.Provider>
  );
}

/**
 * Returns the resolved set of UI base components, merging defaults with
 * any overrides provided by ancestor {@link UIProvider} instances.
 */
export function useUIComponents(): UIComponents {
  const overrides = useContext(UIComponentContext);

  return useMemo(() => {
    const result = { ...defaultComponents, ...overrides };

    // Deep merge compound component groups
    for (const key of COMPOUND_KEYS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const defaults = (defaultComponents as any)[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const override = (overrides as any)[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = override
        ? { ...defaults, ...override }
        : defaults;
    }

    return result;
  }, [overrides]);
}

/**
 * Flat-destructuring variant of {@link useUIComponents}.
 *
 * Returns all overridable components — including compound sub-components —
 * with the same names used in direct base imports (e.g. `Table`, `TableRow`).
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const { Button, Table, TableHeader, TableRow, TableCell } = useFlatUIComponents();
 *   return <Table>...</Table>;
 * }
 * ```
 */
export function useFlatUIComponents() {
  const ui = useUIComponents();

  return useMemo(() => ({
    // Simple base
    Input: ui.Input,
    Textarea: ui.Textarea,
    Label: ui.Label,
    Switch: ui.Switch,
    Checkbox: ui.Checkbox,
    Badge: ui.Badge,
    Calendar: ui.Calendar,
    Button: ui.Button,
    Skeleton: ui.Skeleton,
    // Select
    Select: ui.Select.Root,
    SelectTrigger: ui.Select.Trigger,
    SelectValue: ui.Select.Value,
    SelectContent: ui.Select.Content,
    SelectItem: ui.Select.Item,
    // RadioGroup
    RadioGroup: ui.RadioGroup.Root,
    RadioGroupItem: ui.RadioGroup.Item,
    // Dialog
    Dialog: ui.Dialog.Root,
    DialogTrigger: ui.Dialog.Trigger,
    DialogContent: ui.Dialog.Content,
    DialogHeader: ui.Dialog.Header,
    DialogFooter: ui.Dialog.Footer,
    DialogTitle: ui.Dialog.Title,
    DialogDescription: ui.Dialog.Description,
    DialogOverlay: ui.Dialog.Overlay,
    DialogClose: ui.Dialog.Close,
    // Sheet
    Sheet: ui.Sheet.Root,
    SheetTrigger: ui.Sheet.Trigger,
    SheetContent: ui.Sheet.Content,
    SheetHeader: ui.Sheet.Header,
    SheetFooter: ui.Sheet.Footer,
    SheetTitle: ui.Sheet.Title,
    SheetDescription: ui.Sheet.Description,
    SheetClose: ui.Sheet.Close,
    // Popover
    Popover: ui.Popover.Root,
    PopoverTrigger: ui.Popover.Trigger,
    PopoverContent: ui.Popover.Content,
    // Tooltip
    TooltipProvider: ui.Tooltip.Provider,
    Tooltip: ui.Tooltip.Root,
    TooltipTrigger: ui.Tooltip.Trigger,
    TooltipContent: ui.Tooltip.Content,
    // DropdownMenu
    DropdownMenu: ui.DropdownMenu.Root,
    DropdownMenuTrigger: ui.DropdownMenu.Trigger,
    DropdownMenuContent: ui.DropdownMenu.Content,
    DropdownMenuItem: ui.DropdownMenu.Item,
    DropdownMenuCheckboxItem: ui.DropdownMenu.CheckboxItem,
    DropdownMenuRadioItem: ui.DropdownMenu.RadioItem,
    DropdownMenuLabel: ui.DropdownMenu.Label,
    DropdownMenuSeparator: ui.DropdownMenu.Separator,
    DropdownMenuGroup: ui.DropdownMenu.Group,
    DropdownMenuRadioGroup: ui.DropdownMenu.RadioGroup,
    DropdownMenuSub: ui.DropdownMenu.Sub,
    DropdownMenuSubTrigger: ui.DropdownMenu.SubTrigger,
    DropdownMenuSubContent: ui.DropdownMenu.SubContent,
    // Tabs
    Tabs: ui.Tabs.Root,
    TabsList: ui.Tabs.List,
    TabsTrigger: ui.Tabs.Trigger,
    TabsContent: ui.Tabs.Content,
    // Command
    Command: ui.Command.Root,
    CommandInput: ui.Command.Input,
    CommandList: ui.Command.List,
    CommandEmpty: ui.Command.Empty,
    CommandGroup: ui.Command.Group,
    CommandItem: ui.Command.Item,
    CommandSeparator: ui.Command.Separator,
    // Table
    Table: ui.Table.Root,
    TableHeader: ui.Table.Header,
    TableBody: ui.Table.Body,
    TableRow: ui.Table.Row,
    TableHead: ui.Table.Head,
    TableCell: ui.Table.Cell,
    // Primitives
    Container: ui.Container,
    Stack: ui.Stack,
    Flex: ui.Flex,
    Grid: ui.Grid,
    Heading: ui.Heading,
    Text: ui.Text,
    Card: ui.Card,
    Section: ui.Section,
    // CRUD building blocks
    SectionShell: ui.SectionShell,
    QueryFallback: ui.QueryFallback,
    CrudDelete: ui.CrudDelete,
    FieldWrapper: ui.FieldWrapper,
    DetailFieldWrapper: ui.DetailFieldWrapper,
  }), [ui]);
}

/**
 * Creates a type-safe override map, optionally wrapping/extending defaults.
 *
 * @example
 * ```tsx
 * const overrides = createOverrides((defaults) => ({
 *   Button: withOverride(defaults.Button, { className: "rounded-full" }),
 *   Dialog: { Content: MyDialogContent },
 * }));
 *
 * <UIProvider overrides={overrides}><App /></UIProvider>
 * ```
 */
export function createOverrides(
  factory: (defaults: UIComponents) => Partial<UIComponents>,
): Partial<UIComponents> {
  return factory(defaultComponents);
}
