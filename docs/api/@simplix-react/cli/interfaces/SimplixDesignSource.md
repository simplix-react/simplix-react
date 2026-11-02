[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / SimplixDesignSource

# Interface: SimplixDesignSource

Defined in: [config/types.ts:334](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L334)

The design reference an app's routed screens are checked against by `simplix generated` and
`simplix check-screen`: every routed screen of the app needs its design before it is made.

## Remarks

The kind names the manifest's shape:

- `screen-design`: `{ "screens": [{ "app": "<app>", "route": "/path", ... }] }`, one design entry
  per routed screen of every app the file covers, matched on the app's name and the route.
- `story-manifest`: `{ "rows": [{ "route": "/path", "state": "...", "stories": { "<width>":
  ["<story id>", ...] }, "fixture": "..." }], "exempt": [{ "route": "/path", "reason": "..." }] }`,
  the file of one app: a route is designed by a row naming at least one story id. A route that
  draws nothing to design (a sign-in callback) is listed under `exempt` with its reason.

Routes are read from the app's TanStack file routes: every `.ts`/`.tsx` file under `routes`
whose name does not start with `__`, by the path its `createFileRoute("...")` call names. That
path is the route's id, so a manifest names `login_.complete.tsx` as `"/login_/complete"`.

## Properties

### manifest

> `readonly` **manifest**: `string`

Defined in: [config/types.ts:337](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L337)

The manifest, relative to the project root.

***

### routes?

> `readonly` `optional` **routes**: `string`

Defined in: [config/types.ts:339](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L339)

The app's file-route directory, relative to the project root. Default `apps/<app>/src/routes`.

***

### source

> `readonly` **source**: `"screen-design"` \| `"story-manifest"`

Defined in: [config/types.ts:335](https://github.com/simplix-react/simplix-react/blob/main/config/types.ts#L335)
