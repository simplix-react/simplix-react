[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / EmptyReason

# Type Alias: EmptyReason

> **EmptyReason** = `"no-data"` \| `"no-filter"` \| `"no-search"` \| `"error"` \| `"unavailable"`

Defined in: [shared-types.ts:36](https://github.com/simplix-react/simplix-react/blob/main/shared-types.ts#L36)

Reason a list renders no rows.

## Remarks

Three of the four reasons describe a query that settled successfully with an
empty result (`"no-data"`, `"no-filter"`, `"no-search"`). The remaining two
describe a query that never produced a result:

- `"error"` — the query settled with a rejection.
- `"unavailable"` — the query is neither settled nor progressing: it is
  paused (React Query `fetchStatus === "paused"`) or waiting to retry after a
  failed attempt. No error is exposed yet because the retries are not
  exhausted, so this state must never be reported as absence of data.
