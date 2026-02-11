import type { ApiContractConfig, EntityDefinition, ListParams } from "@simplix-react/contract";

/**
 * Creates an in-memory mock API client that mirrors the shape of a real
 * {@link @simplix-react/contract!ApiContract | ApiContract} client without requiring MSW or any network layer.
 *
 * @remarks
 * Each entity receives a record with `list`, `get`, `create`, `update`, and
 * `delete` methods backed by a plain array. Data mutations (create, update,
 * delete) modify the provided arrays in place, which makes it straightforward
 * to seed and inspect state within a single test.
 *
 * This utility is ideal for unit testing React Query hooks in isolation, where
 * full HTTP mocking would add unnecessary overhead.
 *
 * @typeParam TEntities - The entity map derived from an {@link ApiContractConfig}.
 * @param config - An object containing the `entities` definition from your API contract.
 * @param data - A record whose keys match entity names and whose values are
 *   arrays of seed data. Missing keys default to an empty array.
 * @returns A record keyed by entity name, where each value exposes the standard
 *   CRUD methods (`list`, `get`, `create`, `update`, `delete`).
 *
 * @example
 * ```ts
 * import { createMockClient } from "@simplix-react/testing";
 * import { contract } from "./my-contract";
 *
 * const mockClient = createMockClient(contract.config, {
 *   users: [{ id: "1", name: "Alice" }],
 * });
 *
 * const users = await mockClient.users.list();
 * // [{ id: "1", name: "Alice" }]
 *
 * await mockClient.users.create({ name: "Bob" });
 * // users array now contains two items
 * ```
 */
export function createMockClient<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEntities extends Record<string, EntityDefinition<any, any, any>>,
>(
  config: Pick<ApiContractConfig<TEntities>, "entities">,
  data: Record<string, unknown[]>,
) {
  const result: Record<string, unknown> = {};

  for (const entityName of Object.keys(config.entities)) {
    const entityData = data[entityName] ?? [];

    result[entityName] = {
      list(_parentIdOrParams?: string | ListParams, _params?: ListParams) {
        return Promise.resolve(entityData);
      },
      get(id: string) {
        const item = entityData.find(
          (d) => (d as Record<string, unknown>).id === id,
        );
        if (!item) return Promise.reject(new Error(`Not found: ${id}`));
        return Promise.resolve(item);
      },
      create(_parentIdOrDto: unknown, dto?: unknown) {
        const newItem = {
          id: crypto.randomUUID(),
          ...(typeof _parentIdOrDto === "string" ? (dto as object) : (_parentIdOrDto as object)),
        };
        entityData.push(newItem);
        return Promise.resolve(newItem);
      },
      update(id: string, dto: unknown) {
        const idx = entityData.findIndex(
          (d) => (d as Record<string, unknown>).id === id,
        );
        if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
        entityData[idx] = { ...entityData[idx] as object, ...(dto as object) };
        return Promise.resolve(entityData[idx]);
      },
      delete(id: string) {
        const idx = entityData.findIndex(
          (d) => (d as Record<string, unknown>).id === id,
        );
        if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
        entityData.splice(idx, 1);
        return Promise.resolve();
      },
    };
  }

  return result;
}
