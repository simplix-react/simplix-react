// Layout primitives
export {
  Card,
  cardVariants,
  Container,
  containerVariants,
  Flex,
  Grid,
  gridVariants,
  Heading,
  headingVariants,
  Section,
  Stack,
  stackVariants,
  Text,
  textVariants,
} from "./primitives";
export type {
  CardProps,
  CardTag,
  CardVariants,
  ContainerProps,
  ContainerVariants,
  FlexProps,
  GridProps,
  GridVariants,
  HeadingProps,
  HeadingTag,
  HeadingVariants,
  SectionProps,
  StackProps,
  StackVariants,
  TextProps,
  TextTag,
  TextVariants,
} from "./primitives";

// Base components
export {
  Badge,
  badgeVariants,
  Button,
  buttonVariants,
  Calendar,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./base";
export type {
  BadgeProps,
  BadgeVariants,
  ButtonProps,
  ButtonVariants,
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
  NavigationMenuContentProps,
  NavigationMenuIndicatorProps,
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
  PopoverContentProps,
  RadioGroupItemProps,
  RadioGroupProps,
  SelectContentProps,
  SelectItemProps,
  SelectLabelProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SeparatorProps,
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableFooterProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetTitleProps,
  SkeletonProps,
  SwitchProps,
  TabsContentProps,
  TabsListProps,
  TabsTriggerProps,
  TextareaProps,
  TooltipContentProps,
  TooltipProviderProps,
} from "./base";

// Provider
export { UIComponentContext, UIProvider, useUIComponents } from "./provider";
export type {
  RadioGroupComponents,
  SelectComponents,
  UIComponents,
  UIProviderProps,
} from "./provider";

// CRUD types
export {
  FieldVariantContext,
  useFieldVariant,
} from "./crud/shared";
export type {
  CommonDetailFieldProps,
  CommonFieldProps,
  EmptyReason,
  FieldVariant,
  FilterState,
  PaginationState,
  SortState,
} from "./crud/shared";

// CRUD layout components
export { CardList, CrudList, useCrudList, useKeyboardNav, useMediaQuery } from "./crud/list";
export type {
  CardListProps,
  CrudListFilters,
  CrudListPagination,
  CrudListSelection,
  CrudListSort,
  ListActionProps,
  ListBulkActionProps,
  ListBulkActionsProps,
  ListColumnProps,
  ListEmptyProps,
  ListFilterOption,
  ListFilterProps,
  ListHook,
  ListHookResult,
  ListPaginationProps,
  ListProps,
  ListRowActionsProps,
  ListSearchProps,
  ListTableProps,
  ListToolbarProps,
  UseKeyboardNavOptions,
  UseCrudListOptions,
  UseCrudListResult,
} from "./crud/list";

export { CrudForm, useAutosave, useCrudFormSubmit, Wizard } from "./crud/form";
export type {
  AutosaveStatus,
  CrudFormActionsProps,
  CrudFormProps,
  CrudFormSectionProps,
  CrudMutation,
  UseAutosaveOptions,
  UseAutosaveReturn,
  UseCrudFormSubmitOptions,
  UseCrudFormSubmitResult,
  WizardProps,
  WizardStepProps,
} from "./crud/form";

export { CrudDetail, usePreviousData } from "./crud/detail";
export type {
  CrudDetailActionsProps,
  CrudDetailDefaultActionsProps,
  CrudDetailProps,
  CrudDetailSectionProps,
} from "./crud/detail";

// CRUD delete confirmation
export { CrudDelete } from "./crud/delete";
export type { CrudDeleteProps } from "./crud/delete";
export {
  useCrudDeleteDetail,
  useCrudDeleteList,
} from "./crud/delete";
export type {
  DeleteTarget,
  UseCrudDeleteDetailResult,
  UseCrudDeleteListResult,
} from "./crud/delete";

// CRUD error boundary
export { CrudErrorBoundary } from "./crud/shared";
export type { CrudErrorBoundaryProps, ErrorBoundaryState } from "./crud/shared";

// Query fallback
export { QueryFallback } from "./crud/shared";
export type { QueryFallbackProps } from "./crud/shared";

// Field components
export { DetailFields, DetailFieldWrapper, FieldWrapper, FormFields } from "./fields";
export type { DetailFieldWrapperProps, FieldWrapperProps } from "./fields";

// Router adapters
export { CrudProvider, createReactRouterAdapter, RouterContext, useRouter } from "./adapters";
export type { CrudProviderProps, ReactRouterHooks, RouterAdapter } from "./adapters";

// CRUD patterns
export { ListDetail, ListDetailRoot, useFadeTransition, useListDetailState } from "./crud/patterns";
export type {
  DetailView,
  ListDetailContextValue,
  ListDetailPanelProps,
  ListDetailProps,
  ListDetailVariant,
  ListWidth,
  UseFadeTransitionOptions,
  UseFadeTransitionResult,
  UseListDetailStateOptions,
  UseListDetailStateResult,
} from "./crud/patterns";

// CRUD list hooks
export { useUrlSync } from "./crud/list/use-url-sync";
export type { UseUrlSyncOptions } from "./crud/list/use-url-sync";
export { useVirtualList } from "./crud/list/use-virtual";
export type { UseVirtualListOptions } from "./crud/list/use-virtual";

// Utilities
export { cn, toTestId } from "./utils/cn";
export { sanitizeHtml } from "./utils/sanitize";
