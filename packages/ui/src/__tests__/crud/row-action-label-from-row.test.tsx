// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
  useLocale: () => "en",
}));

import { RowActionCell } from "../../crud/shared/row-actions";
import { UIProvider } from "../../provider/ui-provider";

interface Row {
  readonly id: string;
  readonly enabled: boolean;
}

const toggle = {
  type: "view" as const,
  label: (row: Row) => (row.enabled ? "Disable" : "Enable"),
  icon: (row: Row) => <i data-testid="glyph">{row.enabled ? "off" : "on"}</i>,
  onClick: () => {},
};

function cell(row: Row, variant: "icon" | "outline", label: string | ((row: Row) => string) | null = toggle.label) {
  return render(
    <UIProvider>
      <RowActionCell<Row> row={row} variant={variant} actions={[{ ...toggle, label: label ?? undefined }]} />
    </UIProvider>,
  );
}

describe("a row action named from the row", () => {
  it("names the control by the row it sits on, in the icon strip", () => {
    cell({ id: "a", enabled: true }, "icon");
    expect(screen.getByRole("button", { name: "Disable" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Enable" })).toBeNull();
    cleanup();
    cell({ id: "b", enabled: false }, "icon");
    expect(screen.getByRole("button", { name: "Enable" })).toBeTruthy();
  });

  it("writes the row's label on the labelled button", () => {
    cell({ id: "a", enabled: false }, "outline");
    expect(screen.getByRole("button", { name: /Enable/ })).toBeTruthy();
  });

  it("keeps a fixed label working as before", () => {
    cell({ id: "a", enabled: true }, "icon", "Switch");
    expect(screen.getByRole("button", { name: "Switch" })).toBeTruthy();
  });

  it("falls back to the type's label key when none is given", () => {
    cell({ id: "a", enabled: true }, "icon", null);
    expect(screen.getByRole("button", { name: "common.view" })).toBeTruthy();
  });
});
