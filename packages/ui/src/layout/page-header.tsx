import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
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

const PageHeaderContext = createContext<{
  header: PageHeaderState;
  setHeader: Dispatch<SetStateAction<PageHeaderState>>;
}>({ header: {}, setHeader: () => {} });

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderState>({});
  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader(header: PageHeaderState | null) {
  const { setHeader } = useContext(PageHeaderContext);
  const ref = useRef(header);
  ref.current = header;
  // The exact state object this hook last installed, used to detect ownership on cleanup
  const installed = useRef<PageHeaderState | null>(null);

  // Update when stable deps change (title, description, metadataKey are primitives)
  // actions and metadata are read from ref.current so they're always up-to-date
  // When null, this hook is a no-op — lets sibling/child components' headers take precedence
  useEffect(() => {
    if (ref.current != null) {
      installed.current = ref.current;
      setHeader(ref.current);
    }
  }, [header?.title, header?.description, header?.metadataKey, setHeader]);

  // Clear header on unmount — but only if the current header is still the one
  // this hook installed. A deferred unmount (e.g. tab-exit animation) must not
  // wipe a header another component has registered in the meantime.
  useEffect(() => {
    return () => {
      setHeader((prev) => (installed.current != null && prev === installed.current ? {} : prev));
    };
  }, [setHeader]);
}

export function usePageHeaderState(): PageHeaderState {
  return useContext(PageHeaderContext).header;
}
