import { ListIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Badge } from "../../base/display/badge";

export interface ListTotalBadgeProps {
  /** Total row count shown in the badge. */
  count: number;
}

/**
 * The standard "Total N" leading badge of a list FilterBar. Renders the shared
 * outline badge with the list icon and the framework-translated count label.
 */
export function ListTotalBadge({ count }: ListTotalBadgeProps) {
  const { t } = useTranslation("simplix/ui");
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <ListIcon className="size-3.5 text-muted-foreground" />
      {t("list.totalCount", { count })}
    </Badge>
  );
}
