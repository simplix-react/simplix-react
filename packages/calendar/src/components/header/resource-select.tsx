import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@simplix-react/ui";

import { useCalendarResourceFilter } from "../../context/calendar-context";
import { useCalendarTranslation } from "../../lib/use-calendar-translation";
import { ResourceAvatar } from "../resource-avatar";

/** Dropdown that filters items down to a single resource (or all). */
export function ResourceSelect() {
  const { selectedResourceId, setSelectedResourceId, resources } = useCalendarResourceFilter();
  const { t } = useCalendarTranslation();

  if (resources.length === 0) return null;

  return (
    <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">{t("userSelect.all")}</SelectItem>

        {resources.map((resource) => (
          <SelectItem key={resource.id} value={resource.id} className="flex-1">
            <div className="flex items-center gap-2">
              <ResourceAvatar name={resource.name} src={resource.avatarUrl} />
              <p className="truncate">{resource.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
