// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRouter } from "../../adapters/router-provider";

describe("useRouter", () => {
  it("returns null when no RouterContext provider is present", () => {
    const { result } = renderHook(() => useRouter());
    expect(result.current).toBeNull();
  });
});
