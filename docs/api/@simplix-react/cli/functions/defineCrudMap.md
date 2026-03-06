[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/cli](../README.md) / defineCrudMap

# Function: defineCrudMap()

> **defineCrudMap**(`map`): [`CrudMap`](../type-aliases/CrudMap.md)

Defined in: [config/define-crud-map.ts:25](https://github.com/simplix-react/simplix-react/blob/main/config/define-crud-map.ts#L25)

Identity function that provides type-safe autocompletion for `crud.config.ts`.

## Parameters

### map

[`CrudMap`](../type-aliases/CrudMap.md)

Entity name → CRUD operation mapping

## Returns

[`CrudMap`](../type-aliases/CrudMap.md)

The same map object, unchanged

## Example

```ts
// crud.config.ts
import { defineCrudMap } from "@simplix-react/cli";

export default defineCrudMap({
  pet: {
    list: "findPetsByStatus",
    get: "getPetById",
    create: "addPet",
    update: "updatePet",
    delete: "deletePet",
  },
});
```
