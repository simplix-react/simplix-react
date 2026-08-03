import { useTranslation } from "@simplix-react/i18n/react";
import { cn } from "../../utils/cn";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
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
  const { Badge } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const isActive = value !== undefined;

  // The chip and its clear affordance are siblings inside the border, never one inside the other:
  // a control nested in a control leaves the keyboard and assistive technology to guess which of
  // the two a press belongs to, and the guesses disagree.
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm",
        isActive ? "border-solid" : "border-dashed text-muted-foreground",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(isActive ? !value : true)}
        className="inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <ToggleLeftIcon className="h-4 w-4" />
        {label}
      </button>
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
      <button
        type="button"
        tabIndex={isActive ? 0 : -1}
        onClick={() => onChange(undefined)}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !isActive && "pointer-events-none opacity-0",
        )}
        aria-label={t("filter.clearFilter")}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );
}
