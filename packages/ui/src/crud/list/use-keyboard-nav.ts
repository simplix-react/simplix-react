import { type RefObject, useEffect, useRef } from "react";

/** Options for the {@link useKeyboardNav} hook. */
export interface UseKeyboardNavOptions {
  /** Called on ArrowUp/ArrowDown key press. */
  onNavigate: (direction: "up" | "down") => void;
  /** Called on Enter key press. */
  onSelect: () => void;
  /** Called on Space key press (skipped inside input/textarea/button). */
  onToggle: () => void;
  /** Called on Ctrl+K / Cmd+K key press. */
  onSearch: () => void;
  /** Called on Escape key press. */
  onEscape?: () => void;
  /** Enable or disable keyboard listeners. Defaults to `true`. */
  enabled?: boolean;
}

/**
 * Keyboard navigation hook for list components.
 *
 * @remarks
 * Bindings: ArrowUp/Down (navigate), Enter (select), Space (toggle),
 * Ctrl+K / Cmd+K (search), Escape (dismiss).
 * Attach the returned `containerRef` to the element that should capture keyboard events.
 *
 * @param options - {@link UseKeyboardNavOptions}
 * @returns Object containing a `containerRef` to attach to the list container element.
 */
export function useKeyboardNav(
  options: UseKeyboardNavOptions,
): { containerRef: RefObject<HTMLElement | null> } {
  const { onNavigate, onSelect, onToggle, onSearch, onEscape, enabled = true } = options;
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp": {
          e.preventDefault();
          onNavigate("up");
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          onNavigate("down");
          break;
        }
        case "Enter": {
          e.preventDefault();
          onSelect();
          break;
        }
        case " ": {
          // Only toggle when target is not an input/textarea/button
          const target = e.target as HTMLElement;
          const tag = target.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "button" || tag === "select") {
            return;
          }
          e.preventDefault();
          onToggle();
          break;
        }
        case "k": {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSearch();
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          onEscape?.();
          break;
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onNavigate, onSelect, onToggle, onSearch, onEscape]);

  return { containerRef };
}
