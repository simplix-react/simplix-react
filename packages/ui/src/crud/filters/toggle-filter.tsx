import { useTranslation } from "@simplix-react/i18n/react";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { Separator } from "../../base/display/separator";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { ToggleLeftIcon, XIcon } from "../shared/icons";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import {
  crudFilterChipStyle,
  crudFilterChipTriggerStyle,
} from "./filter-parts.style";

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
      className={cn("inline-flex h-8 items-center", className)}
      {...slotAttributes(crudFilterChipStyle, { filled: isActive })}
    >
      <button
        type="button"
        onClick={() => onChange(isActive ? !value : true)}
        className="inline-flex items-center"
        {...slotAttributes(crudFilterChipTriggerStyle, {})}
      >
        <ToggleLeftIcon className="h-4 w-4" />
        {label}
      </button>
      <Separator orientation="vertical" className="h-4" />
      <Badge variant="secondary" className="w-[2.25rem] justify-center">
        {value ? t("common.yes") : t("common.no")}
      </Badge>
      <button
        type="button"
        tabIndex={isActive ? 0 : -1}
        onClick={() => onChange(undefined)}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center",
          !isActive && "pointer-events-none",
        )}
        aria-label={t("filter.clearFilter")}
        {...slotAttributes(crudFieldClearButtonStyle, { ring: true, hidden: !isActive })}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );
}
