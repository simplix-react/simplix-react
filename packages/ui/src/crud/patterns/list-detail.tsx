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

import { SheetContent } from "../../base/overlay/sheet";
import { useUIDefaults } from "../../provider/ui-defaults-context";
import { cn } from "../../utils/cn";

// ── Context ──

/**
 * How the detail appears.
 *
 * <p>`"panel"` beside the list, `"drawer"` slid in from the right edge over the full height,
 * `"dialog"` as a centred modal. The first two are the same screen said two ways and an
 * installation picks between them through `UIProvider`'s `detailPresentation`; the third is a
 * screen's own decision, because a centred modal claims the record is an interruption rather than
 * the thing being worked on.
 */
export type ListDetailVariant = "panel" | "dialog" | "drawer";

export interface ListDetailContextValue {
  variant: ListDetailVariant;
  activePanel: "list" | "detail";
  setActivePanel: (panel: "list" | "detail") => void;
  dialogHeight?: string;
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

/** Common props shared by all width variants. */
export interface ListDetailBaseProps {
  /** Layout variant. `"panel"` renders side-by-side, `"dialog"` renders detail in a modal. */
  variant?: ListDetailVariant;
  /** Controlled active panel. When provided, overrides internal state. */
  activePanel?: "list" | "detail";
  /** Called when the dialog is dismissed (only applies to `"dialog"` variant). */
  onClose?: () => void;
  /** Fixed dialog height (e.g. `"60vh"`, `"500px"`). When set, the dialog uses a fixed height with internal scrolling. When omitted, height fits content up to `max-h-[85vh]`. Only applies to `"dialog"` variant. */
  dialogHeight?: string;
  className?: string;
  children: ReactNode;
}

/** Props for the {@link ListDetail} compound component. Use either `detailWidth` or `listWidth`, not both. */
export type ListDetailProps = ListDetailBaseProps & (
  | { /** Fixed detail panel width in px. The list panel fills remaining space. */ detailWidth?: number; listWidth?: never }
  | { detailWidth?: never; /** Fixed list panel width in px. The detail panel fills remaining space. */ listWidth?: number }
);

/**
 * Standard width (px) of the detail panel in a list-detail screen.
 *
 * A detail body is a two-column field grid over a two-tier action footer, and at a narrower
 * width the pairs collapse into one column while long values wrap mid-token. The list panel
 * takes the remaining width, which is enough for the few columns a list shows before a row is
 * opened. Exported so an application states the same width wherever it needs the number
 * outside this component rather than repeating a literal.
 */
/**
 * How much room the detail gets when the framework is the one deciding, in px.
 *
 * <p><b>One number, because three were three different screens.</b> The panel column, the drawer
 * and the dialog were 600, 576 and 672, so an installation switching between them changed how much
 * content fits — a footer that cleared in one clipped in another, and an audit reading the narrow
 * one reported a screen defect that was really a setting.
 *
 * <p><b>768 because the widest of the three was 672 and still too narrow.</b> The organization
 * detail's action row — four buttons, in English, at a 1280 viewport — pushed its last button
 * 141px past the edge. At 768 that row ends 24px inside it.
 *
 * <p><b>A screen that pins `listWidth` does not use this in panel mode</b>, and today every screen
 * in this console does: the list takes the width it asked for and the detail column takes whatever
 * remains, which is wider than 768 on a large monitor and narrower on a small one. So this unifies
 * the two presentations that float over the list and sets the default for the panel; making the
 * third agree as well would mean overriding a number each screen chose for its own list, which is
 * a different decision from this one.
 */
export const DETAIL_PANEL_WIDTH = 768;

// The two presentations that float over the list carry it as an inline `maxWidth` rather than a
// Tailwind cap. A class assembled from the constant (`sm:${DETAIL_MAX_WIDTH}`) is invisible to
// Tailwind, which reads source text and never sees the composed string — the class is simply never
// generated and the sheet silently falls back to the sheet default, narrower than any of the three
// were before. The inline style also keeps one number rather than a px constant and a Tailwind
// class that have to be edited in step.

/** Minimum width (px) for both list and detail panels during drag. */
const MIN_PANEL_WIDTH = 280;

export function ListDetailRoot({ variant: variantProp, activePanel: activePanelProp, detailWidth = DETAIL_PANEL_WIDTH, listWidth, onClose, dialogHeight, className, children }: ListDetailProps) {
  // The installation's answer when the screen does not give one. A screen that names a variant
  // wins — that is the escape hatch for the one surface whose shape is genuinely its own — but a
  // screen naming `"panel"` because the scaffold wrote it there takes the choice away from every
  // installation without meaning to.
  const uiDefaults = useUIDefaults();
  const variant = variantProp ?? uiDefaults.detailPresentation;

  const [activePanelState, setActivePanel] = useState<"list" | "detail">("list");
  const activePanel = activePanelProp ?? activePanelState;
  const [dragDetailWidth, setDragDetailWidth] = useState<number | null>(null);
  const [dragListWidth, setDragListWidth] = useState<number | null>(null);
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
      if (listWidth != null) setDragListWidth(clamped);
    },
    [listWidth],
  );

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const contextValue: ListDetailContextValue = { variant, activePanel, setActivePanel, dialogHeight };

  // Both overlay shapes hang off the same root, modal, with Radix's own behaviour: the backdrop is
  // drawn, it takes the clicks, and pressing it closes the detail.
  //
  // **The drawer was briefly non-modal so that pressing the next row swapped the record in one
  // press instead of two.** That was given up deliberately rather than lost: asked to choose, the
  // product wanted the backdrop to block and to close, which is what every other sheet in the
  // console does. Two presses to move between records is the price of that, and it is the price
  // that was chosen. Anyone reversing this should know they are re-opening a decision, not fixing
  // an oversight — three separate things had to be switched off to get the single press
  // (`modal`, the overlay, and the dismissable layer's outside-press), and none of them was the
  // whole answer on its own.
  if (variant === "dialog" || variant === "drawer") {
    return (
      <ListDetailContext.Provider value={contextValue}>
        <DialogPrimitive.Root
          open={activePanel === "detail"}
          onOpenChange={(open) => {
            setActivePanel(open ? "detail" : "list");
            if (!open) onClose?.();
          }}
        >
          <section className={cn("h-full flex-1 min-h-0", className)}>
            {children}
          </section>
        </DialogPrimitive.Root>
      </ListDetailContext.Provider>
    );
  }

  const effectiveListWidth = dragListWidth ?? listWidth;
  const effectiveDetailWidth = dragDetailWidth ?? detailWidth;
  const isDetailOpen = activePanel === "detail";
  const listCol = effectiveListWidth != null ? `${effectiveListWidth}px` : "1fr";
  const detailCol = effectiveListWidth != null ? "1fr" : `${effectiveDetailWidth}px`;
  const gridCols = isDetailOpen
    ? `${listCol} ${DIVIDER_TRACK}px ${detailCol}`
    : undefined;

  return (
    <ListDetailContext.Provider value={contextValue}>
      <section
        ref={sectionRef}
        className={cn(
          "h-full flex-1 min-h-0",
          isDetailOpen && "overflow-hidden md:grid md:grid-rows-1",
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
        variant === "panel" && activePanel === "detail" && "md:pr-4",
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
  const { variant, activePanel, dialogHeight } = useListDetail();

  if (variant === "drawer") {
    return (
      <SheetContent
        ref={ref as React.Ref<HTMLDivElement>}
        side="right"
        aria-describedby={undefined}
        // `Sheet`'s own close button is dropped: the detail this holds brings its own — the same
        // one the panel variant shows — and two of them in one corner is a screen telling the
        // reader there are two ways out of the same thing.
        showCloseButton={false}
        className={cn(
          // The sheet's own `sm:max-w-sm` is sized for a settings pane and made the drawer the
          // narrowest of the three presentations — the one the reader was most likely looking at
          // fitted the least. The inline `maxWidth` below replaces it; an inline style outranks any
          // class, so nothing has to be unset here.
          "gap-0 py-4",
          // The same slot padding the dialog variant pushes down, for the same reason: the header
          // and footer rules have to span the full width rather than stopping inside a gutter.
          "[&_[data-crud-slot=header]]:px-6",
          "[&_[data-crud-slot=body]]:px-0 [&_[data-crud-slot=body]>*]:px-6",
          "[&_[data-crud-slot=footer]]:px-0 [&_[data-crud-slot=footer]>*]:px-6",
          className,
        )}
        // `w-3/4` from the sheet still governs below the `sm` breakpoint, where three quarters of
        // a phone is the right answer and 768 is not; this caps it everywhere above.
        style={{ maxWidth: DETAIL_PANEL_WIDTH }}
      >
        <DialogPrimitive.Title className="sr-only">Detail</DialogPrimitive.Title>
        {children}
      </SheetContent>
    );
  }

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
            "w-full",
            !dialogHeight && "max-h-[85vh]",
            "flex flex-col overflow-hidden",
            "rounded-lg border bg-background py-4 shadow-lg",
            // Push horizontal padding into CrudDetail/CrudForm slots so border lines span full dialog width.
            // Body/footer slots carry their own panel padding — zero it so the pushed padding does not stack.
            "[&_[data-crud-slot=header]]:px-6",
            "[&_[data-crud-slot=body]]:px-0 [&_[data-crud-slot=body]>*]:px-6",
            "[&_[data-crud-slot=footer]]:px-0 [&_[data-crud-slot=footer]>*]:px-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          style={{ maxWidth: DETAIL_PANEL_WIDTH, ...(dialogHeight ? { height: dialogHeight } : {}) }}
        >
          <DialogPrimitive.Title className="sr-only">Detail</DialogPrimitive.Title>
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
 * List-detail layout in three shapes:
 * - `"panel"`: side-by-side, with a draggable divider. The framework's default.
 * - `"drawer"`: the list keeps its full width and the detail slides in from the right edge.
 * - `"dialog"`: the list keeps its full width and the detail opens as a centred modal.
 *
 * **`variant` is normally not passed.** Panel and drawer are the same screen said two ways — the
 * same detail, the same content, opened by the same act and closed back to the same list — and
 * which one an installation gets is set once through `UIProvider`'s `detailPresentation`. A screen
 * that hardcodes `variant="panel"` takes that choice away from every installation, usually without
 * meaning to, because the scaffold wrote it there. Pass one only where the shape is genuinely this
 * screen's own, and `"dialog"` is the case that usually is.
 *
 * **A wireframe board draws this as a list with a panel beside it whichever shape is in force.**
 * The board's claim is that the detail opens next to the list, not that it is a panel; a screen
 * rendering a drawer against a board drawn as list-detail is not a divergence.
 *
 * Sub-components: List, Detail, ViewSwitch, useListDetail.
 */
export const ListDetail = Object.assign(ListDetailRoot, {
  List: ListPanel,
  Detail: DetailPanel,
  ViewSwitch: ListDetailViewSwitch,
  useListDetail,
});
