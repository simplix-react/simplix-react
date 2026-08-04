import { useTranslation } from "@simplix-react/i18n/react";

import { XIcon } from "../shared/icons";

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
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
      aria-label={t("filter.clearField", { label })}
    >
      <XIcon className="h-3 w-3" />
    </button>
  );
}
