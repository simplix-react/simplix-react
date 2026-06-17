[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / IconComponent

# Type Alias: IconComponent

> **IconComponent** = `ComponentType`\<\{ `aria-hidden?`: `boolean` \| `"true"` \| `"false"`; `className?`: `string`; \}\>

Defined in: [packages/ui/src/base/status-tone.ts:38](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/status-tone.ts#L38)

Structural type for an icon component (e.g. a lucide-react icon).

Typed structurally — by the props it is rendered with — rather than nominally
against a specific `lucide-react` version's `LucideIcon`, so components that
accept an icon stay compatible regardless of which lucide-react version a
consumer resolves.
