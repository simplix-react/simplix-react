import { useSyncExternalStore } from "react";

export interface StreamLogEntry {
  id: number;
  timestamp: number;
  type: "connected" | "reconnected" | "data" | "heartbeat" | "gap" | "error" | "mock-data";
  resource?: string;
  summary?: string;
}

const MAX_ENTRIES = 200;

let entries: StreamLogEntry[] = [];
let snapshot: readonly StreamLogEntry[] = [];
const listeners = new Set<() => void>();
let rafHandle: ReturnType<typeof requestAnimationFrame> | null = null;

function notify() {
  // Batch rapid appends into a single frame to avoid excessive re-renders
  if (rafHandle !== null) return;
  rafHandle = requestAnimationFrame(() => {
    rafHandle = null;
    snapshot = [...entries];
    listeners.forEach((cb) => cb());
  });
}

let enabled = false;
let nextId = 0;

export function appendStreamLog(entry: Omit<StreamLogEntry, "id">) {
  if (!enabled) return;
  entries.push({ ...entry, id: nextId++ });
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(-MAX_ENTRIES);
  }
  notify();
}

function notifySync() {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
  snapshot = [...entries];
  listeners.forEach((cb) => cb());
}

export function clearStreamLogs() {
  entries = [];
  notifySync();
}

export function setStreamLogEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    clearStreamLogs();
  }
}

export function useStreamLogs(): readonly StreamLogEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
  );
}
