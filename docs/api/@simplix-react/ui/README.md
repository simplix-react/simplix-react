[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/ui

# @simplix-react/ui

CRUD scaffolding UI components with explicit field components and compound patterns.

## Overview

`@simplix-react/ui` provides a headless-friendly, Tailwind CSS-based component library for building CRUD interfaces. Every component follows the **No Magic** principle: explicit `value`/`onChange` props, no hidden state, and full control at every level.

## Quick Start

```tsx
import {
  UIProvider,
  CrudForm,
  FormFields,
  CrudDetail,
  DetailFields,
  List,
  useCrudList,
} from "@simplix-react/ui";

function App() {
  return (
    <UIProvider>
      {/* Your CRUD pages */}
    </UIProvider>
  );
}
```

## App Architecture (FSD)

simplix-react apps follow **Feature-Sliced Design (FSD)** — UI code lives in **modules**, not in domain packages:

```
my-app/
├── packages/                     Domain packages (generated) — NO UI code
│   ├── user/
│   │   ├── schemas.ts                Zod schemas
│   │   ├── contract.ts               API contracts
│   │   ├── hooks.ts                  React Query hooks
│   │   └── form-hooks.ts             TanStack Form hooks
│   └── product/
│       └── ...
│
├── modules/                      FSD modules — compose domain packages + @simplix-react/ui
│   └── myapp-admin/
│       └── src/
│           ├── manifest.ts           Module manifest (navigation, capabilities)
│           ├── index.ts              Root exports
│           ├── features/             Feature layer — CRUD screens
│           │   ├── user/                 uses @myapp/user hooks
│           │   │   ├── user-list.tsx
│           │   │   ├── user-form.tsx
│           │   │   ├── user-detail.tsx
│           │   │   └── index.ts
│           │   └── product/              uses @myapp/product hooks
│           │       └── ...
│           ├── widgets/              Widget layer — compose multiple features
│           │   └── dashboard/
│           ├── shared/               Shared layer
│           │   ├── ui/
│           │   ├── lib/
│           │   └── config/
│           └── locales/              i18n (optional)
│
└── app/                          Final app — composes modules only
    └── src/
        ├── features/
        ├── widgets/
        └── shared/
```

### FSD Layer Rules

| Layer | Can import from | Cannot import from |
| --- | --- | --- |
| `shared/` | external packages only | `features/`, `widgets/` |
| `features/` | `shared/`, domain packages | `widgets/` |
| `widgets/` | `shared/`, `features/`, domain packages | — |

### Module can compose multiple domain packages

A single module can contain CRUD features from **different** domain packages:

```tsx
// modules/myapp-admin/src/features/user/user-list.tsx
import { useUserHooks } from "@myapp/user";   // domain package A

// modules/myapp-admin/src/features/product/product-list.tsx
import { useProductHooks } from "@myapp/product"; // domain package B
```

### CLI Scaffold

```bash
# Generate CRUD feature into a module's features/ layer
simplix scaffold user --module myapp-admin

# Output: modules/myapp-admin/src/features/user/
#   user-list.tsx, user-form.tsx, user-detail.tsx, index.ts
```

## Design Principles

### No Magic

Every field component requires explicit `value` and `onChange` props. There is no hidden form state, no automatic binding, and no implicit context dependencies.

```tsx
// Explicit value/onChange — always
<FormFields.TextField
  label="Name"
  value={name}
  onChange={setName}
  required
/>
```

### Compound Components

CRUD layouts (List, CrudForm, CrudDetail) use the compound component pattern. Assemble only what you need:

```tsx
<List>
  <List.Toolbar>
    <List.Search value={search} onChange={setSearch} />
  </List.Toolbar>
  <List.Table data={items} sort={sort} onSortChange={setSort}>
    <List.Column field="name" header="Name" sortable />
    <List.Column field="status" header="Status" display="badge" />
  </List.Table>
  <List.Pagination page={1} pageSize={10} total={100} totalPages={10} onPageChange={setPage} />
</List>
```

### Component Override Strategy

5 levels of customization, from least to most effort:

| Level | Method | Scope |
| --- | --- | --- |
| 1 | `className` prop | Single instance |
| 2 | CVA variants (`variant`, `size`) | Variant-level |
| 3 | `FieldVariantContext` | Section/page-wide field styling |
| 4 | `UIProvider` overrides | App-wide component replacement |
| 5 | Custom component | Full replacement |

```tsx
// Level 4: Replace Input globally via UIProvider
import { MyCustomInput } from "./my-input";

<UIProvider overrides={{ Input: MyCustomInput }}>
  {/* All TextField components now use MyCustomInput */}
</UIProvider>
```

## API Reference

### Layout Primitives

Semantic layout components built with CVA variants.

| Component | Description | Key Props |
| --- | --- | --- |
| `Stack` | Vertical/horizontal flex layout | `direction`, `gap`, `align`, `justify`, `wrap` |
| `Flex` | Horizontal flex (alias for `Stack direction="row"`) | Same as Stack |
| `Grid` | CSS Grid layout | `columns` (1-6), `gap` |
| `Container` | Centered max-width wrapper | `size` (sm/md/lg/xl/full) |
| `Section` | Content section with title/description | `title`, `description` |
| `Card` | Card container with border and shadow | `padding` (none/sm/md/lg), `interactive` |
| `Heading` | Semantic heading (h1-h6) | `level` (1-6), `tone`, `font` (sans/display/mono) |
| `Text` | Body text with typography scale | `size` (lg/base/sm/caption), `tone`, `font` (sans/display/mono) |

```tsx
<Stack gap="lg">
  <Section title="User Info" description="Basic information">
    <Grid columns={2} gap="md">
      <FormFields.TextField label="First Name" value={first} onChange={setFirst} />
      <FormFields.TextField label="Last Name" value={last} onChange={setLast} />
    </Grid>
  </Section>
</Stack>
```

### Base Components

Unstyled Radix UI primitives with Tailwind CSS styling. Used internally by field components and available for direct use.

- `Button` (with CVA variants: `variant`, `size`)
- `Input`, `Textarea`, `Label`, `Badge`, `Switch`, `Checkbox`
- `Select` (Root, Trigger, Value, Content, Item, Group, Label, Separator)
- `RadioGroup` (Root, Item)
- `Calendar` (date picker grid)
- `Popover` (Root, Trigger, Content, Anchor)
- `Dialog` (Root, Trigger, Content, Header, Footer, Title, Description, Close)
- `DropdownMenu` (Root, Trigger, Content, Item, CheckboxItem, RadioItem, RadioGroup, Label, Separator, Sub, SubTrigger, SubContent, Group)
- `Sheet` (Root, Trigger, Content, Header, Footer, Title, Description, Close)
- `Table` (Root, Header, Body, Footer, Head, Row, Cell, Caption)
- `Tabs` (Root, List, Trigger, Content)
- `Tooltip` (Provider, Root, Trigger, Content)
- `NavigationMenu` (Root, List, Item, Trigger, Content, Link, Viewport, Indicator)
- `Separator`
- `Skeleton`

### Form Field Components

All form fields follow the same pattern: `value` + `onChange` + common field props (label, error, description, required, disabled, className).

```tsx
import { FormFields } from "@simplix-react/ui";
```

| Component | Value Type | Key Props |
| --- | --- | --- |
| `FormFields.TextField` | `string` | `type` (text/email/url/password/tel), `placeholder`, `maxLength` |
| `FormFields.TextareaField` | `string` | `rows`, `maxLength`, `resize` (none/vertical/both) |
| `FormFields.NumberField` | `number \| null` | `min`, `max`, `step`, `placeholder` |
| `FormFields.SelectField` | `string` | `options` (label/value pairs), `placeholder` |
| `FormFields.SwitchField` | `boolean` | `switchProps` |
| `FormFields.CheckboxField` | `boolean` | `checkboxProps` |
| `FormFields.RadioGroupField` | `string` | `options` (label/value/description), `direction` |
| `FormFields.DateField` | `Date \| null` | `minDate`, `maxDate`, `format`, `placeholder` |
| `FormFields.ComboboxField` | `string \| null` | `options`, `onSearch`, `loading`, `emptyMessage` |
| `FormFields.PasswordField` | `string` | `placeholder`, `maxLength` (with visibility toggle) |
| `FormFields.ColorField` | `string` (hex) | Native color picker + hex text input |
| `FormFields.SliderField` | `number` | `min`, `max`, `step`, `showValue` |
| `FormFields.MultiSelectField` | `string[]` | `options`, `placeholder`, `maxCount` |
| `FormFields.Field` | `ReactNode` (children) | Generic wrapper for custom content |

```tsx
<FormFields.SelectField
  label="Status"
  value={status}
  onChange={setStatus}
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]}
  required
  error={errors.status}
/>
```

### Detail Field Components

Read-only display fields with formatting capabilities.

```tsx
import { DetailFields } from "@simplix-react/ui";
```

| Component | Value Type | Key Props |
| --- | --- | --- |
| `DetailFields.DetailTextField` | `string \| null` | `fallback`, `copyable` |
| `DetailFields.DetailNumberField` | `number \| null` | `format` (decimal/currency/percent), `locale`, `currency` |
| `DetailFields.DetailDateField` | `Date \| string \| null` | `format` (date/datetime/relative), `fallback` |
| `DetailFields.DetailBadgeField` | `string` | `variants` (value-to-variant mapping) |
| `DetailFields.DetailLinkField` | `string` | `href`, `external` |
| `DetailFields.DetailBooleanField` | `boolean \| null` | `mode` (text/icon), `labels` |
| `DetailFields.DetailImageField` | `string \| null` (URL) | `alt`, `width`, `height`, `imageClassName` |
| `DetailFields.DetailListField` | `string[] \| null` | `mode` (badges/comma/bullet) |
| `DetailFields.DetailField` | `ReactNode` (children) | Generic wrapper for custom content |

```tsx
<DetailFields.DetailDateField
  label="Created At"
  value={user.createdAt}
  format="relative"
/>

<DetailFields.DetailBadgeField
  label="Status"
  value={user.status}
  variants={{ active: "success", inactive: "secondary", banned: "destructive" }}
/>
```

### Field Wrappers

Low-level wrappers used internally by `FormFields` and `DetailFields`. Export them to build custom field components.

| Component | Purpose | Key Props |
| --- | --- | --- |
| `FieldWrapper` | Wraps editable inputs with label, error, description | `label`, `error`, `description`, `required`, `disabled`, `labelPosition`, `size` |
| `DetailFieldWrapper` | Wraps read-only display values with label | `label`, `labelPosition`, `size` |

```tsx
import { FieldWrapper } from "@simplix-react/ui";

<FieldWrapper label="Custom Field" error={errors.custom} required>
  <MyCustomInput value={value} onChange={onChange} />
</FieldWrapper>
```

### Field Variant System

Control field label position and size across a section or page using context:

```tsx
import { FieldVariantContext } from "@simplix-react/ui";

// All fields inside will use left-aligned labels at small size
<FieldVariantContext.Provider value={{ labelPosition: "left", size: "sm" }}>
  <FormFields.TextField label="Name" value={name} onChange={setName} />
  <FormFields.TextField label="Email" value={email} onChange={setEmail} />
</FieldVariantContext.Provider>
```

Options:
- `labelPosition`: `"top"` (default) | `"left"` | `"hidden"` (sr-only for accessibility)
- `size`: `"sm"` | `"md"` (default) | `"lg"`

### CRUD Layout Components

#### List (Compound)

Full-featured data table with sorting, filtering, pagination, selection, and bulk actions.

```tsx
const { data, filters, sort, pagination, selection, emptyReason } = useCrudList(useUserList);

<List>
  <List.Toolbar>
    <List.Search value={filters.search} onChange={filters.setSearch} />
    <List.Filter
      label="Role"
      value={roleFilter}
      onChange={setRoleFilter}
      options={roleOptions}
    />
  </List.Toolbar>

  <List.BulkActions selectedCount={selection.selected.size} onClear={selection.clear}>
    <List.BulkAction label="Delete Selected" onClick={handleBulkDelete} variant="destructive" />
  </List.BulkActions>

  {emptyReason ? (
    <List.Empty reason={emptyReason} />
  ) : (
    <List.Table
      data={data}
      sort={{ field: sort.field!, direction: sort.direction }}
      onSortChange={(s) => sort.setSort(s.field, s.direction)}
      selectable
      selectedIndices={selection.selected}
      onSelectionChange={selection.toggle}
      onSelectAll={() => selection.toggleAll(data)}
      onRowClick={handleRowClick}
    >
      <List.Column field="name" header="Name" sortable />
      <List.Column field="email" header="Email" sortable />
      <List.Column field="status" header="Status" display="badge"
        variants={{ active: "success", inactive: "secondary" }} />
      <List.Column field="createdAt" header="Created" format="date" sortable />
    </List.Table>
  )}

  <List.Pagination
    page={pagination.page}
    pageSize={pagination.pageSize}
    total={pagination.total}
    totalPages={pagination.totalPages}
    onPageChange={pagination.setPage}
    onPageSizeChange={pagination.setPageSize}
  />
</List>
```

Sub-components: `List.Toolbar`, `List.Search`, `List.Filter`, `List.Table`, `List.Column`, `List.RowActions`, `List.Action`, `List.Pagination`, `List.BulkActions`, `List.BulkAction`, `List.Empty`

#### CardList

Mobile-friendly card-based layout alternative to table.

```tsx
<CardList
  data={items}
  columns={2}
  renderCard={(item, index) => (
    <div key={index} className="rounded-lg border p-4">
      <h3>{item.name}</h3>
    </div>
  )}
/>
```

#### CrudForm (Compound)

Form layout with sections and actions.

```tsx
<CrudForm
  onSubmit={handleSubmit}
  fieldVariant={{ labelPosition: "top", size: "md" }}
  warnOnUnsavedChanges
>
  <CrudForm.Section title="Basic Info" layout="two-column">
    <FormFields.TextField label="Name" value={name} onChange={setName} required />
    <FormFields.TextField label="Email" value={email} onChange={setEmail} type="email" />
  </CrudForm.Section>

  <CrudForm.Section title="Details" layout="single-column">
    <FormFields.TextareaField label="Bio" value={bio} onChange={setBio} />
  </CrudForm.Section>

  <CrudForm.Actions>
    <button type="button" onClick={onCancel}>Cancel</button>
    <button type="submit">Save</button>
  </CrudForm.Actions>
</CrudForm>
```

Sub-components: `CrudForm.Section` (with `layout`: single-column/two-column/three-column), `CrudForm.Actions`

#### CrudDetail (Compound)

Read-only detail view layout.

```tsx
<CrudDetail fieldVariant={{ labelPosition: "left" }}>
  <CrudDetail.Section title="User Info">
    <DetailFields.DetailTextField label="Name" value={user.name} copyable />
    <DetailFields.DetailDateField label="Joined" value={user.createdAt} format="relative" />
    <DetailFields.DetailBadgeField
      label="Status"
      value={user.status}
      variants={{ active: "success", inactive: "secondary" }}
    />
  </CrudDetail.Section>
  <CrudDetail.Actions>
    <button onClick={onEdit}>Edit</button>
    <button onClick={onDelete}>Delete</button>
  </CrudDetail.Actions>
</CrudDetail>
```

Sub-components: `CrudDetail.Section`, `CrudDetail.Actions`

#### CrudDelete

Confirmation dialog for delete operations using Radix AlertDialog.

```tsx
import { CrudDelete } from "@simplix-react/ui";

<CrudDelete
  open={showDelete}
  onOpenChange={setShowDelete}
  onConfirm={handleDelete}
  entityName="user"
  loading={isDeleting}
/>
```

Props: `open`, `onOpenChange`, `onConfirm`, `title`, `description`, `loading`, `entityName`

#### CrudErrorBoundary

Error boundary for catching render errors in CRUD components.

```tsx
import { CrudErrorBoundary } from "@simplix-react/ui";

<CrudErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
  onError={(error) => logError(error)}
>
  <UserList />
</CrudErrorBoundary>
```

Props: `children`, `fallback` (ReactNode or render function), `onError`

#### Wizard (Compound)

Multi-step form wizard with step indicator and validation.

```tsx
import { Wizard } from "@simplix-react/ui";

<Wizard onComplete={handleSubmit}>
  <Wizard.Step title="Basic Info" validate={validateStep1}>
    <FormFields.TextField label="Name" value={name} onChange={setName} />
  </Wizard.Step>
  <Wizard.Step title="Details">
    <FormFields.TextareaField label="Bio" value={bio} onChange={setBio} />
  </Wizard.Step>
  <Wizard.Step title="Review">
    <p>Confirm your details before submitting.</p>
  </Wizard.Step>
</Wizard>
```

Sub-components: `Wizard.Step` (with `title`, `description`, and optional async `validate` function)

### QueryFallback

Loading and not-found fallback guard for single-entity views.

```tsx
import { QueryFallback } from "@simplix-react/ui";

const { data, isLoading } = useGet(id);
if (isLoading || !data) return <QueryFallback isLoading={isLoading} notFoundMessage="Pet not found." />;
```

Props: `isLoading`, `notFoundMessage`, `loadingMessage`

### CRUD Hooks

#### useCrudFormSubmit

Handles create/update mutation dispatch for CRUD forms. Determines whether to create or update based on `entityId` presence.

```tsx
const { isEdit, handleSubmit, isPending } = useCrudFormSubmit<FormValues>({
  entityId,
  create: entityHooks.useCreate(),
  update: entityHooks.useUpdate(),
  onSuccess: () => navigate(-1),
});
```

Returns: `{ isEdit, handleSubmit, isPending }`

#### useCrudDeleteList

Manages delete-confirmation state for **list** views.

```tsx
const del = useCrudDeleteList();

// Trigger: del.requestDelete({ id: row.id, name: row.name })
<CrudDelete
  open={del.open}
  onOpenChange={(o) => { if (!o) del.cancel(); }}
  onConfirm={() => deleteMutation.mutate(del.target!.id)}
  entityName={del.target?.name}
/>
```

Returns: `{ open, target, requestDelete, cancel }`

#### useCrudDeleteDetail

Manages delete-confirmation state for **detail** views (single item).

```tsx
const del = useCrudDeleteDetail();

<button onClick={del.requestDelete}>Delete</button>
<CrudDelete open={del.open} onOpenChange={del.onOpenChange} onConfirm={handleDelete} />
```

Returns: `{ open, requestDelete, cancel, onOpenChange }`

#### usePreviousData

Retains previous query data during refetch to prevent layout flicker.

```tsx
const { data, isLoading } = useGet(id);
const stableData = usePreviousData(data);
```

#### useFadeTransition

CSS fade transition hook for view transitions (e.g., list-to-detail).

```tsx
const { isVisible, shouldRender } = useFadeTransition({
  show: !!selectedId,
  duration: 200,
});
```

Returns: `{ isVisible, shouldRender }`

#### useListDetailState

State management for the ListDetail pattern — tracks selected item and panel toggle.

```tsx
const { selectedId, select, deselect, isDetailOpen } = useListDetailState({
  onSelect: (id) => navigate(`/users/${id}`),
});
```

Returns: `{ selectedId, select, deselect, isDetailOpen }`

#### useCrudList

State management hook for list views with filtering, sorting, pagination, and selection.

```tsx
const result = useCrudList(useUserList, {
  stateMode: "server",      // "server" (API-driven) or "client" (local)
  defaultSort: { field: "name", direction: "asc" },
  defaultPageSize: 20,
});
```

Returns: `{ data, isLoading, error, filters, sort, pagination, selection, emptyReason }`

#### useUrlSync

Syncs list state (filters, sort, pagination) with URL query parameters.

```tsx
useUrlSync({
  filters: { search, values: filterValues },
  sort: sortState,
  pagination: { page, pageSize, total },
  setFilters,
  setSort,
  setPage,
});
```

#### useVirtualList

Virtual scrolling for large lists via `@tanstack/react-virtual`.

```tsx
const { virtualizer, virtualRows, totalHeight } = useVirtualList({
  count: data.length,
  estimateSize: () => 48,
  parentRef: scrollRef,
  overscan: 5,
});
```

#### useKeyboardNav

Keyboard navigation for list components (ArrowUp/Down, Enter, Space, Ctrl+K, Escape).

```tsx
const { containerRef } = useKeyboardNav({
  onNavigate: (dir) => { /* move focus up/down */ },
  onSelect: () => { /* select current item */ },
  onToggle: () => { /* toggle checkbox */ },
  onSearch: () => { /* focus search input */ },
  onEscape: () => { /* dismiss */ },
});
```

#### useMediaQuery

Responsive breakpoint detection via `matchMedia` API.

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");
```

#### useAutosave

Debounced autosave hook that watches form values for changes.

```tsx
const { status, lastSavedAt, isSaving } = useAutosave({
  values: formValues,
  onSave: async (values) => await api.saveDraft(values),
  debounceMs: 2000,
  hasErrors: form.hasErrors,
});
```

Returns: `{ status, lastSavedAt, isSaving }`

Status values: `"idle"` | `"saving"` | `"saved"` | `"error"`

### CRUD Patterns

#### ListDetail

Two rendering variants for list + detail layouts.

**Panel variant** (default): Side-by-side layout with draggable divider.

```tsx
<ListDetail variant="panel" listWidth="1/3">
  <ListDetail.List>
    {/* List content */}
  </ListDetail.List>
  <ListDetail.Detail>
    {/* Detail content */}
  </ListDetail.Detail>
</ListDetail>
```

**Dialog variant**: Full-width list with detail in a modal dialog.

```tsx
<ListDetail variant="dialog" onClose={() => setSelected(null)}>
  <ListDetail.List>
    {/* List takes full width */}
  </ListDetail.List>
  <ListDetail.Detail>
    {/* Opens in a modal dialog */}
  </ListDetail.Detail>
</ListDetail>
```

Props:

- `variant`: `"panel"` (default) | `"dialog"`
- `listWidth`: `"1/4"` | `"1/3"` | `"2/5"` | `"1/2"` | `"3/5"` | `"2/3"` | `"3/4"` | `"4/5"` (panel variant only)
- `activePanel`: `"list"` | `"detail"` (controlled mode)
- `onClose`: Callback when dialog is dismissed (dialog variant only)

Panel variant features:
- Responsive: collapses to single-panel on mobile
- Draggable divider with keyboard support (ArrowLeft/Right)

`ListDetailRoot` is the same component as `ListDetail` — exported as an alias for compound pattern composition.

### Router Adapters

The package is router-agnostic. Use `CrudProvider` to inject a router adapter.

```tsx
import { CrudProvider, createReactRouterAdapter } from "@simplix-react/ui";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

function AppShell() {
  const adapter = createReactRouterAdapter({ useNavigate, useSearchParams, useLocation });

  return (
    <CrudProvider router={adapter}>
      {/* CRUD pages can now use useRouter(), useUrlSync(), etc. */}
    </CrudProvider>
  );
}
```

### UIProvider

Override base components globally. Supports nesting for scoped overrides.

```tsx
import { UIProvider } from "@simplix-react/ui";
import { MyInput, MySelect } from "./custom-components";

<UIProvider overrides={{
  Input: MyInput,
  Select: {
    Root: MySelect.Root,
    Trigger: MySelect.Trigger,
    Value: MySelect.Value,
    Content: MySelect.Content,
    Item: MySelect.Item,
  },
}}>
  {/* All fields now use custom input/select */}
</UIProvider>
```

Overridable components: `Input`, `Textarea`, `Label`, `Switch`, `Checkbox`, `Badge`, `Calendar`, `Select` (compound), `RadioGroup` (compound).

### Utilities

| Function | Description |
| --- | --- |
| `cn(...inputs)` | Merges class names with `clsx` + `tailwind-merge` |
| `toTestId(label)` | Converts a label string to a kebab-case `data-testid` value |
| `sanitizeHtml(dirty)` | Sanitizes HTML via DOMPurify |

## Accessibility

- All form fields generate unique IDs via `useId()` and associate labels via `htmlFor`
- Hidden labels use `sr-only` class for screen reader accessibility
- Error messages use `role="alert"` for live announcements
- `aria-invalid` set on inputs when errors are present
- `aria-label` provided when `labelPosition="hidden"`
- Keyboard navigation support via `useKeyboardNav` hook
- Sort buttons and pagination controls have descriptive `aria-label`
- Selection checkboxes have row-specific `aria-label`

## Peer Dependencies

```json
{
  "@simplix-react/form": "workspace:*",
  "@simplix-react/i18n": "workspace:*",
  "@simplix-react/react": "workspace:*",
  "react": ">=18.0.0",
  "react-router-dom": ">=6.0.0 (optional)"
}
```

`react-router-dom` is required only when using `createReactRouterAdapter`. Other router adapters can be provided via `CrudProvider`.

## License

See root LICENSE file.

## Namespaces

- [DetailFields](namespaces/DetailFields/README.md)
- [FormFields](namespaces/FormFields/README.md)

## Classes

- [CrudErrorBoundary](classes/CrudErrorBoundary.md)

## Interfaces

- [BadgeProps](interfaces/BadgeProps.md)
- [ButtonProps](interfaces/ButtonProps.md)
- [CalendarProps](interfaces/CalendarProps.md)
- [CardListProps](interfaces/CardListProps.md)
- [CardProps](interfaces/CardProps.md)
- [CommonDetailFieldProps](interfaces/CommonDetailFieldProps.md)
- [CommonFieldProps](interfaces/CommonFieldProps.md)
- [ContainerProps](interfaces/ContainerProps.md)
- [CrudDeleteProps](interfaces/CrudDeleteProps.md)
- [CrudDetailActionsProps](interfaces/CrudDetailActionsProps.md)
- [CrudDetailDefaultActionsProps](interfaces/CrudDetailDefaultActionsProps.md)
- [CrudDetailProps](interfaces/CrudDetailProps.md)
- [CrudDetailSectionProps](interfaces/CrudDetailSectionProps.md)
- [CrudErrorBoundaryProps](interfaces/CrudErrorBoundaryProps.md)
- [CrudFormActionsProps](interfaces/CrudFormActionsProps.md)
- [CrudFormProps](interfaces/CrudFormProps.md)
- [CrudFormSectionProps](interfaces/CrudFormSectionProps.md)
- [CrudListFilters](interfaces/CrudListFilters.md)
- [CrudListPagination](interfaces/CrudListPagination.md)
- [CrudListSelection](interfaces/CrudListSelection.md)
- [CrudListSort](interfaces/CrudListSort.md)
- [CrudMutation](interfaces/CrudMutation.md)
- [CrudProviderProps](interfaces/CrudProviderProps.md)
- [DeleteTarget](interfaces/DeleteTarget.md)
- [DetailFieldWrapperProps](interfaces/DetailFieldWrapperProps.md)
- [ErrorBoundaryState](interfaces/ErrorBoundaryState.md)
- [FieldVariant](interfaces/FieldVariant.md)
- [FieldWrapperProps](interfaces/FieldWrapperProps.md)
- [FilterState](interfaces/FilterState.md)
- [GridProps](interfaces/GridProps.md)
- [HeadingProps](interfaces/HeadingProps.md)
- [ListActionProps](interfaces/ListActionProps.md)
- [ListBulkActionProps](interfaces/ListBulkActionProps.md)
- [ListBulkActionsProps](interfaces/ListBulkActionsProps.md)
- [ListColumnProps](interfaces/ListColumnProps.md)
- [ListDetailContextValue](interfaces/ListDetailContextValue.md)
- [ListDetailPanelProps](interfaces/ListDetailPanelProps.md)
- [ListDetailProps](interfaces/ListDetailProps.md)
- [ListEmptyProps](interfaces/ListEmptyProps.md)
- [ListFilterOption](interfaces/ListFilterOption.md)
- [ListFilterProps](interfaces/ListFilterProps.md)
- [ListHook](interfaces/ListHook.md)
- [ListHookResult](interfaces/ListHookResult.md)
- [ListPaginationProps](interfaces/ListPaginationProps.md)
- [ListProps](interfaces/ListProps.md)
- [ListRowActionsProps](interfaces/ListRowActionsProps.md)
- [ListSearchProps](interfaces/ListSearchProps.md)
- [ListTableProps](interfaces/ListTableProps.md)
- [ListToolbarProps](interfaces/ListToolbarProps.md)
- [PaginationState](interfaces/PaginationState.md)
- [QueryFallbackProps](interfaces/QueryFallbackProps.md)
- [RadioGroupComponents](interfaces/RadioGroupComponents.md)
- [ReactRouterHooks](interfaces/ReactRouterHooks.md)
- [RouterAdapter](interfaces/RouterAdapter.md)
- [SectionProps](interfaces/SectionProps.md)
- [SelectComponents](interfaces/SelectComponents.md)
- [SortState](interfaces/SortState.md)
- [StackProps](interfaces/StackProps.md)
- [TextProps](interfaces/TextProps.md)
- [UIComponents](interfaces/UIComponents.md)
- [UIProviderProps](interfaces/UIProviderProps.md)
- [UseAutosaveOptions](interfaces/UseAutosaveOptions.md)
- [UseAutosaveReturn](interfaces/UseAutosaveReturn.md)
- [UseCrudDeleteDetailResult](interfaces/UseCrudDeleteDetailResult.md)
- [UseCrudDeleteListResult](interfaces/UseCrudDeleteListResult.md)
- [UseCrudFormSubmitOptions](interfaces/UseCrudFormSubmitOptions.md)
- [UseCrudFormSubmitResult](interfaces/UseCrudFormSubmitResult.md)
- [UseCrudListOptions](interfaces/UseCrudListOptions.md)
- [UseCrudListResult](interfaces/UseCrudListResult.md)
- [UseFadeTransitionOptions](interfaces/UseFadeTransitionOptions.md)
- [UseFadeTransitionResult](interfaces/UseFadeTransitionResult.md)
- [UseKeyboardNavOptions](interfaces/UseKeyboardNavOptions.md)
- [UseListDetailStateOptions](interfaces/UseListDetailStateOptions.md)
- [UseListDetailStateResult](interfaces/UseListDetailStateResult.md)
- [UseUrlSyncOptions](interfaces/UseUrlSyncOptions.md)
- [UseVirtualListOptions](interfaces/UseVirtualListOptions.md)
- [WizardProps](interfaces/WizardProps.md)
- [WizardStepProps](interfaces/WizardStepProps.md)

## Type Aliases

- [AutosaveStatus](type-aliases/AutosaveStatus.md)
- [BadgeVariants](type-aliases/BadgeVariants.md)
- [ButtonVariants](type-aliases/ButtonVariants.md)
- [CardTag](type-aliases/CardTag.md)
- [CardVariants](type-aliases/CardVariants.md)
- [CheckboxProps](type-aliases/CheckboxProps.md)
- [ContainerVariants](type-aliases/ContainerVariants.md)
- [DetailView](type-aliases/DetailView.md)
- [DialogContentProps](type-aliases/DialogContentProps.md)
- [DialogDescriptionProps](type-aliases/DialogDescriptionProps.md)
- [DialogFooterProps](type-aliases/DialogFooterProps.md)
- [DialogHeaderProps](type-aliases/DialogHeaderProps.md)
- [DialogOverlayProps](type-aliases/DialogOverlayProps.md)
- [DialogTitleProps](type-aliases/DialogTitleProps.md)
- [DropdownMenuCheckboxItemProps](type-aliases/DropdownMenuCheckboxItemProps.md)
- [DropdownMenuContentProps](type-aliases/DropdownMenuContentProps.md)
- [DropdownMenuItemProps](type-aliases/DropdownMenuItemProps.md)
- [DropdownMenuLabelProps](type-aliases/DropdownMenuLabelProps.md)
- [DropdownMenuRadioItemProps](type-aliases/DropdownMenuRadioItemProps.md)
- [DropdownMenuSeparatorProps](type-aliases/DropdownMenuSeparatorProps.md)
- [DropdownMenuSubContentProps](type-aliases/DropdownMenuSubContentProps.md)
- [DropdownMenuSubTriggerProps](type-aliases/DropdownMenuSubTriggerProps.md)
- [EmptyReason](type-aliases/EmptyReason.md)
- [FlexProps](type-aliases/FlexProps.md)
- [GridVariants](type-aliases/GridVariants.md)
- [HeadingTag](type-aliases/HeadingTag.md)
- [HeadingVariants](type-aliases/HeadingVariants.md)
- [InputProps](type-aliases/InputProps.md)
- [LabelProps](type-aliases/LabelProps.md)
- [ListDetailVariant](type-aliases/ListDetailVariant.md)
- [ListWidth](type-aliases/ListWidth.md)
- [NavigationMenuContentProps](type-aliases/NavigationMenuContentProps.md)
- [NavigationMenuIndicatorProps](type-aliases/NavigationMenuIndicatorProps.md)
- [NavigationMenuItemProps](type-aliases/NavigationMenuItemProps.md)
- [NavigationMenuLinkProps](type-aliases/NavigationMenuLinkProps.md)
- [NavigationMenuListProps](type-aliases/NavigationMenuListProps.md)
- [NavigationMenuProps](type-aliases/NavigationMenuProps.md)
- [NavigationMenuTriggerProps](type-aliases/NavigationMenuTriggerProps.md)
- [NavigationMenuViewportProps](type-aliases/NavigationMenuViewportProps.md)
- [PopoverContentProps](type-aliases/PopoverContentProps.md)
- [RadioGroupItemProps](type-aliases/RadioGroupItemProps.md)
- [RadioGroupProps](type-aliases/RadioGroupProps.md)
- [SelectContentProps](type-aliases/SelectContentProps.md)
- [SelectItemProps](type-aliases/SelectItemProps.md)
- [SelectLabelProps](type-aliases/SelectLabelProps.md)
- [SelectSeparatorProps](type-aliases/SelectSeparatorProps.md)
- [SelectTriggerProps](type-aliases/SelectTriggerProps.md)
- [SeparatorProps](type-aliases/SeparatorProps.md)
- [SheetContentProps](type-aliases/SheetContentProps.md)
- [SheetDescriptionProps](type-aliases/SheetDescriptionProps.md)
- [SheetFooterProps](type-aliases/SheetFooterProps.md)
- [SheetHeaderProps](type-aliases/SheetHeaderProps.md)
- [SheetTitleProps](type-aliases/SheetTitleProps.md)
- [SkeletonProps](type-aliases/SkeletonProps.md)
- [StackVariants](type-aliases/StackVariants.md)
- [SwitchProps](type-aliases/SwitchProps.md)
- [TableBodyProps](type-aliases/TableBodyProps.md)
- [TableCaptionProps](type-aliases/TableCaptionProps.md)
- [TableCellProps](type-aliases/TableCellProps.md)
- [TableFooterProps](type-aliases/TableFooterProps.md)
- [TableHeaderProps](type-aliases/TableHeaderProps.md)
- [TableHeadProps](type-aliases/TableHeadProps.md)
- [TableProps](type-aliases/TableProps.md)
- [TableRowProps](type-aliases/TableRowProps.md)
- [TabsContentProps](type-aliases/TabsContentProps.md)
- [TabsListProps](type-aliases/TabsListProps.md)
- [TabsTriggerProps](type-aliases/TabsTriggerProps.md)
- [TextareaProps](type-aliases/TextareaProps.md)
- [TextTag](type-aliases/TextTag.md)
- [TextVariants](type-aliases/TextVariants.md)
- [TooltipContentProps](type-aliases/TooltipContentProps.md)
- [TooltipProviderProps](type-aliases/TooltipProviderProps.md)

## Variables

- [Badge](variables/Badge.md)
- [badgeVariants](variables/badgeVariants.md)
- [Button](variables/Button.md)
- [buttonVariants](variables/buttonVariants.md)
- [Calendar](variables/Calendar.md)
- [Card](variables/Card.md)
- [cardVariants](variables/cardVariants.md)
- [Checkbox](variables/Checkbox.md)
- [Container](variables/Container.md)
- [containerVariants](variables/containerVariants.md)
- [CrudDetail](variables/CrudDetail.md)
- [CrudForm](variables/CrudForm.md)
- [CrudList](variables/CrudList.md)
- [Dialog](variables/Dialog.md)
- [DialogClose](variables/DialogClose.md)
- [DialogContent](variables/DialogContent.md)
- [DialogDescription](variables/DialogDescription.md)
- [DialogOverlay](variables/DialogOverlay.md)
- [DialogPortal](variables/DialogPortal.md)
- [DialogTitle](variables/DialogTitle.md)
- [DialogTrigger](variables/DialogTrigger.md)
- [DropdownMenu](variables/DropdownMenu.md)
- [DropdownMenuCheckboxItem](variables/DropdownMenuCheckboxItem.md)
- [DropdownMenuContent](variables/DropdownMenuContent.md)
- [DropdownMenuGroup](variables/DropdownMenuGroup.md)
- [DropdownMenuItem](variables/DropdownMenuItem.md)
- [DropdownMenuLabel](variables/DropdownMenuLabel.md)
- [DropdownMenuPortal](variables/DropdownMenuPortal.md)
- [DropdownMenuRadioGroup](variables/DropdownMenuRadioGroup.md)
- [DropdownMenuRadioItem](variables/DropdownMenuRadioItem.md)
- [DropdownMenuSeparator](variables/DropdownMenuSeparator.md)
- [DropdownMenuSub](variables/DropdownMenuSub.md)
- [DropdownMenuSubContent](variables/DropdownMenuSubContent.md)
- [DropdownMenuSubTrigger](variables/DropdownMenuSubTrigger.md)
- [DropdownMenuTrigger](variables/DropdownMenuTrigger.md)
- [FieldVariantContext](variables/FieldVariantContext.md)
- [Flex](variables/Flex.md)
- [Grid](variables/Grid.md)
- [gridVariants](variables/gridVariants.md)
- [Heading](variables/Heading.md)
- [headingVariants](variables/headingVariants.md)
- [Input](variables/Input.md)
- [Label](variables/Label.md)
- [ListDetail](variables/ListDetail.md)
- [NavigationMenuContent](variables/NavigationMenuContent.md)
- [NavigationMenuIndicator](variables/NavigationMenuIndicator.md)
- [NavigationMenuItem](variables/NavigationMenuItem.md)
- [NavigationMenuLink](variables/NavigationMenuLink.md)
- [NavigationMenuList](variables/NavigationMenuList.md)
- [NavigationMenuTrigger](variables/NavigationMenuTrigger.md)
- [navigationMenuTriggerStyle](variables/navigationMenuTriggerStyle.md)
- [NavigationMenuViewport](variables/NavigationMenuViewport.md)
- [Popover](variables/Popover.md)
- [PopoverAnchor](variables/PopoverAnchor.md)
- [PopoverContent](variables/PopoverContent.md)
- [PopoverTrigger](variables/PopoverTrigger.md)
- [RadioGroup](variables/RadioGroup.md)
- [RadioGroupItem](variables/RadioGroupItem.md)
- [RouterContext](variables/RouterContext.md)
- [Section](variables/Section.md)
- [Select](variables/Select.md)
- [SelectContent](variables/SelectContent.md)
- [SelectGroup](variables/SelectGroup.md)
- [SelectItem](variables/SelectItem.md)
- [SelectLabel](variables/SelectLabel.md)
- [SelectSeparator](variables/SelectSeparator.md)
- [SelectTrigger](variables/SelectTrigger.md)
- [SelectValue](variables/SelectValue.md)
- [Separator](variables/Separator.md)
- [Sheet](variables/Sheet.md)
- [SheetClose](variables/SheetClose.md)
- [SheetContent](variables/SheetContent.md)
- [SheetDescription](variables/SheetDescription.md)
- [SheetTitle](variables/SheetTitle.md)
- [SheetTrigger](variables/SheetTrigger.md)
- [Stack](variables/Stack.md)
- [stackVariants](variables/stackVariants.md)
- [Switch](variables/Switch.md)
- [Table](variables/Table.md)
- [TableBody](variables/TableBody.md)
- [TableCaption](variables/TableCaption.md)
- [TableCell](variables/TableCell.md)
- [TableFooter](variables/TableFooter.md)
- [TableHead](variables/TableHead.md)
- [TableHeader](variables/TableHeader.md)
- [TableRow](variables/TableRow.md)
- [Tabs](variables/Tabs.md)
- [TabsContent](variables/TabsContent.md)
- [TabsList](variables/TabsList.md)
- [TabsTrigger](variables/TabsTrigger.md)
- [Text](variables/Text.md)
- [Textarea](variables/Textarea.md)
- [textVariants](variables/textVariants.md)
- [Tooltip](variables/Tooltip.md)
- [TooltipContent](variables/TooltipContent.md)
- [TooltipTrigger](variables/TooltipTrigger.md)
- [UIComponentContext](variables/UIComponentContext.md)
- [Wizard](variables/Wizard.md)

## Functions

- [CardList](functions/CardList.md)
- [cn](functions/cn.md)
- [createReactRouterAdapter](functions/createReactRouterAdapter.md)
- [CrudDelete](functions/CrudDelete.md)
- [CrudProvider](functions/CrudProvider.md)
- [DetailFieldWrapper](functions/DetailFieldWrapper.md)
- [DialogFooter](functions/DialogFooter.md)
- [DialogHeader](functions/DialogHeader.md)
- [FieldWrapper](functions/FieldWrapper.md)
- [ListDetailRoot](functions/ListDetailRoot.md)
- [NavigationMenu](functions/NavigationMenu.md)
- [QueryFallback](functions/QueryFallback.md)
- [sanitizeHtml](functions/sanitizeHtml.md)
- [SheetFooter](functions/SheetFooter.md)
- [SheetHeader](functions/SheetHeader.md)
- [Skeleton](functions/Skeleton.md)
- [TooltipProvider](functions/TooltipProvider.md)
- [toTestId](functions/toTestId.md)
- [UIProvider](functions/UIProvider.md)
- [useAutosave](functions/useAutosave.md)
- [useCrudDeleteDetail](functions/useCrudDeleteDetail.md)
- [useCrudDeleteList](functions/useCrudDeleteList.md)
- [useCrudFormSubmit](functions/useCrudFormSubmit.md)
- [useCrudList](functions/useCrudList.md)
- [useFadeTransition](functions/useFadeTransition.md)
- [useFieldVariant](functions/useFieldVariant.md)
- [useKeyboardNav](functions/useKeyboardNav.md)
- [useListDetailState](functions/useListDetailState.md)
- [useMediaQuery](functions/useMediaQuery.md)
- [usePreviousData](functions/usePreviousData.md)
- [useRouter](functions/useRouter.md)
- [useUIComponents](functions/useUIComponents.md)
- [useUrlSync](functions/useUrlSync.md)
- [useVirtualList](functions/useVirtualList.md)
