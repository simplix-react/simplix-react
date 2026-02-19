[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UseAutosaveOptions

# Interface: UseAutosaveOptions

Defined in: [packages/ui/src/crud/form/use-autosave.ts:7](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L7)

Configuration options for the [useAutosave](../functions/useAutosave.md) hook.

## Properties

### debounceMs?

> `optional` **debounceMs**: `number`

Defined in: [packages/ui/src/crud/form/use-autosave.ts:13](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L13)

Debounce interval in milliseconds. Defaults to 2000.

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [packages/ui/src/crud/form/use-autosave.ts:15](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L15)

Enable or disable autosave. Defaults to true.

***

### hasErrors?

> `optional` **hasErrors**: `boolean`

Defined in: [packages/ui/src/crud/form/use-autosave.ts:17](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L17)

Whether the form currently has validation errors. Skips save if true.

***

### onSave()

> **onSave**: (`values`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/ui/src/crud/form/use-autosave.ts:11](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L11)

Callback invoked with the current values when autosave triggers.

#### Parameters

##### values

`Record`\<`string`, `unknown`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### values

> **values**: `Record`\<`string`, `unknown`\>

Defined in: [packages/ui/src/crud/form/use-autosave.ts:9](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/form/use-autosave.ts#L9)

Current form values to watch for changes.
