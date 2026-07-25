[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / EmptyReason

# Type Alias: EmptyReason

> **EmptyReason** = `"no-data"` \| `"no-filter"` \| `"no-search"` \| `"error"` \| `"unavailable"`

Defined in: [packages/headless/dist/index.d.ts:31](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L31)

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
