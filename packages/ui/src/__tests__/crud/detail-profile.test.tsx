// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DetailProfile } from "../../crud/detail/detail-profile";

afterEach(cleanup);

describe("DetailProfile", () => {
  it("TC-DP-1: renders the mark, title, feature badges and meta", () => {
    render(
      <DetailProfile
        mark={<svg data-testid="mark" />}
        title="공지사항"
        feats={
          <DetailProfile.Feats items={["카테고리", "첨부"]} emptyLabel="활성 기능 없음" />
        }
        meta={<DetailProfile.Meta code="NOTICE" items={["기본"]} />}
      />,
    );
    expect(screen.getByText("공지사항")).toBeDefined();
    expect(screen.getByTestId("mark")).toBeDefined();
    expect(screen.getByText("카테고리")).toBeDefined();
    expect(screen.getByText("첨부")).toBeDefined();
    expect(screen.getByText("NOTICE")).toBeDefined();
    expect(screen.getByText("기본")).toBeDefined();
  });

  it("TC-DP-2: collapses badges past `max` into a single '+N' with a localized a11y label", () => {
    render(
      <DetailProfile
        mark={null}
        title="게시판"
        feats={
          <DetailProfile.Feats
            items={["카테고리", "첨부", "댓글", "다국어", "예약", "외부 연동", "슬러그"]}
            emptyLabel="활성 기능 없음"
            overflowLabel={(n) => `기능 ${n}개 더`}
          />
        }
      />,
    );
    // 7 items, default max 5 → 5 visible + a "+2" overflow badge.
    const overflow = screen.getByText("+2");
    expect(overflow.getAttribute("aria-label")).toBe("기능 2개 더");
    // Hidden labels live only in the (closed) tooltip → not in the document yet.
    expect(screen.queryByText("외부 연동")).toBeNull();
    expect(screen.queryByText("슬러그")).toBeNull();
  });

  it("TC-DP-3: '+N' badge falls back to its visible text when no overflowLabel is given", () => {
    render(
      <DetailProfile
        mark={null}
        title="게시판"
        feats={
          <DetailProfile.Feats
            items={["a", "b", "c", "d", "e", "f"]}
            emptyLabel="활성 기능 없음"
          />
        }
      />,
    );
    const overflow = screen.getByText("+1");
    expect(overflow.getAttribute("aria-label")).toBeNull();
  });

  it("TC-DP-4: empty `items` renders `emptyLabel` instead of badges", () => {
    render(
      <DetailProfile
        mark={null}
        title="Q&A 채널"
        feats={<DetailProfile.Feats items={[]} emptyLabel="활성 기능 없음" />}
      />,
    );
    expect(screen.getByText("활성 기능 없음")).toBeDefined();
  });

  it("TC-DP-5: Meta renders status items without a code chip", () => {
    render(
      <DetailProfile
        mark={null}
        title="태그 그룹"
        meta={<DetailProfile.Meta items={["상위 없음", "사용 중"]} />}
      />,
    );
    expect(screen.getByText("상위 없음")).toBeDefined();
    expect(screen.getByText("사용 중")).toBeDefined();
  });
});
