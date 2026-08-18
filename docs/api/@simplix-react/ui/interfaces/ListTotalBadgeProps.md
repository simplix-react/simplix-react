[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListTotalBadgeProps

# Interface: ListTotalBadgeProps

Defined in: [packages/ui/src/crud/shared/list-total-badge.tsx:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/list-total-badge.tsx#L7)

## Properties

### children?

> `optional` **children**: `ReactNode`

Defined in: [packages/ui/src/crud/shared/list-total-badge.tsx:28](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/list-total-badge.tsx#L28)

What the badge says instead of the framework's `Total N`, for a total the
framework cannot phrase.

<p>Some rows are about more than one figure — a tree counting nodes beside a
column counting the people under them, 「조직 39개 · 사용자 212명」 — and one
number cannot carry that. Before this existed those screens drew their own
badge, which is how a plain outline badge came to sit where every other list
draws an icon and a framework-translated label: the same row, two shapes.
Passing the sentence keeps the shape and replaces only the words.

<p>`count` is ignored when this is given, so pass one or the other.

***

### count?

> `optional` **count**: `number` \| `null`

Defined in: [packages/ui/src/crud/shared/list-total-badge.tsx:14](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/list-total-badge.tsx#L14)

Total row count shown in the badge. Pass `undefined` / `null` while the
figure is unknown — the first page in flight, a count query that has not
answered — and the badge holds its place with an empty value instead of
claiming zero. A reader takes `Total 0` as "there is nothing here".
