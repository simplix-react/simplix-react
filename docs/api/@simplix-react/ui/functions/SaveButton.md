[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / SaveButton

# Function: SaveButton()

> **SaveButton**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/crud/form/save-button.tsx:58](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/save-button.tsx#L58)

Self-contained save button for CRUD forms and editors.

Handles three states automatically:
- **isDirty** — disabled when no changes (`isDirty=false`). Omit for create mode.
- **validation** — `validationCount` (client) disables button + badge. `fieldErrors` (server) shows badge only (allows retry).
- **loading** — shows spinner and loading text when `isSaving=true`.

## Parameters

### \_\_namedParameters

[`SaveButtonProps`](../interfaces/SaveButtonProps.md)

## Returns

`Element`

## Examples

```tsx
const isDirty = useIsDirty(values, initialValues);
<SaveButton type="submit" isDirty={isDirty} isSaving={isPending} fieldErrors={fieldErrors}>
  {t("entity.save")}
</SaveButton>
```

```tsx
<SaveButton type="submit" isSaving={isPending} fieldErrors={fieldErrors}>
  {t("entity.create")}
</SaveButton>
```

```tsx
<SaveButton isDirty={isDirty} isSaving={isSaving} validationCount={errors.length} onClick={handleSave}>
  {t("entity.saveChanges")}
</SaveButton>
```
