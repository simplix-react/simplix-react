import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../utils/cn";
import { Button } from "../../base/controls/button";
import { MagnifyingGlassIcon, XIcon } from "../shared/icons";

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
  const { t } = useTranslation("simplix/ui");
  return (
    <div className={cn("!grow-0 inline-flex items-center", className)}>
      {hasActiveFilters && (
        <Button
          size="icon-sm"
          variant="outline"
          onClick={onClear}
          className="rounded-r-none border-r-0"
          aria-label={clearLabel ?? t("common.clear")}
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="sm"
        onClick={onApply}
        disabled={!isPending}
        className={cn(
          "h-8",
          hasActiveFilters ? "rounded-l-none" : "px-[1.75rem]",
          !onApply && "pointer-events-none invisible",
        )}
        tabIndex={onApply ? 0 : -1}
      >
        <MagnifyingGlassIcon className="mr-1 h-3.5 w-3.5" />
        {applyLabel ?? t("common.search")}
      </Button>
    </div>
  );
}
