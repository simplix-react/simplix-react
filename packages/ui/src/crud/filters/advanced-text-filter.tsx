import { useCallback } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { CaretDownIcon, XIcon } from "../shared/icons";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";
import { operatorConfig } from "./filter-icons";
import {
  crudFilterInputIconStyle,
  crudFilterInputRowStyle,
  crudFilterOperatorMenuStyle,
  crudFilterOperatorTriggerStyle,
} from "./filter-parts.style";
import type { SearchOperator } from "./filter-types";

export interface AdvancedTextFilterProps {
  label?: string;
  value: string;
  operator: SearchOperator;
  onChange: (value: string) => void;
  onOperatorChange: (operator: SearchOperator) => void;
  operators: SearchOperator[];
  defaultOperator?: SearchOperator;
  placeholder?: string;
  className?: string;
}

export function AdvancedTextFilter({
  label,
  value,
  operator,
  onChange,
  onOperatorChange,
  operators,
  defaultOperator,
  placeholder,
  className,
}: AdvancedTextFilterProps) {
  const { Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const currentOp = operatorConfig[operator];

  const handleOperatorChange = useCallback(
    (newOp: SearchOperator) => {
      onOperatorChange(newOp);
    },
    [onOperatorChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
    if (defaultOperator && operator !== defaultOperator) {
      onOperatorChange(defaultOperator);
    }
  }, [onChange, onOperatorChange, operator, defaultOperator]);

  return (
    <div
      className={cn("relative flex flex-row items-center", className)}
      {...slotAttributes(crudFilterInputRowStyle, { lead: operators.length > 1 ? "operator" : "icon" })}
    >
      {operators.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute left-0 z-10 inline-flex h-8 items-center"
              aria-label={t("filter.selectOperator")}
              {...slotAttributes(crudFilterOperatorTriggerStyle, { attach: "joined" })}
            >
              <currentOp.icon className="h-3.5 w-3.5" />
              <CaretDownIcon className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div {...slotAttributes(crudFilterOperatorMenuStyle, {})}>
              {operators.map((op) => {
                const meta = operatorConfig[op];
                return (
                  <DropdownMenuItem
                    key={op}
                    onClick={() => handleOperatorChange(op)}
                    data-current={op === operator}
                  >
                    <meta.icon className="h-3.5 w-3.5" />
                    {t(meta.labelKey)}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="absolute left-2.5" {...slotAttributes(crudFilterInputIconStyle, {})}>
          <currentOp.icon className="h-4 w-4" />
        </span>
      )}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label ?? t(currentOp.labelKey)}
        className="h-8"
        aria-label={label ?? t(currentOp.labelKey)}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 inline-flex h-4 w-4 items-center justify-center"
          aria-label={t("filter.clearFilter")}
          {...slotAttributes(crudFieldClearButtonStyle, {})}
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
