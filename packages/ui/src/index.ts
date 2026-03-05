import "./locales";

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
  BooleanBadge,
  Button,
  buttonVariants,
  Calendar,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  NumberInput,
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
  SettingSwitch,
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
  Map,
  MapAutoFit,
  MapBoundsOverlay,
  MapControls,
  MapMarker,
  MapNavigator,
  MapPinContainer,
  MapProvider,
  useMap,
  useMapDefaults,
  useMapNavigator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./base";
export type {
  MapAutoFitProps,
  MapBoundsOverlayProps,
  MapProps,
  MapControlsProps,
  MapMarkerProps,
  MapNavigatorProps,
  MapPinContainerProps,
  MapProviderProps,
  MapRef,
  MapContextValue,
  UseMapNavigatorOptions,
  UseMapNavigatorResult,
  BadgeProps,
  BadgeVariants,
  BooleanBadgeProps,
  ButtonProps,
  ButtonVariants,
  CalendarProps,
  DateRange,
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
  NumberInputProps,
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
  SettingSwitchProps,
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
  ReorderConfig,
  SortState,
} from "./crud/shared";

// CRUD layout components
export { adaptOrvalList, CardList, CrudList, useCrudList, useKeyboardNav, useMediaQuery } from "./crud/list";
export type {
  ActionType,
  ActionVariant,
  CardListProps,
  CrudListFilters,
  CrudListPagination,
  CrudListSelection,
  CrudListSort,
  ListBulkActionProps,
  ListBulkActionsProps,
  ListColumnProps,
  ListEmptyProps,
  ListHook,
  ListHookResult,
  ListPaginationProps,
  ListProps,
  ListSearchProps,
  ListTableProps,
  ListToolbarProps,
  RowActionDef,
  UseKeyboardNavOptions,
  UseCrudListOptions,
  UseCrudListResult,
} from "./crud/list";

export { CrudForm, useAutosave, useBeforeUnload, useCrudFormSubmit, useIsDirty, useUnsavedChanges, Wizard } from "./crud/form";
export { adaptOrvalCreate, adaptOrvalDelete, adaptOrvalOrder, adaptOrvalUpdate, useInvalidateEntity } from "./crud/form";
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
  UseUnsavedChangesOptions,
  UseUnsavedChangesReturn,
  WizardProps,
  WizardStepProps,
} from "./crud/form";

// Tree
export { CrudTree, useTreeExpansion, TreeReorderDialog, TreeMoveDialog, getSiblings } from "./crud/tree";
export type {
  TreeConfig,
  TreeReorderConfig,
  TreeMoveConfig,
  TreeNodeMetadata,
  TreeProps,
  TreeToolbarProps,
  TreeSearchProps,
  TreeTableProps,
  TreeEmptyProps,
  UseTreeExpansionResult,
  TreeReorderDialogProps,
  TreeMoveDialogProps,
} from "./crud/tree";

// Tree field
export { TreeSelectField } from "./fields/form/tree-select-field";
export type { TreeSelectFieldProps } from "./fields/form/tree-select-field";

export { CrudDetail, usePreviousData } from "./crud/detail";
export type {
  CrudDetailActionsProps,
  CrudDetailDefaultActionsProps,
  CrudDetailProps,
  CrudDetailSectionProps,
  CrudDetailVariant,
} from "./crud/detail";

// Filters
export {
  SearchOperator,
  type DateRange as FilterDateRange,
  dateOperatorConfig,
  selectOperatorConfig,
  textOperatorOrder,
  numberOperatorOrder,
  operatorConfig,
  type OperatorMeta,
  makeFilterKey,
  parseFilterKey,
  getFilterLayout,
  insertFilterSeparators,
} from "./crud/filters";

// Filter components
export {
  TextFilter,
  MultiTextFilter,
  AdvancedTextFilter,
  UnifiedTextFilter,
  NumberFilter,
  DateFilter,
  DateRangeFilter,
  FacetedFilter,
  AdvancedSelectFilter,
  ToggleFilter,
  FilterActions,
  FilterBar,
} from "./crud/filters";

export type {
  TextFilterProps,
  MultiTextFilterProps,
  MultiTextFilterField,
  AdvancedTextFilterProps,
  UnifiedTextFilterProps,
  UnifiedTextFilterField,
  NumberFilterProps,
  DateFilterProps,
  DateRangeFilterProps,
  FacetedFilterProps,
  FacetedFilterOption,
  AdvancedSelectFilterProps,
  AdvancedSelectFilterOption,
  ToggleFilterProps,
  FilterActionsProps,
  FilterBarProps,
  FilterDef,
  TextFilterDef,
  NumberFilterDef,
  FacetedFilterDef,
  ToggleFilterDef,
  DateRangeFilterDef,
  CountryFilterDef,
  TimezoneFilterDef,
} from "./crud/filters";

// CRUD delete confirmation
export { CrudDelete } from "./crud/delete";
export type { CrudDeleteProps } from "./crud/delete";
export {
  useCrudDeleteDetail,
  useCrudDeleteList,
  useCrudDeleteWired,
} from "./crud/delete";
export type {
  CrudDeleteWiredLabels,
  DeleteTarget,
  UseCrudDeleteDetailResult,
  UseCrudDeleteListResult,
  UseCrudDeleteWiredOptions,
  UseCrudDeleteWiredResult,
} from "./crud/delete";

// CRUD error boundary
export { CrudErrorBoundary } from "./crud/shared";
export type { CrudErrorBoundaryProps, ErrorBoundaryState } from "./crud/shared";
export type { ColumnInfo } from "./crud/shared";

// Confirm dialog
export { ConfirmDialog } from "./crud/shared";
export type { ConfirmDialogProps } from "./crud/shared";

// Query fallback
export { QueryFallback } from "./crud/shared";
export type { QueryFallbackProps } from "./crud/shared";

// Icons (selective re-export for consumer use)
export { ArrowLeftIcon } from "./crud/shared/icons";

// Field components
export { DetailFields, DetailFieldWrapper, FieldWrapper, FormFields } from "./fields";
export type { DetailFieldWrapperProps, FieldWrapperProps } from "./fields";

// Router adapters
export { CrudProvider, createReactRouterAdapter, RouterContext, useRouter } from "./adapters";
export type { CrudProviderProps, ReactRouterHooks, RouterAdapter } from "./adapters";

// CRUD patterns
export { ListDetail, ListDetailRoot, ListDetailViewSwitch, useCrudNavigation, useCrudPageState, useFadeTransition, useListDetailState, validateCrudSearch, parseCrudSearch, buildCrudSearch } from "./crud/patterns";
export type {
  CrudSearch,
  CrudView,
  DetailView,
  ListDetailContextValue,
  ListDetailPanelProps,
  ListDetailProps,
  ListDetailVariant,
  ListDetailViewSwitchProps,
  UseCrudNavigationResult,
  UseCrudPageStateResult,
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

// Layout
export { EditorFooter } from "./layout/editor-footer";
export type { EditorFooterProps } from "./layout/editor-footer";
export { PageHeaderProvider, usePageHeader, usePageHeaderState } from "./layout/page-header";
export type { PageHeaderState } from "./layout/page-header";
export { PanelHeader } from "./layout/panel-header";
export type { PanelHeaderProps } from "./layout/panel-header";

// Map utilities
export { useMapPageData } from "./map/use-map-page-data";

// Geo utilities
export { isValidCoord, computeBounds, fitMapToBounds, DEFAULT_MAP_FIT_OPTIONS, toRad, haversineDistance, destinationPoint, geoCircle, computeBoundingCircle } from "./utils/geo";
export type { Bounds, GeoPoint, HasCoords, MapFitOptions, WithValidCoords } from "./utils/geo";

// Utilities
export { cn, toTestId } from "./utils/cn";
export { parseDate } from "./utils/parse-date";
export type { DateLike } from "./utils/parse-date";
export { sanitizeHtml } from "./utils/sanitize";
export { countryFromTimezone } from "./utils/timezone-country-map";
export { useCountryOptions } from "./utils/use-country-options";
export type { CountryOption } from "./utils/use-country-options";
export { useTimezoneOptions } from "./utils/use-timezone-options";
export type { TimezoneOption } from "./utils/use-timezone-options";
