import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { Badge } from "../../base/display/badge";
import { Separator } from "../../base/display/separator";
import { ToggleLeftIcon, XIcon } from "../shared/icons";

export interface ToggleFilterProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  className?: string;
}

export function ToggleFilter({
  label,
  value,
  onChange,
  className,
}: ToggleFilterProps) {
  const { t } = useTranslation("simplix/ui");
  const isActive = value !== undefined;

  return (
    <button
      type="button"
      onClick={() => onChange(isActive ? !value : true)}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
        isActive ? "border-solid" : "border-dashed text-muted-foreground",
        className,
      )}
    >
      <ToggleLeftIcon className="h-4 w-4" />
      {label}
      <Separator
        orientation="vertical"
        className={cn("mx-1 h-4", !isActive && "opacity-0")}
      />
      <Badge
        variant="secondary"
        className={cn(
          "w-[2.25rem] justify-center font-normal",
          !isActive && "opacity-0",
        )}
      >
        {value ? t("common.yes") : t("common.no")}
      </Badge>
      <span
        role="button"
        tabIndex={isActive ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation();
          onChange(undefined);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            e.preventDefault();
            onChange(undefined);
          }
        }}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
          !isActive && "pointer-events-none opacity-0",
        )}
        aria-label={t("filter.clearFilter")}
      >
        <XIcon className="h-3 w-3" />
      </span>
    </button>
  );
}
