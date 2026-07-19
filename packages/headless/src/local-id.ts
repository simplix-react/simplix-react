/**
 * Generate a client-only id from a millisecond timestamp and a base36 random suffix.
 *
 * @remarks
 * Stable enough for keys and toast ids; never sent to the server.
 *
 * @returns A local id string (e.g. `"1700000000000-a1b2c3d4e"`).
 */
export function generateLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
