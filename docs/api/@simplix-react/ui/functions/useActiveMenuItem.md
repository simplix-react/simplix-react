[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useActiveMenuItem

# Function: useActiveMenuItem()

> **useActiveMenuItem**(`options?`): [`NavigationItem`](../interfaces/NavigationItem.md) \| `undefined`

Defined in: [packages/ui/src/menu/use-active-menu-item.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/use-active-menu-item.ts#L18)

Returns the menu item matching the current route, or undefined.

Matching is delegated to the host router (via [RouteMatcherContext](../variables/RouteMatcherContext.md))
instead of string prefix comparison — so route boundaries and dynamic
params are handled correctly. Among all matches the most specific (longest
href) wins; ties resolve deterministically by tree order.

Requires a [RouteMatcherProvider](RouteMatcherProvider.md) above in the tree; without it
(no router match capability injected) this returns undefined.

## Parameters

### options?

[`UseActiveMenuItemOptions`](../interfaces/UseActiveMenuItemOptions.md) = `{}`

## Returns

[`NavigationItem`](../interfaces/NavigationItem.md) \| `undefined`
