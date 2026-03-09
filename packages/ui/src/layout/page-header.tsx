import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

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
  setHeader: (h: PageHeaderState) => void;
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

  // Update when stable deps change (title, description, metadataKey are primitives)
  // actions and metadata are read from ref.current so they're always up-to-date
  // When null, this hook is a no-op — lets child components' headers take precedence
  useEffect(() => {
    if (ref.current != null) {
      setHeader(ref.current);
    }
  }, [header?.title, header?.description, header?.metadataKey, setHeader]);

  // Clear header on unmount (only if this hook actually set a header)
  useEffect(() => {
    return () => {
      if (ref.current != null) {
        setHeader({});
      }
    };
  }, [setHeader]);
}

export function usePageHeaderState(): PageHeaderState {
  return useContext(PageHeaderContext).header;
}
