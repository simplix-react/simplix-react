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
}

const row: Row = { id: "r1" };

function cell(variant: "icon" | "outline") {
  return render(
    <UIProvider>
      <RowActionCell<Row>
        row={row}
        variant={variant}
        actions={[
          {
            type: "delete",
            label: "취소",
            onClick: () => {},
            disabled: () => true,
            disabledReason: () => "이 화면은 아직 만들지 않았습니다",
          },
        ]}
      />
    </UIProvider>,
  );
}

describe("a disabled row action says why", () => {
  /**
   * The tooltip content is rendered lazily by Radix, so what is asserted here is the half that
   * decides whether it can EVER be reached: a disabled button swallows pointer events, so the
   * trigger has to be something else. Hung straight off the button, the tooltip never opens and
   * the reason is on the screen nowhere — which is what the icon strip did while its own prop
   * documented the opposite.
   */
  it("wraps the disabled control so the tooltip has something to hang off — icon strip", () => {
    cell("icon");
    const button = screen.getByRole("button", { name: "취소" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.parentElement?.tagName).toBe("SPAN");
  });

  it("wraps it in the labelled variant too, which is where the wrapper started", () => {
    cell("outline");
    const button = screen.getByRole("button", { name: /취소/ });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.closest("span")).not.toBeNull();
  });
});
