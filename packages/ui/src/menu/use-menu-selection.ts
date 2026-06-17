import { useCallback, useSyncExternalStore } from "react";

interface MenuSelectionState {
  selectedTopMenuKey: string | null;
  expandedSidebarKeys: ReadonlySet<string>;
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let snapshot: MenuSelectionState = {
  selectedTopMenuKey: null,
  expandedSidebarKeys: new Set(),
};

function getSnapshot() {
  return snapshot;
}

export function useMenuSelection() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setSelectedTopMenuKey = useCallback((key: string | null) => {
    if (snapshot.selectedTopMenuKey === key) return;
    snapshot = { ...snapshot, selectedTopMenuKey: key };
    emitChange();
  }, []);

  const toggleExpanded = useCallback((key: string) => {
    const next = new Set(snapshot.expandedSidebarKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    snapshot = { ...snapshot, expandedSidebarKeys: next };
    emitChange();
  }, []);

  const addExpanded = useCallback((keys: readonly string[]) => {
    if (keys.length === 0) return;
    const current = snapshot.expandedSidebarKeys;
    let changed = false;
    const next = new Set(current);
    for (const k of keys) {
      if (!next.has(k)) {
        next.add(k);
        changed = true;
      }
    }
    if (!changed) return;
    snapshot = { ...snapshot, expandedSidebarKeys: next };
    emitChange();
  }, []);

  return {
    selectedTopMenuKey: state.selectedTopMenuKey,
    expandedSidebarKeys: state.expandedSidebarKeys,
    setSelectedTopMenuKey,
    toggleExpanded,
    addExpanded,
  };
}
