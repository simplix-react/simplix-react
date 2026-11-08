import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { useRouter, type RouterBlockDecision } from "../../adapters/router-provider";
import { ALERT_BUTTON_STRUCTURE, alertCancelAttributes, alertDangerActionAttributes, AlertPanel } from "../shared/alert-panel";
import { useBeforeUnload } from "./use-before-unload";

/** Options for the {@link useUnsavedChanges} hook. */
export interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes. */
  isDirty: boolean;
}

/** Return value of the {@link useUnsavedChanges} hook. */
export interface UseUnsavedChangesReturn {
  /** Wrap navigation callbacks with this to show a confirmation dialog when dirty. */
  guardedNavigate: (callback: () => void) => void;
  /** Alert dialog element to render in your component's JSX. */
  dialog: ReactNode;
}

/**
 * Guard navigation with an unsaved changes confirmation dialog.
 *
 * @remarks
 * Combines `useBeforeUnload` (browser tab close) with an in-app alert dialog. While the form is
 * dirty the dialog is asked for every way out of the route: a callback wrapped in
 * `guardedNavigate`, and, when the router adapter offers `useBlocker`, the browser's Back and
 * Forward and any link or `navigate` call that the page does not wrap. Without a router adapter
 * (or one with no `useBlocker`) only the wrapped callbacks and the tab close are guarded.
 *
 * @param options - {@link UseUnsavedChangesOptions}
 * @returns `guardedNavigate` wrapper and a `dialog` ReactNode to render.
 *
 * @example
 * ```tsx
 * const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty });
 *
 * const handleClose = () => guardedNavigate(() => router.back());
 *
 * return (
 *   <>
 *     <CrudForm onClose={handleClose}>...</CrudForm>
 *     {dialog}
 *   </>
 * );
 * ```
 */
export function useUnsavedChanges({ isDirty }: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const { t } = useTranslation("simplix/ui");
  const router = useRouter();
  // What the open dialog settles: `confirm` lets the leaving go on, `dismiss` stays on the form.
  const [pending, setPending] = useState<{ confirm: () => void; dismiss: () => void } | null>(null);
  // A wrapped callback the reader has confirmed. It runs from an effect, after the render that
  // switches the blocker off, so its own navigation is not held a second time.
  const [confirmed, setConfirmed] = useState<(() => void) | null>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  useBeforeUnload(isDirty);

  const useRouterBlocker = router?.useBlocker;
  const blocking = useRouterBlocker !== undefined;

  const guardedNavigate = useCallback((callback: () => void) => {
    if (!isDirty) {
      callback();
      return;
    }
    // With a blocker in play the callback waits for the render that switches it off; without one
    // it runs as soon as the reader confirms.
    const confirm = blocking ? () => setConfirmed(() => callback) : callback;
    setPending({ confirm, dismiss: () => undefined });
  }, [isDirty, blocking]);

  const onBlocked = useCallback(({ proceed, reset }: RouterBlockDecision) => {
    // A second navigation while the dialog is open (Back pressed twice) stays on the form.
    if (pendingRef.current) {
      reset();
      return;
    }
    setPending({ confirm: proceed, dismiss: reset });
  }, []);

  // An adapter either always has `useBlocker` or never does, so the hook is called in the same
  // order on every render.
  useRouterBlocker?.({ enabled: isDirty && confirmed === null, onBlocked });

  useEffect(() => {
    if (!confirmed) return;
    confirmed();
    setConfirmed(null);
  }, [confirmed]);

  // Settles the open dialog once, whichever control or key closed it.
  const settle = useCallback((choice: "confirm" | "dismiss") => {
    const open = pendingRef.current;
    if (!open) return;
    pendingRef.current = null;
    setPending(null);
    open[choice]();
  }, []);
  const handleConfirm = useCallback(() => settle("confirm"), [settle]);
  const handleCancel = useCallback(() => settle("dismiss"), [settle]);

  const dialog: ReactNode = (
    <AlertPanel
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={t("common.unsavedTitle")}
      description={t("common.unsavedDescription")}
      actions={
        <>
          <AlertDialog.Cancel className={ALERT_BUTTON_STRUCTURE} {...alertCancelAttributes} onClick={handleCancel}>
            {t("common.cancel")}
          </AlertDialog.Cancel>
          <AlertDialog.Action
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={ALERT_BUTTON_STRUCTURE} {...alertDangerActionAttributes}
          >
            {t("common.discard")}
          </AlertDialog.Action>
        </>
      }
    />
  );

  return { guardedNavigate, dialog };
}
