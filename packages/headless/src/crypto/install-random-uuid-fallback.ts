/**
 * A version 4 UUID built from `crypto.getRandomValues`, which every context has.
 *
 * @param fill - Fills a byte array with random values; `crypto.getRandomValues` by default.
 * @returns A lowercase RFC 9562 version 4 UUID.
 */
export function randomUUIDFrom(fill: (bytes: Uint8Array) => Uint8Array): `${string}-${string}-${string}-${string}-${string}` {
  const bytes = fill(new Uint8Array(16));
  // Version 4 in the high nibble of byte 6, the RFC variant (10xx) in the high bits of byte 8.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Gives a page with no `crypto.randomUUID` one that works.
 *
 * @remarks
 * Browsers expose `crypto.randomUUID` only in a secure context. `localhost` counts as one, and
 * `http://` at a LAN address does not, which is how an on-premises app is normally reached from
 * the next desk; there every call that names a new record client-side throws. `getRandomValues`
 * has no such restriction, so the fill builds the same version 4 UUID from it. It is installed
 * ONLY where the browser left the method undefined, so a page with the real one keeps it. Call it
 * once at boot, beside `installClipboardFallback`.
 *
 * @returns Whether a fill was installed, which is false where the method already exists or there
 *   is no `crypto` at all.
 */
export function installRandomUUIDFallback(): boolean {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") return false;
  if (typeof crypto.randomUUID === "function") return false;
  Object.defineProperty(crypto, "randomUUID", {
    configurable: true,
    enumerable: false,
    writable: true,
    value: () => randomUUIDFrom((bytes) => crypto.getRandomValues(bytes)),
  });
  return true;
}
