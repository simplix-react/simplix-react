import { type ReactElement, useCallback } from "react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import type { CrudMutation } from "../form/use-crud-form-submit";

import { type DeleteTarget, useCrudDeleteList } from "./use-crud-delete";

/** Labels required by the {@link useCrudDeleteWired} hook. */
export interface CrudDeleteWiredLabels {
  title: (target: DeleteTarget) => string;
  description: (target: DeleteTarget) => string;
  cancel: string;
  delete: string;
  deleting: string;
}

/** Options for {@link useCrudDeleteWired}. */
export interface UseCrudDeleteWiredOptions {
  deleteMutation: CrudMutation<string | number>;
  labels: CrudDeleteWiredLabels;
  onDeleted?: () => void;
}

/** Return type of {@link useCrudDeleteWired}. */
export interface UseCrudDeleteWiredResult {
  requestDelete: (target: DeleteTarget) => void;
  deleteDialog: ReactElement | null;
}

/**
 * Combines {@link useCrudDeleteList} state + {@link CrudDelete} rendering into
 * a single hook.  Eliminates the ~12-line boilerplate that every list/list-detail
 * page currently repeats.
 *
 * @example
 * ```tsx
 * const { requestDelete, deleteDialog } = useCrudDeleteWired({
 *   deleteMutation: adaptOrvalDelete(useDeletePet(), "petId"),
 *   labels: {
 *     title: (t) => i18n("deletePetTitle"),
 *     description: (t) => i18n("deletePetDesc", { name: t.name }),
 *     cancel: i18n("cancel"),
 *     delete: i18n("delete"),
 *     deleting: i18n("deleting"),
 *   },
 * });
 * ```
 */
export function useCrudDeleteWired(
  options: UseCrudDeleteWiredOptions,
): UseCrudDeleteWiredResult {
  const { deleteMutation, labels, onDeleted } = options;
  const del = useCrudDeleteList();

  const handleConfirm = useCallback(() => {
    if (!del.target) return;
    deleteMutation.mutate(del.target.id, {
      onSuccess: () => {
        del.cancel();
        onDeleted?.();
      },
    });
  }, [del.target, del.cancel, deleteMutation, onDeleted]);

  const { CrudDelete } = useFlatUIComponents();

  const deleteDialog: ReactElement | null = del.target ? (
    <CrudDelete
      open={del.open}
      onOpenChange={(o) => {
        if (!o) del.cancel();
      }}
      onConfirm={handleConfirm}
      title={labels.title(del.target)}
      description={labels.description(del.target)}
      loading={deleteMutation.isPending}
      cancelLabel={labels.cancel}
      deleteLabel={labels.delete}
      deletingLabel={labels.deleting}
    />
  ) : null;

  return { requestDelete: del.requestDelete, deleteDialog };
}
