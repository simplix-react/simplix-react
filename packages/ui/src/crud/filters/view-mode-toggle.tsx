import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { useCrudListColumns } from "../shared/column-context";
import { LayoutGridIcon, RowsIcon } from "../shared/icons";
import { crudFilterBarSegmentStyle, crudFilterBarViewButtonStyle } from "./filter-bar.style";

/**
 * The list/grid switch of a list whose table declares `gridView`. It draws nothing otherwise, and
 * nothing while the list is narrower than its `cardBreakpoint`, where cards are forced and there is
 * no second view to switch to.
 *
 * <p>The filter bar draws it inside its leading group. A list with no filter bar places it in its own
 * toolbar, so the switch is one control wherever it stands. Reads the enclosing `CrudList`.
 */
export function ViewModeToggle() {
  const { t } = useTranslation("simplix/ui");
  const columnCtx = useCrudListColumns();
  if (!columnCtx?.canGridView || columnCtx.responsiveCardMode) return null;
  return (
    <div
      role="group"
      aria-label={t("list.viewMode")}
      className="box-border inline-flex h-8 items-center"
      {...slotAttributes(crudFilterBarSegmentStyle, { spaced: false })}
    >
      {([
        { mode: "list", Icon: RowsIcon, label: t("list.viewList") },
        { mode: "grid", Icon: LayoutGridIcon, label: t("list.viewGrid") },
      ] as const).map(({ mode, Icon, label }) => {
        const active = columnCtx.viewMode === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => columnCtx.setViewMode(mode)}
            className="inline-grid h-full w-7 place-items-center"
            {...slotAttributes(crudFilterBarViewButtonStyle, { active })}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
