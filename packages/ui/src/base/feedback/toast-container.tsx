import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from "../../crud/shared/icons";
import { Button } from "../controls/button";
import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { useToastStore, removeToast, type Toast } from "./toast-store";

const typeConfig: Record<
  Toast["type"],
  {
    icon: React.ReactNode;
    containerClassName: string;
  }
> = {
  success: {
    icon: <CheckCircleIcon className="size-4 text-emerald-500 shrink-0" />,
    containerClassName: "border-emerald-200 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/90",
  },
  warning: {
    icon: <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />,
    containerClassName: "border-amber-200 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-950/90",
  },
  error: {
    icon: <XCircleIcon className="size-4 text-red-500 shrink-0" />,
    containerClassName: "border-red-200 bg-red-50/90 dark:border-red-800 dark:bg-red-950/90",
  },
  info: {
    icon: <InfoIcon className="size-4 text-blue-500 shrink-0" />,
    containerClassName: "border-blue-200 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/90",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const config = typeConfig[toast.type];
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => cancelAnimationFrame(enterTimer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-80 rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-200",
        config.containerClassName,
        isEntering && "translate-x-full opacity-0",
        isExiting && "translate-x-full opacity-0",
        !isEntering && !isExiting && "translate-x-0 opacity-100",
      )}
    >
      <Flex align="start" gap="sm">
        {config.icon}
        <Stack gap="xs" className="flex-1 min-w-0">
          <span className="text-sm font-medium leading-tight">{toast.message}</span>
          {toast.action && (
            <a
              href={toast.action.href}
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              {toast.action.label} {"\u2192"}
            </a>
          )}
        </Stack>
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 -mt-0.5 -mr-1"
          onClick={handleDismiss}
        >
          <XIcon className="size-3.5" />
        </Button>
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
      className="fixed bottom-12 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
