// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "ko",
    exists: () => true,
  }),
  useLocale: () => "ko",
}));

import { ModalSidebar } from "../../crud/modal/modal-sidebar";

afterEach(cleanup);

describe("ModalSidebar", () => {
  it("TC-MS-1: renders block title, row label and value", () => {
    render(
      <ModalSidebar>
        <ModalSidebar.Block title="기본 정보">
          <ModalSidebar.Row label="코드" value="NOTICE" />
        </ModalSidebar.Block>
      </ModalSidebar>,
    );
    expect(screen.getByText("기본 정보")).toBeDefined();
    expect(screen.getByText("코드")).toBeDefined();
    expect(screen.getByText("NOTICE")).toBeDefined();
  });

  it("TC-MS-2: on/off badge falls back to the t('common.on'/'common.off') labels", () => {
    render(
      <ModalSidebar>
        <ModalSidebar.Block title="설정">
          <ModalSidebar.Row label="댓글" bool on />
          <ModalSidebar.Row label="첨부" bool on={false} />
        </ModalSidebar.Block>
      </ModalSidebar>,
    );
    expect(screen.getByLabelText("common.on")).toBeDefined();
    expect(screen.getByLabelText("common.off")).toBeDefined();
  });

  it("TC-MS-3: explicit onLabel/offLabel override the i18n fallback", () => {
    render(
      <ModalSidebar>
        <ModalSidebar.Block title="설정">
          <ModalSidebar.Row label="댓글" bool on onLabel="사용" />
          <ModalSidebar.Row label="첨부" bool on={false} offLabel="미사용" />
        </ModalSidebar.Block>
      </ModalSidebar>,
    );
    expect(screen.getByLabelText("사용")).toBeDefined();
    expect(screen.getByLabelText("미사용")).toBeDefined();
  });

  it("TC-MS-4: editable `children` override the value/bool rendering", () => {
    render(
      <ModalSidebar>
        <ModalSidebar.Block title="편집">
          <ModalSidebar.Row label="상태" value="읽기전용이면-안됨">
            <input data-testid="edit-control" defaultValue="x" />
          </ModalSidebar.Row>
        </ModalSidebar.Block>
      </ModalSidebar>,
    );
    expect(screen.getByTestId("edit-control")).toBeDefined();
    // The static value must not render once an editable control is supplied.
    expect(screen.queryByText("읽기전용이면-안됨")).toBeNull();
  });
});
