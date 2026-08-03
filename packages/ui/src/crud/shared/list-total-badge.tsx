import { ListIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Badge } from "../../base/display/badge";

export interface ListTotalBadgeProps {
  /**
   * Total row count shown in the badge. Pass `undefined` / `null` while the
   * figure is unknown — the first page in flight, a count query that has not
   * answered — and the badge holds its place with an empty value instead of
   * claiming zero. A reader takes `Total 0` as "there is nothing here".
   */
  count?: number | null;
}

/**
 * The standard "Total N" leading badge of a list FilterBar. Renders the shared
 * outline badge with the list icon and the framework-translated count label.
 *
 * The badge always occupies the toolbar, whether or not the count is known, so
 * the row does not shift when the value lands.
 */
export function ListTotalBadge({ count }: ListTotalBadgeProps) {
  const { t } = useTranslation("simplix/ui");
  const known = count != null;
  return (
    <Badge variant="outline" className="gap-1.5 font-normal" aria-busy={known ? undefined : true}>
      <ListIcon className="size-3.5 text-muted-foreground" />
      {known ? t("list.totalCount", { count }) : t("list.totalCountUnknown")}
    </Badge>
  );
}
