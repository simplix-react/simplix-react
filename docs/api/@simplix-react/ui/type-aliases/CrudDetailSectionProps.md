[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudDetailSectionProps

# Type Alias: CrudDetailSectionProps

> **CrudDetailSectionProps** = `SectionShellProps`

Defined in: [packages/ui/src/crud/detail/crud-detail.tsx:174](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/detail/crud-detail.tsx#L174)

Section sub-component for CrudDetail.

## Examples

```tsx
<CrudDetail.Section title="Basic Info" variant="flat">
  ...
</CrudDetail.Section>
```

```tsx
<CrudDetail.Section title={<><MapPinIcon className="size-4" /> Location</>} variant="flat">
  ...
</CrudDetail.Section>
```

```tsx
<CrudDetail.Section title="Details" trailing={<Button size="sm" variant="outline">Edit</Button>}>
  ...
</CrudDetail.Section>
```
