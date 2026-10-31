// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useCursorPages } from "../../crud/entity/cursor-pages";

afterEach(cleanup);

interface Page {
  readonly rows: readonly string[];
  readonly nextCursor: string | null;
}

/** Three pages chained by cursor, and the cursors each read was asked with. */
function server() {
  const pages: Record<string, Page> = {
    first: { rows: ["a", "b"], nextCursor: "c2" },
    c2: { rows: ["c", "d"], nextCursor: "c3" },
    c3: { rows: ["e"], nextCursor: null },
  };
  const asked: (string | undefined)[] = [];
  const fetchPage = async (cursor: string | undefined) => {
    asked.push(cursor);
    const page = pages[cursor ?? "first"];
    if (!page) throw new Error(`No page at ${cursor}`);
    return page;
  };
  return { fetchPage, asked };
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useCursorPages", () => {
  it("reads page after page by the cursor each page names, and stops at the last", async () => {
    const { fetchPage, asked } = server();
    const { result } = renderHook(
      () => useCursorPages<Page, string>({ queryKey: ["ledger"], fetchPage, items: (p) => p.rows, next: (p) => p.nextCursor }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c", "d"]));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c", "d", "e"]));

    expect(result.current.hasMore).toBe(false);
    expect(asked).toEqual([undefined, "c2", "c3"]);
  });

  it("asks nothing while held back", async () => {
    const { fetchPage, asked } = server();
    const { result } = renderHook(
      () => useCursorPages<Page, string>({ queryKey: ["held"], fetchPage, items: (p) => p.rows, next: (p) => p.nextCursor, enabled: false }),
      { wrapper },
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(asked).toEqual([]);
    expect(result.current.items).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });
});
