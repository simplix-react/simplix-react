[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ReactRouterHooks

# Interface: ReactRouterHooks

Defined in: packages/ui/src/adapters/react-router.ts:7

React Router v6+ hook references required to create a router adapter.

## Properties

### useLocation()

> **useLocation**: () => `object`

Defined in: packages/ui/src/adapters/react-router.ts:16

#### Returns

`object`

##### pathname

> **pathname**: `string`

***

### useNavigate()

> **useNavigate**: () => (`to`, `options?`) => `void`

Defined in: packages/ui/src/adapters/react-router.ts:8

#### Returns

> (`to`, `options?`): `void`

##### Parameters

###### to

`string`

###### options?

###### replace?

`boolean`

##### Returns

`void`

***

### useSearchParams()

> **useSearchParams**: () => \[`URLSearchParams`, (`params`, `options?`) => `void`\]

Defined in: packages/ui/src/adapters/react-router.ts:9

#### Returns

\[`URLSearchParams`, (`params`, `options?`) => `void`\]
