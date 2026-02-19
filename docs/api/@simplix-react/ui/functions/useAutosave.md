[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useAutosave

# Function: useAutosave()

> **useAutosave**(`__namedParameters`): [`UseAutosaveReturn`](../interfaces/UseAutosaveReturn.md)

Defined in: [packages/ui/src/crud/form/use-autosave.ts:35](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/crud/form/use-autosave.ts#L35)

Debounced autosave hook that watches form values for changes.
Automatically saves after a configurable debounce interval.
Skips save when the form has validation errors.

## Parameters

### \_\_namedParameters

[`UseAutosaveOptions`](../interfaces/UseAutosaveOptions.md)

## Returns

[`UseAutosaveReturn`](../interfaces/UseAutosaveReturn.md)
