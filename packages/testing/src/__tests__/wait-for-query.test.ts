import { describe, it, expect } from "vitest";
import { createTestQueryClient } from "../test-query-client.js";
import { waitForQuery } from "../wait-for-query.js";

describe("waitForQuery", () => {
  it("resolves when query completes successfully", async () => {
    const queryClient = createTestQueryClient();

    // fetchQuery populates the cache and returns the data
    await queryClient.fetchQuery({
      queryKey: ["test", "items"],
      queryFn: () => Promise.resolve([{ id: "1" }]),
    });

    // Query is already settled, waitForQuery should resolve immediately
    await waitForQuery(queryClient, ["test", "items"]);
    const data = queryClient.getQueryData(["test", "items"]);
    expect(data).toEqual([{ id: "1" }]);
  });

  it("resolves when query errors", async () => {
    const queryClient = createTestQueryClient();

    // fetchQuery throws on error, but it still sets query state
    try {
      await queryClient.fetchQuery({
        queryKey: ["test", "fail"],
        queryFn: () => Promise.reject(new Error("fetch failed")),
      });
    } catch {
      // expected
    }

    await waitForQuery(queryClient, ["test", "fail"]);
    const state = queryClient.getQueryState(["test", "fail"]);
    expect(state?.status).toBe("error");
  });

  it("throws on timeout when query never resolves", async () => {
    const queryClient = createTestQueryClient();

    // Do not set any query data — query state stays undefined (treated as pending)
    await expect(
      waitForQuery(queryClient, ["nonexistent"], { timeout: 50 }),
    ).rejects.toThrow("did not resolve within 50ms");
  });

  it("uses default timeout of 5000ms", async () => {
    const queryClient = createTestQueryClient();

    await queryClient.fetchQuery({
      queryKey: ["fast"],
      queryFn: () => Promise.resolve("ok"),
    });

    // Should resolve well within the default 5000ms timeout
    await waitForQuery(queryClient, ["fast"]);
    expect(queryClient.getQueryData(["fast"])).toBe("ok");
  });

  it("resolves for query populated via setQueryData", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["direct"], { value: 42 });

    await waitForQuery(queryClient, ["direct"], { timeout: 100 });
    expect(queryClient.getQueryData(["direct"])).toEqual({ value: 42 });
  });
});
