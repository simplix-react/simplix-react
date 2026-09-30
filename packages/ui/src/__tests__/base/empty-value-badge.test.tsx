// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyValueBadge } from "../../index";

afterEach(cleanup);

describe("EmptyValueBadge", () => {
  it("is reachable from the package entry point", () => {
    render(<EmptyValueBadge label="No arrival area" />);
    expect(screen.getByTestId("empty-value-badge").textContent).toBe("No arrival area");
  });
});
