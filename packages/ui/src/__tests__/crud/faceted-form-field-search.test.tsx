// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "ko",
    exists: () => true,
  }),
  useLocale: () => "ko",
}));

vi.mock("../../crud/shared/column-context", () => ({
  useCrudListColumns: () => null,
}));

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar, type FilterDef } from "../../crud/filters/filter-bar";

function createState(): CrudListFilters {
  return {
    search: "",
    values: {},
    committedValues: {},
    setSearch: vi.fn(),
    setValue: vi.fn(),
    setValues: vi.fn(),
    commitValue: vi.fn(),
    commitValues: vi.fn(),
    setAll: vi.fn(),
    clear: vi.fn(),
    apply: vi.fn(),
    isPending: false,
  };
}

function openList(filter: FilterDef, state: CrudListFilters) {
  render(<FilterBar filters={[filter]} state={state} />);
  fireEvent.click(screen.getByRole("button", { name: "filter.label" }));
}

function typeInSearch(placeholder: string, text: string) {
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value: text } });
}

describe("inline faceted list search", () => {
  const koreanFeature: FilterDef = {
    type: "faceted",
    field: "feature",
    label: "Feature",
    options: [
      { value: "PREMIUM_SPEECH", label: "프리미엄 음성" },
      { value: "SPEECH_PREVIEW", label: "음성 미리듣기" },
      { value: "PACE_FIT", label: "발표 시간 맞춤" },
      { value: "CLOUD_NOTES", label: "클라우드 노트" },
    ],
  };

  it("matches a Korean letter against the label the reader sees", () => {
    openList(koreanFeature, createState());
    typeInSearch("Feature", "음");
    expect(screen.queryByText("프리미엄 음성")).not.toBeNull();
    expect(screen.queryByText("음성 미리듣기")).not.toBeNull();
    expect(screen.queryByText("발표 시간 맞춤")).toBeNull();
    expect(screen.queryByText("클라우드 노트")).toBeNull();
  });

  it("leaves nothing for a letter no label contains", () => {
    openList(koreanFeature, createState());
    typeInSearch("Feature", "복제");
    expect(screen.queryByText("프리미엄 음성")).toBeNull();
    expect(screen.queryByText("음성 미리듣기")).toBeNull();
    expect(screen.queryByText("발표 시간 맞춤")).toBeNull();
    expect(screen.queryByText("클라우드 노트")).toBeNull();
  });

  it("still matches the option key when the key is typed", () => {
    openList(koreanFeature, createState());
    typeInSearch("Feature", "CLOUD_NOTES");
    expect(screen.queryByText("클라우드 노트")).not.toBeNull();
    expect(screen.queryByText("프리미엄 음성")).toBeNull();
    expect(screen.queryByText("발표 시간 맞춤")).toBeNull();
  });

  it("keeps two options that share a label selectable, each selecting its own key", () => {
    const state = createState();
    openList(
      {
        type: "faceted",
        field: "owner",
        label: "Owner",
        options: [
          { value: "user-1", label: "김민수" },
          { value: "user-2", label: "김민수" },
          { value: "user-3", label: "이서연" },
        ],
      },
      state,
    );
    typeInSearch("Owner", "김");
    const rows = screen.getAllByText("김민수");
    expect(rows).toHaveLength(2);
    expect(screen.queryByText("이서연")).toBeNull();
    fireEvent.click(rows[1]);
    expect(state.setValue).toHaveBeenLastCalledWith("owner.in", ["user-2"]);
    fireEvent.click(rows[0]);
    expect(state.setValue).toHaveBeenLastCalledWith("owner.in", ["user-1"]);
  });

  it("selects the option key, not the label, when a filtered row is chosen", () => {
    const state = createState();
    openList(koreanFeature, state);
    typeInSearch("Feature", "음성");
    fireEvent.click(screen.getByText("음성 미리듣기"));
    expect(state.setValue).toHaveBeenLastCalledWith("feature.in", ["SPEECH_PREVIEW"]);
  });
});
