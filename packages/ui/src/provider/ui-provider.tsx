import { type ReactNode, useContext, useMemo } from "react";

import { StatusToneContext, type StatusToneOverrides } from "../base/status-tone-context";
import { baseComponents } from "./base-components";
import type { UIComponents } from "./types";
import { UIComponentContext } from "./ui-component-context";

/**
 * Detects a compound component group from the DEFAULT's shape.
 *
 * A compound group is a plain object whose values are components. A leaf is a
 * single component — a function, or a `forwardRef`/`memo` exotic which is an
 * object carrying a `$$typeof` symbol. We therefore treat as compound any
 * non-null object that does NOT carry `$$typeof`. Detecting from the default
 * (not the override) lets a partial compound override be a plain object while a
 * leaf override stays a component, with no ambiguity.
 */
function isCompound(value: unknown): boolean {
  return (
    value != null &&
    typeof value === "object" &&
    !("$$typeof" in (value as object))
  );
}

/** Props for the {@link UIProvider} component. */
export interface UIProviderProps {
  /** Partial overrides for default base and primitive components. */
  overrides?: Partial<UIComponents>;
  /**
   * Per-tone, per-slot class overrides for the status/severity palette
   * (success/warning/danger/…). Status tones are palette-literal, so this is
   * the channel for globally retoning status colors without forking components.
   */
  statusTones?: StatusToneOverrides;
  children: ReactNode;
}

/**
 * Provides overridable base component implementations to the component tree.
 * Supports nesting for scoped overrides.
 *
 * @example
 * ```tsx
 * <UIProvider overrides={{ Button: MyButton }} statusTones={{ success: { badge: "bg-teal-100 text-teal-800" } }}>
 *   <App />
 * </UIProvider>
 * ```
 */
export function UIProvider({ overrides, statusTones, children }: UIProviderProps) {
  const parent = useContext(UIComponentContext);
  const parentTones = useContext(StatusToneContext);

  const merged = useMemo(
    () => ({ ...parent, ...overrides }),
    [parent, overrides],
  );

  const mergedTones = useMemo(
    () => (statusTones ? { ...parentTones, ...statusTones } : parentTones),
    [parentTones, statusTones],
  );

  return (
    <UIComponentContext.Provider value={merged}>
      <StatusToneContext.Provider value={mergedTones}>
        {children}
      </StatusToneContext.Provider>
    </UIComponentContext.Provider>
  );
}

/**
 * Returns the resolved set of UI base components, merging defaults with
 * any overrides provided by ancestor {@link UIProvider} instances.
 *
 * Leaf overrides replace the default outright; partial compound overrides are
 * deep-merged so sibling sub-components are preserved.
 */
export function useUIComponents(): UIComponents {
  const overrides = useContext(UIComponentContext);

  return useMemo(() => {
    // Shallow merge resolves every leaf (override wins when present).
    const result = { ...baseComponents, ...overrides } as UIComponents;

    // Re-merge compound groups deeply so a partial override keeps its siblings.
    for (const key of Object.keys(baseComponents) as (keyof UIComponents)[]) {
      const base = baseComponents[key];
      if (!isCompound(base)) continue;
      const override = overrides[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- compound groups are merged by shape
      (result as any)[key] = override ? { ...(base as any), ...(override as any) } : base;
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
    Stack: ui.Stack,
    Flex: ui.Flex,
    Grid: ui.Grid,
    Heading: ui.Heading,
    Text: ui.Text,
    Card: ui.Card,
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
 * The factory receives the raw `*Base` implementations, so
 * `withOverride(defaults.Button, …)` wraps the non-resolving base and never
 * re-enters the resolver.
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
  return factory(baseComponents);
}
