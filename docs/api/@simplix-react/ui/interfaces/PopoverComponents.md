[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / PopoverComponents

# Interface: PopoverComponents

Defined in: [packages/ui/src/provider/types.ts:101](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L101)

## Properties

### Anchor

> **Anchor**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\>

Defined in: [packages/ui/src/provider/types.ts:110](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L110)

Positions the popover against something other than its trigger. A field whose
box holds controls of its own (removable chips, a search input) cannot make
that box the trigger without nesting a control inside a control, so the box
anchors and a button inside it triggers.

***

### Content

> **Content**: `ComponentType`\<`PopoverContentProps` & `RefAttributes`\<`HTMLDivElement`\>\>

Defined in: [packages/ui/src/provider/types.ts:111](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L111)

***

### Root

> **Root**: `ComponentType`\<\{ `children?`: `ReactNode`; `onOpenChange?`: (`open`) => `void`; `open?`: `boolean`; \}\>

Defined in: [packages/ui/src/provider/types.ts:102](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L102)

***

### Trigger

> **Trigger**: `ComponentType`\<\{ `asChild?`: `boolean`; `children?`: `ReactNode`; \}\>

Defined in: [packages/ui/src/provider/types.ts:103](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/types.ts#L103)
