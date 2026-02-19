[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / DomainTranslationConfig

# Interface: DomainTranslationConfig

Defined in: domain-translations.ts:7

Configuration for registering domain-specific translations.

Each domain package (e.g., `domain-pet`, `domain-store`) provides
its own translation files via this interface.

## Properties

### domain

> **domain**: `string`

Defined in: domain-translations.ts:9

Unique domain identifier (e.g., `"pet"`, `"store"`).

***

### locales

> **locales**: `Record`\<`string`, () => `Promise`\<\{ `default`: `Record`\<`string`, `unknown`\>; \}\>\>

Defined in: domain-translations.ts:11

Map of locale codes to lazy-loading functions for translation JSON files.
