import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface PageHeaderState {
  title?: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  /** Stable primitive key to trigger header updates when metadata changes */
  metadataKey?: string;
  center?: ReactNode;
  actions?: ReactNode;
}

/** The one empty value, so "nothing registered" keeps a stable identity across reads. */
const EMPTY: PageHeaderState = {};

/**
 * Where the current header lives.
 *
 * <p>A store rather than provider state, and that is the whole of the fix it exists for. Held in
 * `useState` on the provider, every write re-rendered the provider's entire subtree — including
 * the page that wrote it — so a hook that registered on every render looped. The dependency list
 * that stopped the loop is what froze `actions`: they were only re-registered when the title,
 * the description, or `metadataKey` changed, and a save button installed disabled therefore
 * never enabled however many times the page re-rendered.
 *
 * <p>Subscribers re-render; the subtree does not. That lets the hook publish on every render of
 * its owner, which is what keeps a stateful action current.
 */
interface PageHeaderStore {
  get(): PageHeaderState;
  set(next: PageHeaderState): void;
  subscribe(listener: () => void): () => void;
}

/**
 * @returns a store holding one header
 */
function createPageHeaderStore(): PageHeaderStore {
  let state: PageHeaderState = EMPTY;
  const listeners = new Set<() => void>();
  return {
    // Returned by identity, never rebuilt: `useSyncExternalStore` reads this during render and
    // a fresh object each read is an infinite re-render.
    get: () => state,
    set(next) {
      state = next;
      listeners.forEach(listener => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * @param a one header
 * @param b another
 * @returns whether the two carry the same values, slot by slot
 */
function same(a: PageHeaderState, b: PageHeaderState): boolean {
  return a.title === b.title
    && a.description === b.description
    && a.metadata === b.metadata
    && a.metadataKey === b.metadataKey
    && a.center === b.center
    && a.actions === b.actions;
}

const PageHeaderContext = createContext<PageHeaderStore | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  // Created once. A store rebuilt on re-render would drop every subscriber it had.
  const [store] = useState(createPageHeaderStore);
  return <PageHeaderContext.Provider value={store}>{children}</PageHeaderContext.Provider>;
}

/**
 * Registers what the page header shows, for as long as the caller is mounted.
 *
 * <p>Published on every render of the caller, so whatever is put in `actions`, `metadata`, or
 * `center` is the current one rather than the one that existed when the title was last set. A
 * render that changes nothing publishes nothing — the values are compared slot by slot first,
 * so a caller passing stable nodes costs the header no work at all.
 *
 * @param header what to show, or null to leave whatever another component registered
 */
export function usePageHeader(header: PageHeaderState | null) {
  const store = useContext(PageHeaderContext);
  // The exact state object this hook last installed, used to detect ownership on cleanup
  const installed = useRef<PageHeaderState | null>(null);

  // No dependency list: this runs after every render of the caller, which is what keeps a
  // stateful action current. It cannot loop — the store's subscribers are the header chrome,
  // never this subtree.
  useEffect(() => {
    if (!store || header == null) return;
    if (installed.current != null && same(installed.current, header)) return;
    installed.current = header;
    store.set(header);
  });

  // Clear header on unmount — but only if the current header is still the one
  // this hook installed. A deferred unmount (e.g. tab-exit animation) must not
  // wipe a header another component has registered in the meantime.
  //
  // Forgetting what was installed is the other half of that, and the half a remount needs.
  // React's development remount rehearsal runs this cleanup between the publishing effect's
  // two runs; on the second run the caller has not re-rendered, so it offers the very object
  // `installed` still holds, `same` reports nothing to do, and the store stays empty. Whoever
  // passes values that change on a later render — a fresh `actions` node, a title that arrives
  // with a query — publishes again and never sees it. A caller passing only a stable title and
  // description has no later render to save it, and renders no header at all.
  useEffect(() => {
    return () => {
      if (!store) return;
      if (installed.current != null && store.get() === installed.current) store.set(EMPTY);
      installed.current = null;
    };
  }, [store]);
}

export function usePageHeaderState(): PageHeaderState {
  const store = useContext(PageHeaderContext);
  return useSyncExternalStore(
    store ? store.subscribe : noSubscribe,
    store ? store.get : readEmpty,
    store ? store.get : readEmpty,
  );
}

/** Outside a provider there is nothing to subscribe to, and nothing ever changes. */
function noSubscribe(): () => void {
  return () => {};
}

function readEmpty(): PageHeaderState {
  return EMPTY;
}
