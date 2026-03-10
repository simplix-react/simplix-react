import type { ReactNode } from "react";

import type { UseFadeTransitionResult } from "./use-fade-transition";
import type { UseListDetailStateResult } from "./use-list-detail-state";

/** Props for {@link ListDetailViewSwitch}. */
export interface ListDetailViewSwitchProps {
  state: UseListDetailStateResult;
  fade: UseFadeTransitionResult;
  renderDetail: (entityId: string) => ReactNode;
  renderNew?: () => ReactNode;
  renderEdit?: (entityId: string) => ReactNode;
}

/**
 * Declarative view-switch for list-detail layouts.
 * Replaces the repeated conditional rendering block (~20 lines) in every
 * list-detail page template.
 *
 * @example
 * ```tsx
 * <ListDetail.Detail>
 *   <ListDetail.ViewSwitch
 *     state={state}
 *     fade={fade}
 *     renderDetail={(id) => <PetDetail petId={id} ... />}
 *     renderNew={() => <PetForm ... />}
 *     renderEdit={(id) => <PetForm petId={id} ... />}
 *   />
 * </ListDetail.Detail>
 * ```
 */
export function ListDetailViewSwitch({
  state,
  fade,
  renderDetail,
  renderNew,
  renderEdit,
}: ListDetailViewSwitchProps) {
  if (state.view === "detail" && fade.displayedId) {
    return <div key={`detail-${fade.displayedId}`} style={fade.style} className="flex flex-col flex-1 min-h-0">{renderDetail(fade.displayedId)}</div>;
  }

  if (state.view === "new" && renderNew) {
    return <div key="new" className="flex flex-col flex-1 min-h-0">{renderNew()}</div>;
  }

  if (state.view === "edit" && state.selectedId && renderEdit) {
    return <div key={`edit-${state.selectedId}`} className="flex flex-col flex-1 min-h-0">{renderEdit(state.selectedId)}</div>;
  }

  return null;
}
