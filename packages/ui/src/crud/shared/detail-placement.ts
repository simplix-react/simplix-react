import { createContext, useContext } from "react";

/**
 * Whether what renders here sits inside a record's detail rather than on the page itself. A detail
 * provides it, so a list, a table or a pager inside one can be drawn as part of the record.
 */
export const DetailPlacementContext = createContext(false);

/** Whether the caller renders inside a record's detail. */
export function useInDetail(): boolean {
  return useContext(DetailPlacementContext);
}
