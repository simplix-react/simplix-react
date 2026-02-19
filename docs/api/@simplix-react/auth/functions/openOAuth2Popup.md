[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / openOAuth2Popup

# Function: openOAuth2Popup()

> **openOAuth2Popup**(`options`): `Promise`\<[`OAuth2PopupResult`](../type-aliases/OAuth2PopupResult.md)\>

Defined in: [packages/auth/src/helpers/oauth2-popup.ts:26](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/helpers/oauth2-popup.ts#L26)

Opens an OAuth2 authorization flow in a popup window and waits for
the result via `postMessage`.

The popup callback page must call `window.opener.postMessage(data, origin)`.

## Parameters

### options

[`OAuth2PopupOptions`](../interfaces/OAuth2PopupOptions.md)

## Returns

`Promise`\<[`OAuth2PopupResult`](../type-aliases/OAuth2PopupResult.md)\>
