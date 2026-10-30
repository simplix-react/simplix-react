import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { useTranslation } from "@simplix-react/i18n/react";

import { DialogContent } from "../../base/overlay/dialog";
import { SheetContent } from "../../base/overlay/sheet";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useUIDefaults } from "../../provider/ui-defaults-context";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  crudListDetailDrawerStyle,
  crudListDetailDetailStyle,
  crudListDetailDividerStyle,
  crudListDetailDrawerBodyStyle,
  crudListDetailListStyle,
  crudListDetailRootStyle,
} from "./list-detail.style";

// ── Context ──

/**
 * How the detail appears.
 *
 * <p>`"panel"` beside the list, `"drawer"` slid in from the right edge over the full height,
 * `"dialog"` as a centred modal. An installation picks one through `UIProvider`'s
 * `detailPresentation`, and a screen can set its own on `variant`.
 */
export type ListDetailVariant = "panel" | "dialog" | "drawer";

/** Below the `md` breakpoint, where the panel layout stacks the detail over the list. */
const PHONE_WIDTH = "(max-width: 767px)";

export interface ListDetailContextValue {
  variant: ListDetailVariant;
  activePanel: "list" | "detail";
  setActivePanel: (panel: "list" | "detail") => void;
  dialogHeight?: string;
  /** The detail's width in px, which the drawer and the dialog cap themselves at as the panel does. */
  detailWidth?: number;
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
 * <p><b>A screen that pins `listWidth` does not use this in panel mode</b>: the list takes the width
 * it asked for and the detail column takes whatever remains.
 *
 * <p><b>The theme names the width first.</b> `--detail-panel-width` (theme/base.css, the same in
 * every design) puts the record panel at 440px beside a wide list; this number is the fallback for
 * an application whose stylesheet leaves the property unset.
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

/**
 * The custom property through which the theme names the detail column's width, in px, for a
 * screen that names none. theme/base.css sets it for every design; a design or an application may
 * override it.
 */
const DESIGN_DETAIL_WIDTH_PROPERTY = "--detail-panel-width";

/**
 * The detail width the design in force names, read from the document and read again when the
 * design changes. `undefined` when the design names none.
 */
function readDesignDetailWidth(): number | undefined {
  if (typeof document === "undefined") return undefined;
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(DESIGN_DETAIL_WIDTH_PROPERTY));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function useDesignDetailWidth(): number | undefined {
  // Read before the first paint: a detail that opens with the page would otherwise be drawn at the
  // fallback width and then animate to the design's, which reads as the panel shrinking by itself.
  const [width, setWidth] = useState<number | undefined>(readDesignDetailWidth);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setWidth(readDesignDetailWidth());
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-design", "class", "style"] });
    return () => observer.disconnect();
  }, []);
  return width;
}

export function ListDetailRoot({ variant: variantProp, activePanel: activePanelProp, detailWidth: detailWidthProp, listWidth, onClose, dialogHeight, className, children }: ListDetailProps) {
  // The installation's answer when the screen does not give one. A screen that names a variant
  // wins — that is the escape hatch for the one surface whose shape is genuinely its own — but a
  // screen naming `"panel"` because the scaffold wrote it there takes the choice away from every
  // installation without meaning to.
  const uiDefaults = useUIDefaults();
  // On a phone the detail is the page, whatever was asked for: a drawer covers the whole width
  // anyway and a dialog leaves a margin nothing can use, and both hide the way back behind a
  // backdrop. The panel variant's narrow layout already opens the detail in place of the list.
  const onAPhone = useMediaQuery(PHONE_WIDTH);
  const variant = onAPhone ? "panel" : (variantProp ?? uiDefaults.detailPresentation);
  const designDetailWidth = useDesignDetailWidth();
  const detailWidth = detailWidthProp ?? designDetailWidth ?? DETAIL_PANEL_WIDTH;

  const [activePanelState, setActivePanel] = useState<"list" | "detail">("list");
  const activePanel = activePanelProp ?? activePanelState;
  const [dragDetailWidth, setDragDetailWidth] = useState<number | null>(null);
  const [dragListWidth, setDragListWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  // The section's width, so a detail column wider than the room beside a usable list gives way
  // instead of squeezing the list under its minimum. The tracks transition, so the panel narrows
  // smoothly as the window does.
  const [sectionWidth, setSectionWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSectionWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  // Back to the width the screen or the design names.
  const handleDragReset = useCallback(() => {
    setDragDetailWidth(null);
    setDragListWidth(null);
  }, []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const contextValue: ListDetailContextValue = { variant, activePanel, setActivePanel, dialogHeight, detailWidth };

  const effectiveListWidth = dragListWidth ?? listWidth;
  const roomForDetail = sectionWidth != null ? sectionWidth - DIVIDER_TRACK - MIN_PANEL_WIDTH : null;
  const effectiveDetailWidth =
    roomForDetail != null && roomForDetail >= MIN_PANEL_WIDTH
      ? Math.min(dragDetailWidth ?? detailWidth, roomForDetail)
      : (dragDetailWidth ?? detailWidth);
  const isDetailOpen = activePanel === "detail";
  // The columns animate only while the detail opens or closes. Any other change of width (the
  // design naming its own, the stylesheet arriving after the first paint, a new viewport) is
  // applied at once: run through the transition it reads as the panel resizing by itself.
  // Set during render, so the transition is on in the same paint as the columns it animates.
  // Declared before the dialog and drawer branch, so every variant runs the same hooks.
  const [toggling, setToggling] = useState(false);
  const [seenOpen, setSeenOpen] = useState(isDetailOpen);
  if (seenOpen !== isDetailOpen) {
    setSeenOpen(isDetailOpen);
    setToggling(true);
  }
  useEffect(() => {
    if (!toggling) return;
    const timer = window.setTimeout(() => setToggling(false), 400);
    return () => window.clearTimeout(timer);
  }, [toggling, isDetailOpen]);

  // Both overlay shapes hang off the same root, modal, with Radix's own behaviour: the backdrop is
  // drawn, it takes the clicks, and pressing it closes the detail.
  //
  // **The drawer was briefly non-modal so that pressing the next row swapped the record without
  // closing anything.** That was given up deliberately rather than lost: asked to choose, the
  // product wanted the backdrop to block and to close, which is what every other sheet in the
  // console does.
  //
  // **The interaction that buys is 「close, then choose」 — not 「press the row twice」.** Those are
  // different things and the difference is worth the sentence: the drawer covers the right of the
  // list, so a press on a row's middle lands on the drawer and does nothing at all. What the
  // reader actually does is press the part of the list still showing, which the backdrop takes as
  // 「close」, and then pick the row. Written down as 「two presses」 the next reader takes it for a
  // click that fails to register and goes looking for the bug.
  //
  // Anyone reversing this should know they are re-opening a decision, not fixing an oversight —
  // three separate things had to be switched off to get the single press (`modal`, the overlay,
  // and the dismissable layer's outside-press), and none of them was the whole answer alone.
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
          {/* The detail floats over the list here, so the list is full width in both states and
              the page owns the scroll throughout — this variant has no counterpart to the panel's
              capped state. */}
          <section className={cn("flex-1", className)}>
            {children}
          </section>
        </DialogPrimitive.Root>
      </ListDetailContext.Provider>
    );
  }

  const listCol = effectiveListWidth != null ? `${effectiveListWidth}px` : "1fr";
  const detailCol = effectiveListWidth != null ? "1fr" : `${effectiveDetailWidth}px`;
  // **Which box scrolls depends on whether the detail is open, and the two states are opposite.**
  //
  // Detail closed, the screen is a list: it is drawn whole and the page scrolls it. The section
  // takes its height from its content, the scrolling ancestor overflows, and the single scrollbar
  // is the page's own — so whatever a screen puts above the list (tiles, a tab strip, a period
  // bar) travels with it.
  //
  // Detail open, the screen is a record: the page must not scroll, or the detail beside the list
  // slides away with it. The section caps itself to the viewport again and each column scrolls
  // inside its own track.
  //
  // **The tempting simplification is one layout in both states** — cap always, and the list ends
  // the same distance from the bottom whether or not a detail is open. What that costs is a list
  // scrolling inside itself while the rest of the page stands still: a reader working down a
  // 1769px list through a 690px window has the screen frozen around a moving strip, and because
  // every list in a console inherits it at once it reads as how the product is rather than as a
  // mistake.
  //
  // The zero-width tracks stay in both states — they keep the close animating like the open, and
  // keep the list one grid item rather than a block that reflows on every toggle.
  const gridCols = isDetailOpen
    ? `${listCol} ${DIVIDER_TRACK}px ${detailCol}`
    : "1fr 0px 0px";

  // Structure of the section, by state.
  //
  // - Capped only while a detail stands beside it. `min-h-0` belongs to that state alone - it is
  //   the permission for a flex item to shrink below its own content, which is the whole mechanism
  //   being switched off when the list is on its own.
  // - `grid-rows-1` is `minmax(0, 1fr)`, which sizes to the track rather than to the row's content
  //   and collapses in a section with no height of its own.
  // - A drag that crosses the list and the panel selects every word it passes over, and the
  //   selection is left standing when the pointer comes up. `preventDefault` on the handle stops
  //   the selection from starting; `select-none` stops one that was already in progress from
  //   extending, and covers the case where the press landed on a word rather than on the handle
  //   itself.
  const sectionClassName = cn(
    "flex-1",
    isDetailOpen && "h-full min-h-0 overflow-hidden",
    "md:grid",
    isDetailOpen ? "md:grid-rows-1" : "md:grid-rows-[auto]",
    isDragging && "select-none",
    "max-md:flex max-md:flex-col",
    className,
  );

  return (
    <ListDetailContext.Provider value={contextValue}>
      <section
        ref={sectionRef}
        className={sectionClassName}
        style={gridCols ? { gridTemplateColumns: gridCols } : undefined}
        {...slotAttributes(crudListDetailRootStyle, { dragging: isDragging || !toggling })}
      >
        {children}
        <Divider onDrag={handleDrag} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onReset={handleDragReset} />
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
  /** A double press returns the columns to the width they opened at. */
  onReset: () => void;
}

function Divider({ onDrag, onDragStart, onDragEnd, onReset }: DividerProps) {
  const { activePanel } = useListDetail();
  const collapsed = activePanel !== "detail";
  const dragging = useRef(false);
  const startX = useRef(0);
  const startListWidth = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // What a `pointerdown` does by default is begin a text selection, and a divider dragged
      // across two panels of text then paints every word between where it started and where it
      // stopped — still selected once the pointer is released. `setPointerCapture` routes the
      // events here and says nothing about selection, so this is the line that stops it.
      //
      // It also suppresses the focus the press would have given, and this element is a keyboard
      // control (arrow keys resize it), so the focus is taken by hand.
      e.preventDefault();
      (e.currentTarget as HTMLElement).focus();
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
        "md:order-2 box-content cursor-col-resize select-none self-stretch",
        "max-md:hidden",
        collapsed && "pointer-events-none",
      )}
      {...slotAttributes(crudListDetailDividerStyle, { collapsed })}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={onReset}
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
// │ min-w-0, scrolls  │           │  no scroll of its own    │
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
        "flex flex-col min-w-0",
        // The list scrolls inside itself only while it is a column beside an open detail. On its
        // own it is drawn whole and the page scrolls it, so `min-h-0` is scoped to the same
        // condition as the overflow it enables.
        variant === "panel" && activePanel === "detail" && "min-h-0 overflow-auto",
        variant === "panel" && "md:order-1",
        // Panel mode mobile: hide when detail is active
        variant === "panel" && activePanel !== "list" && "max-md:hidden",
        className,
      )}
      {...slotAttributes(crudListDetailListStyle, {
        beside: variant === "panel" && activePanel === "detail",
      })}
    >
      {children}
      {/* Room under the last row, for the state where the page is what scrolls.
          **As padding it would not survive.** The expanded list is a flex item overflowing a
          chain of `min-h-0` ancestors, and neither a scroll container's own bottom padding nor an
          overflowing item's is counted in what there is to scroll \u2014 the last row ends flush
          against the window and reads as cut off. An element is counted.
          It takes no press: standing over the last row of a list that reaches the fold, it would
          swallow the control there, and an element that is drawn, reads correctly and cannot be
          clicked is the one defect a capture cannot show. */}
      {variant === "panel" && activePanel === "detail" ? null : (
        <div aria-hidden className="h-10 shrink-0 pointer-events-none" />
      )}
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
  const { variant, activePanel, dialogHeight, detailWidth = DETAIL_PANEL_WIDTH } = useListDetail();
  const { t } = useTranslation("simplix/ui");

  if (variant === "drawer") {
    // **The drawer sits over the list and what is under it is covered — including, on a wide
    // monitor, a row's action column.** That is what a drawer is, and it is what this product
    // chose: the list is not narrowed to make room, so its right-hand columns are unreachable
    // while the detail is open, and moving to another record is 「close, then choose」 rather than
    // a press that swaps it. A covered action column is the shape working as chosen, not a defect
    // to route around.
    //
    // Narrowing the list instead is the `panel` variant, which is the same detail in a column
    // beside it. Making the drawer narrow the list would not be a third option — it would make the
    // two presentations the same thing with an animation between them, which is the reason there
    // are two of them at all. Anyone reading a covered action column as a defect should read this
    // first: it is the shape, chosen with that cost known.
    return (
      <SheetContent
        ref={ref as React.Ref<HTMLDivElement>}
        side="right"
        aria-describedby={undefined}
        // `Sheet`'s own close button is dropped: the detail this holds brings its own — the same
        // one the panel variant shows — and two of them in one corner is a screen telling the
        // reader there are two ways out of the same thing.
        showCloseButton={false}
        className={className}
        {...partAttributes(crudListDetailDrawerStyle, {})}
        // The sheet's own `sm:max-w-sm` is sized for a settings pane and made the drawer the
        // narrowest of the three presentations - the one the reader was most likely looking at
        // fitted the least. The inline `maxWidth` below replaces it; an inline style outranks any
        // class, so nothing has to be unset here.
        // `w-3/4` from the sheet still governs below the `sm` breakpoint, where three quarters of
        // a phone is the right answer and 768 is not; this caps it everywhere above, at the same
        // width the panel gives the detail, so a screen that widens its detail widens it in all three.
        style={{ maxWidth: detailWidth }}
      >
        <DialogPrimitive.Title className="sr-only">{t("common.detail")}</DialogPrimitive.Title>
        {/* The same slot padding the dialog variant pushes down, for the same reason: the header
            and footer rules have to span the full width rather than stopping inside a gutter. */}
        <div className="contents" {...slotAttributes(crudListDetailDrawerBodyStyle, {})}>
          {children}
        </div>
      </SheetContent>
    );
  }

  if (variant === "dialog") {
    // The shared dialog frame: scrim, landing motion, height ceiling and the bottom sheet below
    // `sm`. The detail draws its own header, scrolling body and footer, so the frame is a bare
    // column (`frame="column"`, `flush`) and the detail's own close replaces the corner one.
    return (
      <DialogContent
        ref={ref as React.Ref<HTMLDivElement>}
        aria-describedby={undefined}
        frame="column"
        flush
        showCloseButton={false}
        className={cn("overflow-hidden sm:max-w-[var(--detail-dialog-width)]", !dialogHeight && "max-h-[85vh]", className)}
        style={{ "--detail-dialog-width": `${detailWidth}px`, ...(dialogHeight ? { height: dialogHeight } : {}) } as React.CSSProperties}
      >
        <DialogPrimitive.Title className="sr-only">{t("common.detail")}</DialogPrimitive.Title>
        {children}
      </DialogContent>
    );
  }

  return (
    <article
      ref={ref}
      className={cn(
        "min-h-0 min-w-0 md:order-3 flex flex-col",
        activePanel === "detail"
          ? "overflow-hidden"
          : "max-md:hidden overflow-hidden md:pointer-events-none",
        className,
      )}
      {...slotAttributes(crudListDetailDetailStyle, { open: activePanel === "detail" })}
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
