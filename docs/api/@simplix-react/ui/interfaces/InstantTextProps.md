[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / InstantTextProps

# Interface: InstantTextProps

Defined in: [packages/ui/src/base/display/date-time-text.tsx:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L11)

Props for [InstantText](../functions/InstantText.md).

## Properties

### displayZone?

> `optional` **displayZone**: `string`

Defined in: [packages/ui/src/base/display/date-time-text.tsx:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L18)

IANA display zone the instant is rendered in (site or app zone). Falls back to the
ambient [DisplayZoneProvider](../functions/DisplayZoneProvider.md) zone, then the browser zone.

***

### fallback?

> `optional` **fallback**: `ReactNode`

Defined in: [packages/ui/src/base/display/date-time-text.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L26)

Rendered when the value is null, empty, or unparseable. Defaults to nothing.

***

### format?

> `optional` **format**: `"date"` \| `"datetime"`

Defined in: [packages/ui/src/base/display/date-time-text.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L24)

`"datetime"` (default) shows the date and time; `"date"` shows the instant's calendar
date in `displayZone`. Unlike DetailDateField, `"date"` here honours the zone,
so an instant can be shown as its zone-local date without leaking the browser zone.

***

### value

> **value**: [`DateLike`](../type-aliases/DateLike.md) \| `null` \| `undefined`

Defined in: [packages/ui/src/base/display/date-time-text.tsx:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/date-time-text.tsx#L13)

Absolute instant — RFC 3339 string, `Date`, or epoch.
