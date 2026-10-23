import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { XIcon } from "../shared/icons";
import { crudFieldClearButtonStyle } from "./field-clear-button.style";

export interface FieldClearButtonProps {
  onClick: () => void;
  label: string;
}

export function FieldClearButton({ onClick, label }: FieldClearButtonProps) {
  const { t } = useTranslation("simplix/ui");
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
      {...slotAttributes(crudFieldClearButtonStyle, {})}
      aria-label={t("filter.clearField", { label })}
    >
      <XIcon className="h-3 w-3" />
    </button>
  );
}
