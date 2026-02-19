export interface CrossTabSyncOptions {
  /** Storage key to observe for changes. */
  storageKey: string;
  /** Called when the key is removed in another tab (external logout). */
  onExternalLogout: () => void;
  /** Called when the key is updated in another tab. */
  onExternalTokenUpdate: (data: string) => void;
}

/**
 * Synchronizes auth state across browser tabs via the `storage` event.
 *
 * Detects when another tab logs out (key removed) or refreshes tokens
 * (key updated) and invokes the appropriate callback.
 */
export function createCrossTabSync(options: CrossTabSyncOptions): {
  start: () => void;
  stop: () => void;
} {
  let handler: ((event: StorageEvent) => void) | null = null;

  return {
    start() {
      if (handler) return;
      handler = (event: StorageEvent) => {
        if (event.key !== options.storageKey) return;
        if (event.newValue === null) {
          options.onExternalLogout();
        } else {
          options.onExternalTokenUpdate(event.newValue);
        }
      };
      window.addEventListener("storage", handler);
    },
    stop() {
      if (handler) {
        window.removeEventListener("storage", handler);
        handler = null;
      }
    },
  };
}
