import {
  BadgeBase,
  ButtonBase,
  CalendarBase,
  CheckboxBase,
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
  InputBase,
  LabelBase,
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
  SkeletonBase,
  SwitchBase,
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
  TextareaBase,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../base";
import { CrudDelete } from "../crud/delete";
import { QueryFallback } from "../crud/shared";
import { SectionShell } from "../crud/shared/section-shell";
import { DetailFieldWrapper, FieldWrapper } from "../fields";
import { CardBase, FlexBase, GridBase, HeadingBase, StackBase, TextBase } from "../primitives";
import type { UIComponents } from "./types";

/**
 * The raw default implementations behind every overridable component.
 *
 * Layout primitives map to their `*Base` form (which never reads
 * {@link UIComponentContext}). This is the single fallback used by the resolver
 * and by self-resolving wrappers, and the value handed to {@link createOverrides}
 * factories — so `withOverride(base)` wraps the non-resolving `*Base` and can
 * never re-enter the resolver, making override recursion structurally impossible.
 *
 * Compound entries are plain objects of components; the resolver detects them by
 * shape (a plain object with no `$$typeof`) and deep-merges partial overrides so
 * sibling sub-components are preserved.
 */
export const baseComponents: UIComponents = {
  // Base leaves → *Base (recursion-safe; the self-resolving wrappers are the
  // public exports, but the registry must hold the non-resolving base).
  Input: InputBase,
  Textarea: TextareaBase,
  Label: LabelBase,
  Switch: SwitchBase,
  Checkbox: CheckboxBase,
  Badge: BadgeBase,
  Calendar: CalendarBase,
  Button: ButtonBase,
  Skeleton: SkeletonBase,
  // Compound base groups
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
  // Primitives → *Base (recursion-safe; these never read UIComponentContext)
  Stack: StackBase,
  Flex: FlexBase,
  Grid: GridBase,
  Heading: HeadingBase,
  Text: TextBase,
  Card: CardBase,
  // CRUD building blocks
  SectionShell,
  QueryFallback,
  CrudDelete,
  // Field wrappers
  FieldWrapper,
  DetailFieldWrapper,
};
