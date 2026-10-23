import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import {
  crudModalSidebarBlockStyle,
  crudModalSidebarRowStyle,
  crudModalSidebarTitleStyle,
} from "./modal-sidebar.style";

/* ============================ ModalSidebar =============================
 *
 * Compact key→value row grid for detail/form modal sidebars. Presentational
 * shell — all content text (block title, row label, row value) is injected by
 * the consumer as ReactNode, resolved via the consumer's own
 * useTranslation/useEntityTranslation. The only internally-translated string is
 * the on/off boolean badge's aria-label, which follows the framework shell
 * idiom (`onLabel ?? t("common.on")`).
 */

export interface ModalSidebarProps {
  children: ReactNode;
}

function ModalSidebarRoot({ children }: ModalSidebarProps) {
  return <div>{children}</div>;
}

export interface ModalSidebarBlockProps {
  title: ReactNode;
  children: ReactNode;
}

function ModalSidebarBlock({ title, children }: ModalSidebarBlockProps) {
  const { Text } = useFlatUIComponents();
  return (
    <div {...slotAttributes(crudModalSidebarBlockStyle, {})}>
      <Text as="div" size="caption" tone="muted" {...partAttributes(crudModalSidebarTitleStyle, {})}>
        {title}
      </Text>
      <div>{children}</div>
    </div>
  );
}

export interface ModalSidebarRowProps {
  label: ReactNode;
  value?: ReactNode;
  bool?: boolean;
  on?: boolean;
  /** aria-label for the on/off badge in the `on` state. Defaults to `t("common.on")`. */
  onLabel?: string;
  /** aria-label for the on/off badge in the `off` state. Defaults to `t("common.off")`. */
  offLabel?: string;
  /** Editable control (form mode) — overrides value / bool. */
  children?: ReactNode;
}

function ModalSidebarRow({ label, value, bool, on, onLabel, offLabel, children }: ModalSidebarRowProps) {
  const { t } = useTranslation("simplix/ui");
  const { Badge, Text } = useFlatUIComponents();
  const isEmpty = value == null || value === "−" || value === "";
  return (
    <div
      className="grid grid-cols-[1fr_120px] items-center"
      {...slotAttributes(crudModalSidebarRowStyle, {})}
    >
      <Text as="span" size="caption" tone="muted">
        {label}
      </Text>
      {children ? (
        <div className="flex justify-self-end">{children}</div>
      ) : bool ? (
        <Badge
          variant={on ? "default" : "secondary"}
          className="justify-self-end"
          aria-label={on ? (onLabel ?? t("common.on")) : (offLabel ?? t("common.off"))}
        >
          {on ? <Check className="size-3" /> : <Minus className="size-3" />}
        </Badge>
      ) : (
        <Text
          as="span"
          size="caption"
          align="end"
          tone={isEmpty ? "muted" : "default"}
          className="justify-self-end"
        >
          {value}
        </Text>
      )}
    </div>
  );
}

export const ModalSidebar = Object.assign(ModalSidebarRoot, {
  Block: ModalSidebarBlock,
  Row: ModalSidebarRow,
});
