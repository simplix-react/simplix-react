import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { MagnifyingGlassIcon, XIcon } from "../shared/icons";
import { crudFilterActionsStyle } from "./filter-actions.style";

export interface FilterActionsProps {
  onClear: () => void;
  hasActiveFilters: boolean;
  onApply?: () => void;
  isPending?: boolean;
  clearLabel?: string;
  applyLabel?: string;
  className?: string;
}

export function FilterActions({
  onClear,
  hasActiveFilters,
  onApply,
  isPending,
  clearLabel,
  applyLabel,
  className,
}: FilterActionsProps) {
  const { Button } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  return (
    <div
      className={cn("!grow-0 inline-flex items-center", className)}
      {...slotAttributes(crudFilterActionsStyle, { active: hasActiveFilters })}
    >
      {hasActiveFilters && (
        <Button
          size="icon-sm"
          variant="outline"
          onClick={onClear}
          aria-label={clearLabel ?? t("common.clear")}
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="sm"
        onClick={onApply}
        disabled={!isPending}
        className={cn("h-8", !onApply && "pointer-events-none invisible")}
        tabIndex={onApply ? 0 : -1}
      >
        <MagnifyingGlassIcon className="h-3.5 w-3.5" />
        {applyLabel ?? t("common.search")}
      </Button>
    </div>
  );
}
