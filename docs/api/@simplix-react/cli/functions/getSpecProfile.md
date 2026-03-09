[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / getSpecProfile

# Function: getSpecProfile()

> **getSpecProfile**(`name`): [`SpecProfile`](../interfaces/SpecProfile.md) \| `undefined`

Defined in: [openapi/plugin-registry.ts:169](https://github.com/simplix-react/simplix-react/blob/main/openapi/plugin-registry.ts#L169)

Looks up a spec profile by name.

## Parameters

### name

`string`

The profile name to look up

## Returns

[`SpecProfile`](../interfaces/SpecProfile.md) \| `undefined`

The matching [SpecProfile](../interfaces/SpecProfile.md), or `undefined` if not registered

## Example

```ts
import { getSpecProfile } from "@simplix-react/cli";

const profile = getSpecProfile("simplix-boot");
if (profile) {
  console.log(profile.naming);
}
```
