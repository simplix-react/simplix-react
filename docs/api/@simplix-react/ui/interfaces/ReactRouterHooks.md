[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ReactRouterHooks

# Interface: ReactRouterHooks

Defined in: [packages/ui/src/adapters/react-router.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/adapters/react-router.ts#L7)

React Router v6+ hook references required to create a router adapter.

## Properties

### useLocation()

> **useLocation**: () => `object`

Defined in: [packages/ui/src/adapters/react-router.ts:16](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/adapters/react-router.ts#L16)

#### Returns

`object`

##### pathname

> **pathname**: `string`

***

### useNavigate()

> **useNavigate**: () => (`to`, `options?`) => `void`

Defined in: [packages/ui/src/adapters/react-router.ts:8](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/adapters/react-router.ts#L8)

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

Defined in: [packages/ui/src/adapters/react-router.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/adapters/react-router.ts#L9)

#### Returns

\[`URLSearchParams`, (`params`, `options?`) => `void`\]
