[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / createAppConfig

# Function: createAppConfig()

> **createAppConfig**\<`T`\>(): `object`

Defined in: [packages/ui/src/config/create-app-config.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/config/create-app-config.tsx#L31)

Creates a typed, app-level configuration provider that runs host-injected
queries and distributes their results via context — the framework owns the
provider mechanism, the app injects the fetchers (MenuProvider pattern).

The `filePolicy` key is **reserved**: when present its value (a
FileFieldConfig) is also published to the internal FilePolicy context
so `FileField` / `ImageField` pick it up automatically as the precedence-Y
default (no separate provider, no module wiring).

## Type Parameters

### T

`T` *extends* `object` & `Record`\<`string`, `unknown`\>

## Returns

`object`

### AppConfigProvider()

> **AppConfigProvider**: (`__namedParameters`) => `Element`

#### Parameters

##### \_\_namedParameters

###### children

`ReactNode`

###### queries

`Queries`

#### Returns

`Element`

### useAppConfig()

> **useAppConfig**: () => `Value`

#### Returns

`Value`

### useAppConfigValue()

> **useAppConfigValue**: \<`K`\>(`key`) => `T`\[`K`\] \| `undefined`

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

`T`\[`K`\] \| `undefined`

## Example

```ts
// app side — instantiate once with the project's config types:
export const { AppConfigProvider, useAppConfig, useAppConfigValue } =
  createAppConfig<{ filePolicy: FileFieldConfig; siteConfig: SiteConfig }>();

// compose — inject the fetchers:
<AppConfigProvider queries={{
  filePolicy: { queryKey: ["file-policy"], queryFn: fetchFilePolicy, enabled: isAuth },
  siteConfig: { queryKey: ["site-config"], queryFn: fetchSiteConfig },
}}>

// consume — flat shape (minimal churn):
const site = useAppConfigValue("siteConfig");
```
