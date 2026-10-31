// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent, DialogTitle } from "../../base/overlay/dialog";
import { ComboboxField } from "../../fields/form/combobox-field";

afterEach(cleanup);

describe("ComboboxField inside a dialog", () => {
  const options = [
    { label: "Alpha", value: "alpha" },
    { label: "Beta", value: "beta" },
  ];

  it("puts the reader in the search box on open, and what they type reaches the search", async () => {
    const onSearch = vi.fn();
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Pick</DialogTitle>
          <ComboboxField label="Test" value={null} onChange={() => {}} options={options} onSearch={onSearch} serverSearch />
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByTestId("form-field-test").querySelector("span[class]")!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    const search = screen.getByRole("searchbox");
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: "alp" } });
    expect(onSearch).toHaveBeenLastCalledWith("alp");
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(2);
  });
});
