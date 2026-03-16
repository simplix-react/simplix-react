# How to Build CRUD Interfaces with @simplix-react/ui

> Use `@simplix-react/ui` components to build list, form, and detail views with compound component patterns, explicit field props, and customizable layouts.

## Before You Begin

- A simplix-react project with domain packages and derived hooks
- Install the UI package:

```bash
pnpm add @simplix-react/ui
```

- Peer dependencies:

| Package | Version |
| --- | --- |
| `@simplix-react/form` | workspace |
| `@simplix-react/i18n` | workspace |
| `@simplix-react/react` | workspace |
| `react` | >= 18.0.0 |

- An existing contract, hooks, and form hooks setup:

```ts
// contract.ts
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    user: {
      path: "/users",
      schema: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        status: z.enum(["active", "inactive"]),
        createdAt: z.string(),
      }),
      createSchema: z.object({
        name: z.string(),
        email: z.string(),
        status: z.enum(["active", "inactive"]),
      }),
      updateSchema: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }),
    },
  },
});

// hooks.ts
import { deriveEntityHooks } from "@simplix-react/react";
import { projectContract } from "./contract.js";

export const projectHooks = deriveEntityHooks(projectContract);
```

## Solution

### Step 1 -- Set Up UIProvider

Wrap your app with `UIProvider` to enable component overrides and default configurations:

```tsx
import { UIProvider } from "@simplix-react/ui";

function App() {
  return (
    <UIProvider>
      {/* Your CRUD pages */}
    </UIProvider>
  );
}
```

To globally override base components (e.g., replace `Input` or `Select` with custom implementations):

```tsx
import { UIProvider } from "@simplix-react/ui";
import { MyCustomInput } from "./my-input";

<UIProvider overrides={{
  Input: MyCustomInput,
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

### Step 2 -- Build a CRUD List Page

Use `useCrudList` to manage list state and `CrudList` for the compound layout:

```tsx
import { CrudList, useCrudList, FormFields } from "@simplix-react/ui";
import { projectHooks } from "./hooks.js";

function UserListPage() {
  const { data, filters, sort, pagination, selection, emptyReason } =
    useCrudList(projectHooks.user.useList, {
      stateMode: "server",
      defaultSort: { field: "name", direction: "asc" },
      defaultPageSize: 20,
    });

  return (
    <CrudList>
      <CrudList.Toolbar>
        <CrudList.Search value={filters.search} onChange={filters.setSearch} />
      </CrudList.Toolbar>

      <CrudList.BulkActions
        selectedCount={selection.selected.size}
        onClear={selection.clear}
      >
        <CrudList.BulkAction
          label="Delete Selected"
          onClick={() => handleBulkDelete(selection.selected)}
          variant="destructive"
        />
      </CrudList.BulkActions>

      {emptyReason ? (
        <CrudList.Empty reason={emptyReason} />
      ) : (
        <CrudList.Table
          data={data}
          sort={{ field: sort.field!, direction: sort.direction }}
          onSortChange={(s) => sort.setSort(s.field, s.direction)}
          selectable
          selectedIndices={selection.selected}
          onSelectionChange={selection.toggle}
          onSelectAll={() => selection.toggleAll(data)}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
        >
          <CrudList.Column field="name" header="Name" sortable />
          <CrudList.Column field="email" header="Email" sortable />
          <CrudList.Column
            field="status"
            header="Status"
            display="badge"
            variants={{ active: "success", inactive: "secondary" }}
          />
          <CrudList.Column field="createdAt" header="Created" format="date" sortable />
        </CrudList.Table>
      )}

      <CrudList.Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </CrudList>
  );
}
```

`useCrudList` returns:

| Property | Description |
| --- | --- |
| `data` | The current page of data |
| `isLoading` | Loading state |
| `error` | Error object if query failed |
| `filters` | `{ search, setSearch, values, setValues }` |
| `sort` | `{ field, direction, setSort }` |
| `pagination` | `{ page, pageSize, total, totalPages, setPage, setPageSize }` |
| `selection` | `{ selected, toggle, toggleAll, clear }` |
| `emptyReason` | `"no-data"`, `"no-results"`, or `null` |

### Step 3 -- Build a Create/Edit Form

Use `CrudForm` with `FormFields` for explicit value/onChange field components:

```tsx
import { useRef, useState } from "react";
import { Button, CrudForm, FormFields, SaveButton, useCrudFormSubmit, useIsDirty } from "@simplix-react/ui";
import { projectHooks } from "./hooks.js";

function UserFormPage({ userId }: { userId?: string }) {
  const { data: user, isLoading } = projectHooks.user.useGet(userId ?? "");

  const [values, setValues] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    status: user?.status ?? "active",
  });
  const initialValues = useRef(values).current;
  const isDirty = useIsDirty(values, initialValues);

  const { isEdit, handleSubmit, isPending, fieldErrors } = useCrudFormSubmit({
    entityId: userId,
    create: projectHooks.user.useCreate(),
    update: projectHooks.user.useUpdate(),
    onSuccess: () => navigate("/users"),
  });

  if (userId && isLoading) return <p>Loading...</p>;

  return (
    <CrudForm
      onSubmit={() => handleSubmit(values)}
      isSubmitting={isPending}
      warnOnUnsavedChanges
    >
      <CrudForm.Section title="Basic Info" layout="two-column">
        <FormFields.TextField
          label="Name"
          value={values.name}
          onChange={(v) => setValues((p) => ({ ...p, name: v }))}
          error={fieldErrors["name"]}
        />
        <FormFields.TextField
          label="Email"
          value={values.email}
          onChange={(v) => setValues((p) => ({ ...p, email: v }))}
          type="email"
          error={fieldErrors["email"]}
        />
      </CrudForm.Section>

      <CrudForm.Section title="Settings" layout="single-column">
        <FormFields.SelectField
          label="Status"
          value={values.status}
          onChange={(v) => setValues((p) => ({ ...p, status: v }))}
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </CrudForm.Section>

      <CrudForm.Actions>
        <Button type="button" variant="outline" onClick={() => navigate("/users")} disabled={isPending}>
          Cancel
        </Button>
        <SaveButton type="submit" isDirty={isEdit ? isDirty : undefined} isSaving={isPending} fieldErrors={fieldErrors}>
          {isEdit ? "Save Changes" : "Create User"}
        </SaveButton>
      </CrudForm.Actions>
    </CrudForm>
  );
}
```

`CrudForm.Section` layout options: `"single-column"`, `"two-column"`, `"three-column"`.

### Save Button

Use `SaveButton` for all save/create/update actions. It handles isDirty, loading, and validation states:

```tsx
import { SaveButton, useIsDirty } from "@simplix-react/ui";

// Edit mode — disabled until changes, shows server error count badge
const isDirty = useIsDirty(values, initialValues);
<SaveButton type="submit" isDirty={isDirty} isSaving={isPending} fieldErrors={fieldErrors}>
  Save Changes
</SaveButton>

// Create mode — isDirty omitted (always enabled)
<SaveButton type="submit" isSaving={isPending} fieldErrors={fieldErrors}>
  Create
</SaveButton>

// Editor with client-side validation (validationCount disables button)
<SaveButton isDirty={isDirty} isSaving={isSaving} validationCount={errors.length} onClick={handleSave}>
  Save
</SaveButton>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isDirty` | `boolean` | `true` | Disabled when `false`. Omit for create mode. |
| `isSaving` | `boolean` | `false` | Shows spinner and disables button. |
| `fieldErrors` | `Record<string, string>` | — | Server validation errors. Shows count badge (informational). |
| `validationCount` | `number` | — | Client validation errors. Takes priority over fieldErrors. Disables button. |
| `savingText` | `string` | `"Saving..."` | Text shown during save. |

### Button Loading Prop

All buttons support a `loading` prop for async operations:

```tsx
import { Button } from "@simplix-react/ui";

<Button loading={mutation.isPending} loadingText="Executing...">
  Execute
</Button>
```

When `loading=true`: shows spinner, replaces text with `loadingText` (or keeps original), auto-disables, sets `aria-busy`.

Available form field components:

| Component | Value Type | Key Props |
| --- | --- | --- |
| `FormFields.TextField` | `string` | `type`, `placeholder`, `maxLength` |
| `FormFields.TextareaField` | `string` | `rows`, `maxLength`, `resize` |
| `FormFields.NumberField` | `number \| null` | `min`, `max`, `step` |
| `FormFields.SelectField` | `string` | `options`, `placeholder` |
| `FormFields.SwitchField` | `boolean` | `switchProps` |
| `FormFields.CheckboxField` | `boolean` | `checkboxProps` |
| `FormFields.RadioGroupField` | `string` | `options`, `direction` |
| `FormFields.DateField` | `Date \| null` | `minDate`, `maxDate`, `format` |
| `FormFields.ComboboxField` | `string \| null` | `options`, `onSearch`, `loading` |
| `FormFields.PasswordField` | `string` | `placeholder`, `maxLength` |
| `FormFields.ColorField` | `string` (hex) | Native color picker + hex input |
| `FormFields.SliderField` | `number` | `min`, `max`, `step`, `showValue` |
| `FormFields.MultiSelectField` | `string[]` | `options`, `maxCount` |
| `FormFields.Field` | `ReactNode` | Generic wrapper for custom content |

All fields share common props: `label`, `error`, `description`, `required`, `disabled`, `className`.

### Step 4 -- Build a Detail View

Use `CrudDetail` with `DetailFields` for read-only display:

```tsx
import {
  CrudDetail,
  DetailFields,
  CrudDelete,
  useCrudDeleteDetail,
  QueryFallback,
} from "@simplix-react/ui";
import { projectHooks } from "./hooks.js";

function UserDetailPage({ userId }: { userId: string }) {
  const { data: user, isLoading } = projectHooks.user.useGet(userId);
  const deleteMutation = projectHooks.user.useDelete();
  const del = useCrudDeleteDetail();

  if (isLoading || !user) {
    return <QueryFallback isLoading={isLoading} notFoundMessage="User not found." />;
  }

  return (
    <>
      <CrudDetail fieldVariant={{ labelPosition: "left" }}>
        <CrudDetail.Section title="User Info">
          <DetailFields.DetailTextField label="Name" value={user.name} copyable />
          <DetailFields.DetailTextField label="Email" value={user.email} copyable />
          <DetailFields.DetailBadgeField
            label="Status"
            value={user.status}
            variants={{ active: "success", inactive: "secondary" }}
          />
          <DetailFields.DetailDateField
            label="Created"
            value={user.createdAt}
            format="relative"
          />
        </CrudDetail.Section>

        <CrudDetail.DefaultActions
          onEdit={() => navigate(`/users/${userId}/edit`)}
          onDelete={del.requestDelete}
          isPending={deleteMutation.isPending}
        />
      </CrudDetail>

      <CrudDelete
        open={del.open}
        onOpenChange={del.onOpenChange}
        onConfirm={() => deleteMutation.mutate(userId)}
        entityName={user.name}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
```

Available detail field components:

| Component | Value Type | Key Props |
| --- | --- | --- |
| `DetailFields.DetailTextField` | `string \| null` | `fallback`, `copyable` |
| `DetailFields.DetailNumberField` | `number \| null` | `format` (decimal/currency/percent), `locale`, `currency` |
| `DetailFields.DetailDateField` | `Date \| string \| null` | `format` (date/datetime/relative), `fallback` |
| `DetailFields.DetailBadgeField` | `string` | `variants` (value-to-variant mapping) |
| `DetailFields.DetailLinkField` | `string` | `href`, `external` |
| `DetailFields.DetailBooleanField` | `boolean \| null` | `mode` (text/icon), `labels` |
| `DetailFields.DetailImageField` | `string \| null` (URL) | `alt`, `width`, `height` |
| `DetailFields.DetailListField` | `string[] \| null` | `mode` (badges/comma/bullet) |
| `DetailFields.DetailField` | `ReactNode` | Generic wrapper for custom content |

### Step 5 -- Use Layout Primitives

Layout primitives provide semantic, CVA-based layout components:

```tsx
import { Stack, Grid, Section, Card, Container, Heading, Text } from "@simplix-react/ui";

function UserProfilePage() {
  return (
    <Container size="lg">
      <Stack gap="lg">
        <Heading level={1}>User Profile</Heading>

        <Section title="Basic Info" description="Contact and account details">
          <Grid columns={2} gap="md">
            <FormFields.TextField label="First Name" value={first} onChange={setFirst} />
            <FormFields.TextField label="Last Name" value={last} onChange={setLast} />
          </Grid>
        </Section>

        <Card padding="md">
          <Text size="sm" tone="muted">
            Last updated 3 hours ago
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
```

| Component | Key Props | Description |
| --- | --- | --- |
| `Stack` | `direction`, `gap`, `align`, `justify`, `wrap` | Vertical/horizontal flex layout |
| `Flex` | Same as Stack | Horizontal flex (alias for `Stack direction="row"`) |
| `Grid` | `columns` (1-6), `gap` | CSS Grid layout |
| `Container` | `size` (sm/md/lg/xl/full) | Centered max-width wrapper |
| `Section` | `title`, `description` | Content section with title/description |
| `Card` | `padding` (none/sm/md/lg), `interactive` | Card container with border and shadow |
| `Heading` | `level` (1-6), `tone`, `font` | Semantic heading (h1-h6) |
| `Text` | `size` (lg/base/sm/caption), `tone`, `font` | Body text with typography scale |

## Variations

### Field Variant Context

Control field label position and size across a section or page:

```tsx
import { FieldVariantContext } from "@simplix-react/ui";

<FieldVariantContext.Provider value={{ labelPosition: "left", size: "sm" }}>
  <FormFields.TextField label="Name" value={name} onChange={setName} />
  <FormFields.TextField label="Email" value={email} onChange={setEmail} />
</FieldVariantContext.Provider>
```

Options: `labelPosition` (`"top"` | `"left"` | `"hidden"`), `size` (`"sm"` | `"md"` | `"lg"`).

### Card-Based List Layout

Use `CardList` for mobile-friendly card layouts:

```tsx
import { CardList } from "@simplix-react/ui";

<CardList
  data={users}
  columns={2}
  renderCard={(user, index) => (
    <div key={index} className="rounded-lg border p-4">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )}
/>
```

### Multi-Step Form Wizard

```tsx
import { Wizard, FormFields } from "@simplix-react/ui";

<Wizard onComplete={handleSubmit}>
  <Wizard.Step title="Basic Info" validate={validateStep1}>
    <FormFields.TextField label="Name" value={name} onChange={setName} />
    <FormFields.TextField label="Email" value={email} onChange={setEmail} />
  </Wizard.Step>
  <Wizard.Step title="Details">
    <FormFields.TextareaField label="Bio" value={bio} onChange={setBio} />
  </Wizard.Step>
  <Wizard.Step title="Review">
    <p>Confirm your details before submitting.</p>
  </Wizard.Step>
</Wizard>
```

### Delete Confirmation in List Views

Use `useCrudDeleteList` for managing delete state in list pages:

```tsx
import { CrudDelete, useCrudDeleteList } from "@simplix-react/ui";

function UserList() {
  const del = useCrudDeleteList();
  const deleteMutation = projectHooks.user.useDelete();

  // In row actions: del.requestDelete({ id: row.id, name: row.name })

  return (
    <>
      {/* List content... */}
      <CrudDelete
        open={del.open}
        onOpenChange={(o) => { if (!o) del.cancel(); }}
        onConfirm={() => deleteMutation.mutate(del.target!.id)}
        entityName={del.target?.name}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
```

### ListDetail Pattern

Two-panel layout with list and detail side by side:

```tsx
import { ListDetail } from "@simplix-react/ui";

// Panel variant (side-by-side with draggable divider)
<ListDetail variant="panel" listWidth="1/3">
  <ListDetail.List>
    {/* List content */}
  </ListDetail.List>
  <ListDetail.Detail>
    {/* Detail content */}
  </ListDetail.Detail>
</ListDetail>

// Dialog variant (full-width list, detail in modal)
<ListDetail variant="dialog" onClose={() => setSelected(null)}>
  <ListDetail.List>
    {/* List takes full width */}
  </ListDetail.List>
  <ListDetail.Detail>
    {/* Opens in a modal dialog */}
  </ListDetail.Detail>
</ListDetail>
```

### Calendar Selection Modes

`Calendar` supports four selection modes via the `mode` prop:

| Mode | Output | Use Case |
| --- | --- | --- |
| `"single"` | `onSelect(date)` | Pick a single day |
| `"range"` | `onSelectRange({ from, to })` | Free-form date range |
| `"week"` | `onSelectRange({ from, to })` | Click any day to select its entire week (Mon-Sun) |
| `"month"` | `onSelectRange({ from, to })` | Pick a month from a 2-column year grid |

**Single mode** -- default, select one date:

```tsx
import { Calendar } from "@simplix-react/ui";

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  maxDate={new Date()}
  className="rounded-md border"
/>
```

**Week mode** -- click a day to select the full week. The entire row highlights on hover:

```tsx
import { Calendar } from "@simplix-react/ui";
import type { DateRange } from "@simplix-react/ui";

const [range, setRange] = useState<DateRange>({ from: undefined, to: undefined });

<Calendar
  mode="week"
  selectedRange={range}
  onSelectRange={setRange}
  className="rounded-md border"
/>
```

**Month mode** -- displays a year view with 2-column month grid. Navigation switches to year-level:

```tsx
<Calendar
  mode="month"
  selectedRange={range}
  onSelectRange={setRange}
  className="rounded-md border"
/>
```

**Controlled view month** -- use `month` / `onMonthChange` to control which month is displayed (useful when switching between week and month modes):

```tsx
const [viewMonth, setViewMonth] = useState(new Date());

<Calendar
  mode="week"
  selectedRange={range}
  onSelectRange={setRange}
  month={viewMonth}
  onMonthChange={setViewMonth}
/>
```

**Date math utilities** -- helper functions exported from `@simplix-react/ui` for week/month range calculations:

```tsx
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfDay, endOfDay,
  addDays, subDays,
  isSameDay, isSameWeek, isSameMonth,
} from "@simplix-react/ui";
```

### Custom Field Components

Use `FieldWrapper` to build custom fields that integrate with the field variant system:

```tsx
import { FieldWrapper } from "@simplix-react/ui";

function CustomRatingField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <FieldWrapper label={label} error={error}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={star <= value ? "text-yellow-500" : "text-gray-300"}
          >
            ★
          </button>
        ))}
      </div>
    </FieldWrapper>
  );
}
```

### Router Adapter

The package is router-agnostic. Inject a router via `CrudProvider`:

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

### Error Boundary

Wrap CRUD views with `CrudErrorBoundary` to catch render errors:

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
  <UserListPage />
</CrudErrorBoundary>
```

## Related

- [Form Hooks Guide](./form-hooks.md) -- Derive TanStack Form hooks from contracts
- [Defining Entities](./defining-entities.md) -- Setting up entity schemas in contracts
- [@simplix-react/ui API Reference](../api/@simplix-react/ui/README.md) -- Full API documentation
