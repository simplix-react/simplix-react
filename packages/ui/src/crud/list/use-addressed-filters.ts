import { useEffect, useRef, useState } from "react";

import {
  addressedFiltersKey,
  decodeAddressedFilters,
  encodeAddressedFilters,
  type AddressedFilters,
} from "./addressed-filters";

/** The committed values the address stands for, read the way the list reads them. */
function decodeAddress(addressed: AddressedFilters): Record<string, unknown> {
  return decodeAddressedFilters(addressed.value, { controls: addressed.controls, forced: addressed.forced });
}

/**
 * The filters a list starts with: the address's when it names any, otherwise the list's defaults.
 *
 * @param addressed - Where the filters live.
 * @param defaults - The list's `defaultFilters`.
 */
export function initialAddressedFilters(
  addressed: AddressedFilters,
  defaults: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return addressed.value === undefined && defaults !== undefined ? defaults : decodeAddress(addressed);
}

/** What {@link useAddressedFilters} reads and writes. */
interface UseAddressedFiltersOptions {
  /** Where the filters live, or `undefined` for a list that keeps them to itself. */
  readonly addressed: AddressedFilters | undefined;
  /** The list's committed filter values. */
  readonly committed: Record<string, unknown>;
  /** Replaces the list's pending and committed filters and returns it to the first page. */
  readonly adopt: (values: Record<string, unknown>) => void;
}

/**
 * Keeps a list's committed filters and the filters in the address equal, both ways.
 *
 * <p><b>List to address.</b> When the committed filters change and the address does not already say
 * the same, they are handed to `onChange`, which writes them with `replace`. The list never reads
 * its own write back as news: each value handed out is remembered until the address shows it, so a
 * second change made before the first one came back is not undone by the first one arriving.
 *
 * <p><b>Address to list.</b> When the address changes to something the list did not write (a link
 * followed from another screen, Back, the same screen's menu entry), the list adopts it and returns
 * to its first page. A list whose address then names no filters has none.
 *
 * <p>A list opened with defaults and an address that names none starts on the defaults without
 * writing them: nothing is handed to `onChange` until the reader changes a filter.
 *
 * <p>With `addressed` absent every part of this is inert, so a list that does not use it behaves as
 * it always did.
 */
export function useAddressedFilters({ addressed, committed, adopt }: UseAddressedFiltersOptions): void {
  // Both sides are compared in one canonical form: the address read as the list reads it and
  // written back, so "A" under `status.in` and `["A"]` are the same filter.
  const addressKey = addressed === undefined ? "" : addressedFiltersKey(encodeAddressedFilters(decodeAddress(addressed)));
  const committedKey = addressedFiltersKey(encodeAddressedFilters(committed));

  // The latest props, read by the write effect without making it depend on a handler whose identity
  // changes with every address.
  const latest = useRef({ addressed, committed, addressKey });
  useEffect(() => {
    latest.current = { addressed, committed, addressKey };
  });

  // What this list has handed to `onChange` and the address has not shown yet.
  const written = useRef<string[]>([]);
  // The committed filters the address is known to stand for. At mount that is whatever the list
  // started with, defaults included.
  const synced = useRef(committedKey);

  // Address to list, decided while rendering so the list never sends a request for the filters it
  // is about to leave.
  const [seen, setSeen] = useState(addressKey);
  if (addressed !== undefined && addressKey !== seen) {
    setSeen(addressKey);
    const ours = addressKey === committedKey || written.current.includes(addressKey);
    if (!ours) adopt(decodeAddress(addressed));
  }

  // The address has shown what it was shown: forget the writes up to it.
  useEffect(() => {
    const index = written.current.indexOf(addressKey);
    if (index >= 0) written.current.splice(0, index + 1);
    else if (addressKey === committedKey) written.current.length = 0;
  }, [addressKey, committedKey]);

  // List to address.
  useEffect(() => {
    if (committedKey === synced.current) return;
    synced.current = committedKey;
    const { addressed: target, committed: values, addressKey: shown } = latest.current;
    if (target === undefined || committedKey === shown) return;
    written.current.push(committedKey);
    target.onChange(encodeAddressedFilters(values));
  }, [committedKey]);
}
