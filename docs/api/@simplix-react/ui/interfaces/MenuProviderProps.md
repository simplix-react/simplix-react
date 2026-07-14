[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MenuProviderProps

# Interface: MenuProviderProps

Defined in: [packages/ui/src/menu/menu-types.ts:80](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L80)

## Properties

### children

> **children**: `ReactNode`

Defined in: [packages/ui/src/menu/menu-types.ts:89](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L89)

***

### fetchMenuTree()

> **fetchMenuTree**: (`menuCode`, `signal?`) => `Promise`\<[`MenuNode`](MenuNode.md)[]\>

Defined in: [packages/ui/src/menu/menu-types.ts:81](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L81)

#### Parameters

##### menuCode

`string`

##### signal?

`AbortSignal`

#### Returns

`Promise`\<[`MenuNode`](MenuNode.md)[]\>

***

### fixedGroups?

> `optional` **fixedGroups**: [`FixedMenuGroup`](FixedMenuGroup.md)[]

Defined in: [packages/ui/src/menu/menu-types.ts:83](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L83)

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/menu/menu-types.ts:85](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L85)

***

### menuGroups

> **menuGroups**: [`MenuGroupConfig`](MenuGroupConfig.md)[]

Defined in: [packages/ui/src/menu/menu-types.ts:82](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L82)

***

### permissionFilter?

> `optional` **permissionFilter**: [`MenuPermissionFilter`](../type-aliases/MenuPermissionFilter.md)

Defined in: [packages/ui/src/menu/menu-types.ts:84](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L84)

***

### staleTime?

> `optional` **staleTime**: `number`

Defined in: [packages/ui/src/menu/menu-types.ts:88](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-types.ts#L88)
