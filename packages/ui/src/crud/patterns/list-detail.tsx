import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "../../utils/cn";

// ── Context ──

type ListDetailVariant = "panel" | "dialog";

interface ListDetailContextValue {
  variant: ListDetailVariant;
  activePanel: "list" | "detail";
  setActivePanel: (panel: "list" | "detail") => void;
}

const ListDetailContext = createContext<ListDetailContextValue>({
  variant: "panel",
  activePanel: "list",
  setActivePanel: () => {},
});

function useListDetail() {
  return useContext(ListDetailContext);
}

// ── Width mapping (3-column: list | divider | detail) ──

type ListWidth = "1/4" | "1/3" | "2/5" | "1/2" | "3/5" | "2/3" | "3/4" | "4/5";

/** Divider track width in px: 1px visible line + 18px padding on each side. */
const DIVIDER_TRACK = 37;

const gridColsMap: Record<ListWidth, string> = {
  "1/4": `1fr ${DIVIDER_TRACK}px 3fr`,
  "1/3": `1fr ${DIVIDER_TRACK}px 2fr`,
  "2/5": `2fr ${DIVIDER_TRACK}px 3fr`,
  "1/2": `1fr ${DIVIDER_TRACK}px 1fr`,
  "3/5": `3fr ${DIVIDER_TRACK}px 2fr`,
  "2/3": `2fr ${DIVIDER_TRACK}px 1fr`,
  "3/4": `3fr ${DIVIDER_TRACK}px 1fr`,
  "4/5": `4fr ${DIVIDER_TRACK}px 1fr`,
};

// ── Root ──

/** Props for the {@link ListDetail} compound component. */
export interface ListDetailProps {
  /** Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal. */
  variant?: ListDetailVariant;
  /** Controlled active panel. When provided, overrides internal state. */
  activePanel?: "list" | "detail";
  /** List panel width ratio (only applies to `"panel"` variant). */
  listWidth?: ListWidth;
  /** Called when the dialog is dismissed (only applies to `"dialog"` variant). */
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

function ListDetailRoot({ variant = "panel", activePanel: activePanelProp, listWidth = "1/2", onClose, className, children }: ListDetailProps) {
  const [activePanelState, setActivePanel] = useState<"list" | "detail">("list");
  const activePanel = activePanelProp ?? activePanelState;
  const [dragCols, setDragCols] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleDrag = useCallback(
    (newListWidth: number) => {
      const el = sectionRef.current;
      if (!el) return;
      const totalWidth = el.offsetWidth;
      const clamped = Math.max(100, Math.min(totalWidth - 100, newListWidth));
      setDragCols(`${clamped}px ${DIVIDER_TRACK}px 1fr`);
    },
    [],
  );

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const contextValue: ListDetailContextValue = { variant, activePanel, setActivePanel };

  if (variant === "dialog") {
    return (
      <ListDetailContext.Provider value={contextValue}>
        <DialogPrimitive.Root
          open={activePanel === "detail"}
          onOpenChange={(open) => {
            setActivePanel(open ? "detail" : "list");
            if (!open) onClose?.();
          }}
        >
          <section className={cn("h-full", className)}>
            {children}
          </section>
        </DialogPrimitive.Root>
      </ListDetailContext.Provider>
    );
  }

  const gridCols = activePanel === "detail"
    ? (dragCols ?? gridColsMap[listWidth])
    : "1fr 0px 0fr";

  return (
    <ListDetailContext.Provider value={contextValue}>
      <section
        ref={sectionRef}
        className={cn(
          "h-full",
          "md:grid",
          !isDragging && "md:transition-[grid-template-columns] md:duration-300 md:ease-in-out",
          "max-md:flex max-md:flex-col",
          className,
        )}
        style={{ gridTemplateColumns: gridCols }}
      >
        {children}
        <Divider onDrag={handleDrag} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
      </section>
    </ListDetailContext.Provider>
  );
}

ListDetailRoot.displayName = "ListDetail";

// ── Divider (grid item, drag handle) ──

interface DividerProps {
  onDrag: (newListWidth: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function Divider({ onDrag, onDragStart, onDragEnd }: DividerProps) {
  const { activePanel } = useListDetail();
  const collapsed = activePanel !== "detail";
  const dragging = useRef(false);
  const startX = useRef(0);
  const startListWidth = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      const section = (e.currentTarget as HTMLElement).closest("section");
      const listPanel = section?.querySelector<HTMLElement>("[data-panel='list']");
      startListWidth.current = listPanel?.offsetWidth ?? 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      onDragStart();
    },
    [onDragStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onDrag(startListWidth.current + (e.clientX - startX.current));
    },
    [onDrag],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    onDragEnd();
  }, [onDragEnd]);

  return (
    <output
      role="separator"
      aria-orientation="vertical"
      tabIndex={collapsed ? -1 : 0}
      className={cn(
        "md:order-2 box-content cursor-col-resize self-stretch",
        "bg-border bg-clip-content hover:bg-primary/30 active:bg-primary/50",
        "max-md:hidden",
        "transition-[padding,opacity] duration-300 ease-in-out",
        collapsed ? "opacity-0 pointer-events-none px-0" : "px-[18px]",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        const section = (e.currentTarget as HTMLElement).closest("section");
        const listPanel = section?.querySelector<HTMLElement>("[data-panel='list']");
        const w = listPanel?.offsetWidth ?? 0;
        if (e.key === "ArrowLeft") onDrag(w - 20);
        if (e.key === "ArrowRight") onDrag(w + 20);
      }}
    />
  );
}

// ── List panel ──

interface PanelProps {
  children: ReactNode;
  className?: string;
}

const ListPanel = forwardRef<HTMLElement, PanelProps>(({ children, className }, ref) => {
  const { variant, activePanel } = useListDetail();

  return (
    <article
      ref={ref}
      data-panel="list"
      className={cn(
        "min-h-0 min-w-0 overflow-auto",
        variant === "panel" && "md:order-1",
        // Panel mode mobile: hide when detail is active
        variant === "panel" && activePanel !== "list" && "max-md:hidden",
        className,
      )}
    >
      {children}
    </article>
  );
});

ListPanel.displayName = "ListDetail.List";

// ── Detail panel ──

const DetailPanel = forwardRef<HTMLElement, PanelProps>(({ children, className }, ref) => {
  const { variant, activePanel } = useListDetail();

  if (variant === "dialog") {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          ref={ref as React.Ref<HTMLDivElement>}
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-2xl max-h-[85vh] overflow-auto",
            "rounded-lg border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">Detail</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  return (
    <article
      ref={ref}
      className={cn(
        "min-h-0 min-w-0 md:order-3",
        "md:transition-opacity md:duration-300 md:ease-in-out",
        activePanel === "detail"
          ? "overflow-auto md:opacity-100"
          : "max-md:hidden overflow-hidden md:opacity-0 md:pointer-events-none",
        className,
      )}
    >
      {children}
    </article>
  );
});

DetailPanel.displayName = "ListDetail.Detail";

// ── Compound export ──

/**
 * List-detail layout with two variants:
 * - `"panel"` (default): Side-by-side layout with draggable divider.
 * - `"dialog"`: List takes full width, detail opens in a modal dialog.
 *
 * Sub-components: List, Detail, useListDetail.
 */
export const ListDetail = Object.assign(ListDetailRoot, {
  List: ListPanel,
  Detail: DetailPanel,
  useListDetail,
});
