import type { ApiContractConfig, EntityDefinition, EntityOperationDef } from "@simplix-react/contract";
import { resolveRole } from "@simplix-react/contract";

/**
 * Creates an in-memory mock API client that mirrors the shape of a real
 * {@link @simplix-react/contract!ApiContract | ApiContract} client without requiring MSW or any network layer.
 *
 * @remarks
 * Each entity operation receives a mock function based on its CRUD role.
 * CRUD role operations (list, get, create, update, delete, tree) are backed
 * by a plain array. Non-CRUD operations return `null` by default.
 * Data mutations (create, update, delete) modify the provided arrays in place.
 *
 * @typeParam TEntities - The entity map derived from an {@link ApiContractConfig}.
 * @param config - An object containing the `entities` definition from your API contract.
 * @param data - A record whose keys match entity names and whose values are
 *   arrays of seed data. Missing keys default to an empty array.
 * @returns A record keyed by entity name, where each value exposes operation methods.
 *
 * @example
 * ```ts
 * import { createMockClient } from "@simplix-react/testing";
 * import { contract } from "./my-contract";
 *
 * const mockClient = createMockClient(contract.config, {
 *   product: [{ id: "1", name: "Widget" }],
 * });
 *
 * const products = await mockClient.product.list();
 * // [{ id: "1", name: "Widget" }]
 *
 * await mockClient.product.create({ name: "Gadget" });
 * // product array now contains two items
 * ```
 */
export function createMockClient<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEntities extends Record<string, EntityDefinition<any, any>>,
>(
  config: Pick<ApiContractConfig<TEntities>, "entities">,
  data: Record<string, unknown[]>,
) {
  const result: Record<string, unknown> = {};

  for (const entityName of Object.keys(config.entities)) {
    const entity = config.entities[entityName];
    const entityData = data[entityName] ?? [];
    const entityClient: Record<string, unknown> = {};

    for (const [opName, op] of Object.entries(entity.operations) as [string, EntityOperationDef][]) {
      const role = resolveRole(opName, op);

      switch (role) {
        case "list": {
          entityClient[opName] = () => Promise.resolve(entityData);
          break;
        }
        case "get": {
          entityClient[opName] = (id: string) => {
            const item = entityData.find(
              (d) => (d as Record<string, unknown>).id === id,
            );
            if (!item) return Promise.reject(new Error(`Not found: ${id}`));
            return Promise.resolve(item);
          };
          break;
        }
        case "create": {
          entityClient[opName] = (_parentIdOrDto: unknown, dto?: unknown) => {
            const newItem = {
              id: crypto.randomUUID(),
              ...(typeof _parentIdOrDto === "string" ? (dto as object) : (_parentIdOrDto as object)),
            };
            entityData.push(newItem);
            return Promise.resolve(newItem);
          };
          break;
        }
        case "update": {
          entityClient[opName] = (id: string, dto: unknown) => {
            const idx = entityData.findIndex(
              (d) => (d as Record<string, unknown>).id === id,
            );
            if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
            entityData[idx] = { ...entityData[idx] as object, ...(dto as object) };
            return Promise.resolve(entityData[idx]);
          };
          break;
        }
        case "delete": {
          entityClient[opName] = (id: string) => {
            const idx = entityData.findIndex(
              (d) => (d as Record<string, unknown>).id === id,
            );
            if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
            entityData.splice(idx, 1);
            return Promise.resolve();
          };
          break;
        }
        case "tree": {
          entityClient[opName] = () => Promise.resolve([]);
          break;
        }
        default: {
          entityClient[opName] = () => Promise.resolve(null);
          break;
        }
      }
    }

    result[entityName] = entityClient;
  }

  return result;
}
