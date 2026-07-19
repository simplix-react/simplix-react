export { BottomSheet } from "./bottom-sheet";
export type { BottomSheetProps } from "./bottom-sheet";

export { Dialog, DialogClose } from "./dialog";
export type { DialogProps } from "./dialog";

export { AlertDialog } from "./alert-dialog";
export type { AlertDialogProps } from "./alert-dialog";

export { Popover } from "./popover";
export type { PopoverProps } from "./popover";

// Portal host for rn-primitives overlays (Dialog/AlertDialog/Popover).
// Mounted by the runtime provider; apps composing manually mount it last.
export { PortalHost as OverlayPortalHost } from "@rn-primitives/portal";
