# @simplix-react-ext/simplix-boot-utils

Utility functions for Spring Boot backends. Normalizes Boot API enum objects into plain strings and transforms generic CRUD filters into a searchable-jpa compatible format.

## Installation

```bash
pnpm add @simplix-react-ext/simplix-boot-utils
```

> **Prerequisites:** None. This package is standalone and declares no runtime or peer dependencies.

## Usage

### Resolve Boot Enum Values

`resolveBootEnum()` extracts a plain string from values that Boot may return either as a string or as an object that carries a `value` field:

```ts
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

resolveBootEnum("ACTIVE");                                  // "ACTIVE"
resolveBootEnum({ type: "Status", value: "ACTIVE", label: "Active" }); // "ACTIVE"
resolveBootEnum({ value: 3 });                             // "3"
resolveBootEnum(null);                                     // ""
resolveBootEnum(42);                                       // "42"
```

### Transform Searchable Filters

`transformSearchableFilters()` rewrites generic CRUD filter values into the operator/format conventions expected by a searchable-jpa backend:

```ts
import { transformSearchableFilters } from "@simplix-react-ext/simplix-boot-utils";

const result = transformSearchableFilters({
  "status.in": ["ACTIVE", "PENDING"],
  "createdAt.greaterThanOrEqualTo": "2024-01-01T00:00:00.000Z",
  "createdAt.lessThanOrEqualTo": "2024-12-31T23:59:59.000Z",
  "name.contains": "doe",
  "deletedAt.equals": "",
});

// result:
// {
//   "status.in": "ACTIVE,PENDING",
//   "createdAt.between": "2024-01-01T00:00:00,2024-12-31T23:59:59",
//   "name.contains": "doe",
// }
```

Array values are joined into a comma-separated string, matching gte/lte date pairs are merged into a single `.between` operator, ISO date strings are converted to `LocalDateTime` format, and empty values are dropped.

## API Reference

### `resolveBootEnum(v)`

Extracts a string value from a Boot API enum, which may arrive as a plain string or as an object carrying a `value` field.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `v` | `unknown` | A string, an object with a `value` field, `null`/`undefined`, or any other value |

**Returns:** `string`

**Behavior:**

- Returns `""` when `v` is `null` or `undefined`
- Returns `v` unchanged when it is already a string
- Returns `String(v.value)` when `v` is an object containing a `value` field
- Falls back to `String(v)` for any other value

### `transformSearchableFilters(filters)`

Transforms a generic CRUD filter object into the format expected by a searchable-jpa backend.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `filters` | `Record<string, unknown>` | Filter keys (typically `field.operator`) mapped to filter values |

**Returns:** `Record<string, unknown>`

**Behavior:**

- Skips entries whose value is `undefined`, `null`, or an empty string (`""`)
- Joins array values into a comma-separated string (e.g. `["A", "B"]` → `"A,B"`, for the `in` operator)
- Converts ISO date strings (matching `YYYY-MM-DDT…`) to `LocalDateTime` by stripping the milliseconds and timezone suffix (e.g. `2024-01-01T00:00:00.000Z` → `2024-01-01T00:00:00`)
- Merges a matching `<field>.greaterThanOrEqualTo` and `<field>.lessThanOrEqualTo` date pair into a single `<field>.between` operator with comma-joined bounds
- When only one side of a date pair is present, keeps the original `greaterThanOrEqualTo` or `lessThanOrEqualTo` operator with the value converted to `LocalDateTime`
- Leaves all other values unchanged

## Related

- [simplix-boot extension overview](../../README.md)
