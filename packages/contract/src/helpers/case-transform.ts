/**
 * Converts a camelCase string to snake_case.
 *
 * Also handles hyphenated and space-separated inputs by replacing them with
 * underscores before lowercasing.
 *
 * @param str - The camelCase string to convert.
 * @returns The snake_case equivalent.
 *
 * @example
 * ```ts
 * import { camelToSnake } from "@simplix-react/contract";
 *
 * camelToSnake("doorReader");  // "door_reader"
 * camelToSnake("myEntity");    // "my_entity"
 * camelToSnake("some-field");  // "some_field"
 * ```
 */
export function camelToSnake(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}
