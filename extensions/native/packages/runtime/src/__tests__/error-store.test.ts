// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { clearError, dispatchError, useErrorEvent } from "../error/error-store";

describe("error store", () => {
  it("exposes the dispatched event and replaces it on redispatch", () => {
    const { result } = renderHook(() => useErrorEvent());
    expect(result.current).toBeNull();

    act(() => {
      dispatchError({ category: "server", message: "boom", raw: null });
    });
    expect(result.current?.message).toBe("boom");

    act(() => {
      dispatchError({ category: "client", message: "second", raw: null });
    });
    expect(result.current?.message).toBe("second");

    act(() => clearError());
    expect(result.current).toBeNull();
  });
});
