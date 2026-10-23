import type { ReactNode } from "react";
import { ListIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { Badge } from "../../base/display/badge";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { listTotalBadgeFigureStyle, listTotalBadgeIconStyle, listTotalBadgeStyle } from "./list-total-badge.style";

export interface ListTotalBadgeProps {
  /**
   * Total row count shown in the badge. Pass `undefined` / `null` while the
   * figure is unknown — the first page in flight, a count query that has not
   * answered — and the badge holds its place with an empty value instead of
   * claiming zero. A reader takes `Total 0` as "there is nothing here".
   */
  count?: number | null;
  /**
   * What the badge says instead of the framework's `Total N`, for a total the
   * framework cannot phrase.
   *
   * <p>Some rows are about more than one figure — a tree counting nodes beside a
   * column counting the people under them, 「조직 39개 · 사용자 212명」 — and one
   * number cannot carry that. Before this existed those screens drew their own
   * badge, which is how a plain outline badge came to sit where every other list
   * draws an icon and a framework-translated label: the same row, two shapes.
   * Passing the sentence keeps the shape and replaces only the words.
   *
   * <p>`count` is ignored when this is given, so pass one or the other.
   */
  children?: ReactNode;
}

/**
 * The standard "Total N" leading badge of a list FilterBar. Renders the shared
 * outline badge with the list icon and the framework-translated count label.
 *
 * The badge always occupies the toolbar, whether or not the count is known, so
 * the row does not shift when the value lands.
 */
export function ListTotalBadge({ count, children }: ListTotalBadgeProps) {
  const { t } = useTranslation("simplix/ui");
  const known = children !== undefined || count != null;
  return (
    <Badge variant="outline" aria-busy={known ? undefined : true} {...partAttributes(listTotalBadgeStyle, {})}>
      <ListIcon className="size-3.5" {...slotAttributes(listTotalBadgeIconStyle, {})} />
      {children ?? (count != null ? <TotalSentence text={t("list.totalCount", { count })} count={count} /> : t("list.totalCountUnknown"))}
    </Badge>
  );
}

/**
 * The translated total with its figure marked, so a design can weigh the number apart from the
 * words around it. The sentence stays one run of text: only the figure is wrapped.
 */
function TotalSentence({ text, count }: { text: string; count: number }) {
  const figures = [count.toLocaleString(), String(count)];
  const figure = figures.find((candidate) => text.includes(candidate));
  if (!figure) return <>{text}</>;
  const at = text.indexOf(figure);
  return (
    <span>
      {text.slice(0, at)}
      <span {...slotAttributes(listTotalBadgeFigureStyle, {})}>{figure}</span>
      {text.slice(at + figure.length)}
    </span>
  );
}
