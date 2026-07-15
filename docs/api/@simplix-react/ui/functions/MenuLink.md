[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / MenuLink

# Function: MenuLink()

> **MenuLink**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/menu/menu-link.tsx:24](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/menu/menu-link.tsx#L24)

Router-agnostic menu link.

Internal links navigate via the [RouterContext](../variables/RouterContext.md) adapter (SPA). When no
adapter is provided (no `<RouterContext.Provider>`), or for external / BLANK /
WINDOW targets, it renders a plain anchor. Modifier-clicks (cmd/ctrl/shift/alt,
middle/right button) fall through to native browser handling so new-tab works.

## Parameters

### \_\_namedParameters

`MenuLinkProps`

## Returns

`Element`
