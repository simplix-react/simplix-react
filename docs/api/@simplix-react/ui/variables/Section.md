[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / Section

# Variable: Section

> `const` **Section**: `ForwardRefExoticComponent`\<`Omit`\<[`SectionProps`](../interfaces/SectionProps.md), `"ref"`\> & `RefAttributes`\<`HTMLElement`\>\>

Defined in: [packages/ui/src/primitives/section.tsx:39](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/primitives/section.tsx#L39)

Semantic section container with optional title and description.

```
┌─────────────────────────────────────┐
│ Account Settings                    │
│ Manage your account preferences     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  children...                    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Param

[SectionProps](../interfaces/SectionProps.md)

## Example

```tsx
<Section title="Account Settings" description="Manage your account preferences">
  <TextField label="Display Name" value={name} onChange={setName} />
</Section>
```
