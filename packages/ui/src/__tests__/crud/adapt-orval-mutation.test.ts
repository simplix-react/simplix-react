import { describe, expect, it, vi } from "vitest";

import {
  adaptOrvalCreate,
  adaptOrvalUpdate,
  adaptOrvalDelete,
  adaptOrvalOrder,
  type OrvalMutationLike,
} from "../../crud/form/adapt-orval-mutation";

function createMockMutation(isPending = false): OrvalMutationLike {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending,
  };
}

describe("adaptOrvalCreate", () => {
  it("wraps values in { data: values } for mutate", () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalCreate(mutation);
    const options = { onSuccess: vi.fn() };

    adapted.mutate({ name: "Alice" }, options);

    expect(mutation.mutate).toHaveBeenCalledWith(
      { data: { name: "Alice" } },
      expect.objectContaining({ onSuccess: options.onSuccess }),
    );
  });

  it("wraps values in { data: values } for mutateAsync", async () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalCreate(mutation);

    await adapted.mutateAsync({ name: "Bob" });

    expect(mutation.mutateAsync).toHaveBeenCalledWith(
      { data: { name: "Bob" } },
      expect.any(Object),
    );
  });

  it("passes through isPending", () => {
    const adapted = adaptOrvalCreate(createMockMutation(true));
    expect(adapted.isPending).toBe(true);
  });

  it("includes onSettled from opts", () => {
    const mutation = createMockMutation();
    const onSettled = vi.fn();
    const adapted = adaptOrvalCreate(mutation, { onSettled });

    adapted.mutate({ x: 1 });

    expect(mutation.mutate).toHaveBeenCalledWith(
      { data: { x: 1 } },
      expect.objectContaining({ onSettled }),
    );
  });
});

describe("adaptOrvalUpdate", () => {
  it("maps { id, dto } to { [pathParam]: id, data: dto }", () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalUpdate(mutation, "petId");

    adapted.mutate({ id: "5", dto: { name: "Rex" } });

    expect(mutation.mutate).toHaveBeenCalledWith(
      { petId: "5", data: { name: "Rex" } },
      expect.any(Object),
    );
  });

  it("sends body-only when pathParam is omitted", () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalUpdate(mutation);

    adapted.mutate({ id: "5", dto: { name: "Rex" } });

    expect(mutation.mutate).toHaveBeenCalledWith(
      { data: { name: "Rex" } },
      expect.any(Object),
    );
  });

  it("uses mutateAsync with pathParam", async () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalUpdate(mutation, "buildingId");

    await adapted.mutateAsync({ id: "10", dto: { floor: 3 } });

    expect(mutation.mutateAsync).toHaveBeenCalledWith(
      { buildingId: "10", data: { floor: 3 } },
      expect.any(Object),
    );
  });

  it("passes through isPending", () => {
    expect(adaptOrvalUpdate(createMockMutation(true), "id").isPending).toBe(true);
  });
});

describe("adaptOrvalDelete", () => {
  it("maps id to { [pathParam]: id }", () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalDelete(mutation, "petId");

    adapted.mutate("abc-123");

    expect(mutation.mutate).toHaveBeenCalledWith(
      { petId: "abc-123" },
      expect.any(Object),
    );
  });

  it("handles numeric id", () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalDelete<number>(mutation, "buildingId");

    adapted.mutate(42);

    expect(mutation.mutate).toHaveBeenCalledWith(
      { buildingId: 42 },
      expect.any(Object),
    );
  });

  it("uses mutateAsync", async () => {
    const mutation = createMockMutation();
    const adapted = adaptOrvalDelete(mutation, "siteId");

    await adapted.mutateAsync("7");

    expect(mutation.mutateAsync).toHaveBeenCalledWith(
      { siteId: "7" },
      expect.any(Object),
    );
  });

  it("passes through isPending", () => {
    expect(adaptOrvalDelete(createMockMutation(true), "id").isPending).toBe(true);
  });
});

describe("adaptOrvalOrder", () => {
  it("transforms items to order updates and calls mutate", async () => {
    const mutation = createMockMutation();
    (mutation.mutate as ReturnType<typeof vi.fn>).mockImplementation(
      (_data: unknown, opts: { onSuccess?: () => void }) => opts?.onSuccess?.(),
    );

    const reorder = adaptOrvalOrder(mutation, "id", "displayOrder");
    const items = [
      { id: "c", displayOrder: 3 },
      { id: "a", displayOrder: 1 },
      { id: "b", displayOrder: 2 },
    ];

    await reorder(items);

    expect(mutation.mutate).toHaveBeenCalledWith(
      {
        data: [
          { id: "c", displayOrder: 1 },
          { id: "a", displayOrder: 2 },
          { id: "b", displayOrder: 3 },
        ],
      },
      expect.any(Object),
    );
  });

  it("rejects when mutation fails", async () => {
    const mutation = createMockMutation();
    const error = new Error("order failed");
    (mutation.mutate as ReturnType<typeof vi.fn>).mockImplementation(
      (_data: unknown, opts: { onError?: (err: unknown) => void }) => opts?.onError?.(error),
    );

    const reorder = adaptOrvalOrder(mutation, "id", "sortOrder");

    await expect(reorder([{ id: "1", sortOrder: 1 }])).rejects.toThrow("order failed");
  });
});
