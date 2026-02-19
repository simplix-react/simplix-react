import { type RefObject, useEffect, useRef } from "react";

/** Options for the {@link useKeyboardNav} hook. */
export interface UseKeyboardNavOptions {
  onNavigate: (direction: "up" | "down") => void;
  onSelect: () => void;
  onToggle: () => void;
  onSearch: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Keyboard navigation hook for list components.
 * Bindings: ArrowUp/Down (navigate), Enter (select), Space (toggle),
 * Ctrl+K / Cmd+K (search), Escape (dismiss).
 */
// Bindings: ArrowUp/Down (navigate), Enter (select), Space (toggle),
// Ctrl+K (search), Escape (close/dismiss)
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
