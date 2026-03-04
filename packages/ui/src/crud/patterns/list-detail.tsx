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

export type ListDetailVariant = "panel" | "dialog";

export interface ListDetailContextValue {
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

/** Divider track width in px: 1px visible line + 8px padding on each side. */
const DIVIDER_TRACK = 17;

// ── Root ──
//
// variant="panel" (desktop, detail open)
//
// ┌─────────────────────────────────────────────────────┐
// │ <section>  grid: 1fr │ 17px │ {detailWidth}px       │
// │ ┌───────────────┐ ┌┐ ┌────────────────────────────┐ │
// │ │ List (order-1)│ ││ │ Detail (order-3)           │ │
// │ │  [data-panel= │ ││ │  [data-panel="detail"]     │ │
// │ │   "list"]     │ ││ │                            │ │
// │ │               │ ││ │                            │ │
// │ │  toolbar      │ ││ │  CrudDetail / CrudForm     │ │
// │ │  table/cards  │ ││ │                            │ │
// │ │  pagination   │ ││ │                            │ │
// │ │               │ ││ │                            │ │
// │ └───────────────┘ └┘ └────────────────────────────┘ │
// │                   ↑                                 │
// │   Divider (order-2) / drag → resize                 │
// └─────────────────────────────────────────────────────┘
//
// variant="panel" (desktop, detail closed)
//
// ┌─────────────────────────────────────────────────────┐
// │ <section>  (no grid)                                │
// │ ┌─────────────────────────────────────────────────┐ │
// │ │ List  (full width)                              │ │
// │ └─────────────────────────────────────────────────┘ │
// │             Divider (opacity-0, pointer-events-none)│
// │             Detail  (opacity-0, pointer-events-none)│
// └─────────────────────────────────────────────────────┘
//
// variant="panel" (mobile) → flex col, detail hides list
//
// variant="dialog"
//
// ┌─────────────────────────┐    ┌─────────────────────┐
// │ <section>  (h-full)     │    │ Dialog overlay      │
// │ ┌─────────────────────┐ │    │ ┌─────────────────┐ │
// │ │ List  (full width)  │ │    │ │ Dialog content  │ │
// │ │                     │ │    │ │   max-w-2xl     │ │
// │ │                     │ │ →  │ │             [X] │ │
// │ │                     │ │    │ │  {children}     │ │
// │ └─────────────────────┘ │    │ └─────────────────┘ │
// └─────────────────────────┘    └─────────────────────┘

/** Props for the {@link ListDetail} compound component. */
export interface ListDetailProps {
  /** Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal. */
  variant?: ListDetailVariant;
  /** Controlled active panel. When provided, overrides internal state. */
  activePanel?: "list" | "detail";
  /** Fixed detail panel width in px (only applies to `"panel"` variant). */
  detailWidth?: number;
  /** Called when the dialog is dismissed (only applies to `"dialog"` variant). */
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

/** Minimum width (px) for both list and detail panels during drag. */
const MIN_PANEL_WIDTH = 280;

export function ListDetailRoot({ variant = "panel", activePanel: activePanelProp, detailWidth = 480, onClose, className, children }: ListDetailProps) {
  const [activePanelState, setActivePanel] = useState<"list" | "detail">("list");
  const activePanel = activePanelProp ?? activePanelState;
  const [dragDetailWidth, setDragDetailWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleDrag = useCallback(
    (newListWidth: number) => {
      const el = sectionRef.current;
      if (!el) return;
      const totalWidth = el.offsetWidth;
      const maxListWidth = totalWidth - DIVIDER_TRACK - MIN_PANEL_WIDTH;
      const clamped = Math.max(MIN_PANEL_WIDTH, Math.min(maxListWidth, newListWidth));
      setDragDetailWidth(totalWidth - clamped - DIVIDER_TRACK);
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

  const effectiveDetailWidth = dragDetailWidth ?? detailWidth;
  const isDetailOpen = activePanel === "detail";
  const gridCols = isDetailOpen
    ? `1fr ${DIVIDER_TRACK}px ${effectiveDetailWidth}px`
    : undefined;

  return (
    <ListDetailContext.Provider value={contextValue}>
      <section
        ref={sectionRef}
        className={cn(
          "h-full overflow-hidden",
          isDetailOpen && "md:grid md:grid-rows-1",
          isDetailOpen && !isDragging && "md:transition-[grid-template-columns] md:duration-300 md:ease-in-out",
          "max-md:flex max-md:flex-col",
          className,
        )}
        style={gridCols ? { gridTemplateColumns: gridCols } : undefined}
      >
        {children}
        <Divider onDrag={handleDrag} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
      </section>
    </ListDetailContext.Provider>
  );
}

ListDetailRoot.displayName = "ListDetail";

// ── Divider (grid item, drag handle) ──
//
// Detail open (desktop):          Detail closed:
// ┌──┐                            (hidden)
// │||│ ← 1px line + 8px padding
// │||│   each side (17px total)
// │||│   cursor: col-resize
// └──┘

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
        collapsed ? "opacity-0 pointer-events-none px-0" : "px-2",
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
//
// Panel mode:                    Dialog mode:
// ┌───────────────────┐           ┌──────────────────────────┐
// │ <article> order-1 │           │ <article>  (full width)  │
// │ min-w-0, overflow │           │                          │
// │                   │           │                          │
// │ {children}        │           │ {children}               │
// └───────────────────┘           └──────────────────────────┘
// detail open → pr-4             mobile + detail → hidden

export interface PanelProps {
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
        "flex flex-col gap-3 min-h-0 min-w-0 overflow-auto",
        activePanel === "detail" && "md:pr-4",
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
//
// Panel mode (detail open):          Dialog mode:
// ┌────────────────────────┐         ┌──── Dialog.Portal ─────────┐
// │ <article> order-3      │         │ ┌── Overlay (bg-black/80)─┐│
// │ pl-4, opacity-100      │         │ │ ┌── Content ──────────┐ ││
// │                        │         │ │ │ max-w-2xl, centered │ ││
// │ {children}             │         │ │ │                 [X] │ ││
// │                        │         │ │ │ {children}          │ ││
// └────────────────────────┘         │ │ └─────────────────────┘ ││
// detail closed → opacity-0          │ └─────────────────────────┘│
//   pointer-events-none              └────────────────────────────┘

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
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
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
        "min-h-0 min-w-0 md:order-3 flex flex-col md:pl-2",
        "md:transition-opacity md:duration-300 md:ease-in-out",
        activePanel === "detail"
          ? "overflow-hidden md:opacity-100"
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

import { ListDetailViewSwitch } from "./list-detail-view-switch";

/**
 * List-detail layout with two variants:
 * - `"panel"` (default): Side-by-side layout with draggable divider.
 * - `"dialog"`: List takes full width, detail opens in a modal dialog.
 *
 * Sub-components: List, Detail, ViewSwitch, useListDetail.
 */
export const ListDetail = Object.assign(ListDetailRoot, {
  List: ListPanel,
  Detail: DetailPanel,
  ViewSwitch: ListDetailViewSwitch,
  useListDetail,
});
