import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import {
  toastActionStyle,
  toastContainerStyle,
  toastDismissStyle,
  toastIconStyle,
  toastMessageStyle,
  toastStyle,
} from "./toast-container.style";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from "../../crud/shared/icons";
import { Button } from "../controls/button";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { useToastStore, removeToast, type Toast } from "./toast-store";

const typeIcon: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircleIcon className="size-4 shrink-0" />,
  warning: <AlertTriangleIcon className="size-4 shrink-0" />,
  error: <XCircleIcon className="size-4 shrink-0" />,
  info: <InfoIcon className="size-4 shrink-0" />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const { t } = useTranslation("simplix/ui");
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => cancelAnimationFrame(enterTimer);
  }, []);

  const phase = isExiting ? "exiting" : isEntering ? "entering" : "shown";

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      role={toast.type === "error" || toast.type === "warning" ? "alert" : "status"}
      className="pointer-events-auto w-80"
      {...slotAttributes(toastStyle, { type: toast.type, phase })}
    >
      <Flex align="start" gap="sm">
        <span className="flex shrink-0" {...slotAttributes(toastIconStyle, { type: toast.type })}>
          {typeIcon[toast.type]}
        </span>
        <Stack gap="xs" className="flex-1 min-w-0">
          <span {...slotAttributes(toastMessageStyle, {})}>{toast.message}</span>
          {toast.action && (
            <a
              href={toast.action.href}
              {...slotAttributes(toastActionStyle, {})}
            >
              {toast.action.label} {"\u2192"}
            </a>
          )}
        </Stack>
        <div className="flex shrink-0" {...slotAttributes(toastDismissStyle, {})}>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("common.close")}
            onClick={handleDismiss}
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
      </Flex>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore();
  const containerRef = useRef<HTMLDivElement>(null);

  if (toasts.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-12 right-4 z-[100] flex flex-col-reverse pointer-events-none"
      {...slotAttributes(toastContainerStyle, {})}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
