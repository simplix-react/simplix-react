import type { Meta, StoryObj } from "@storybook/react";
import { DetailProfile } from "@simplix-react/ui";

const meta = {
  title: "Crud/Detail/DetailProfile",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Detail/form modal profile strip. Presentational only — every visible string is caller-provided and already localized. Compose with `DetailProfile.Feats` / `DetailProfile.Meta`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Inline SVG — lucide-react is not a storybook dependency.
const mark = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <div className="max-w-3xl overflow-hidden rounded-lg border border-border">
      <DetailProfile
        mark={mark}
        title="공지사항"
        feats={
          <DetailProfile.Feats
            items={["카테고리", "첨부", "댓글", "다국어", "예약"]}
            emptyLabel="활성 기능 없음"
          />
        }
        meta={<DetailProfile.Meta code="NOTICE" items={["기본"]} />}
      />
    </div>
  ),
};

export const WithOverflow: Story = {
  name: "Feats overflow (+N)",
  render: () => (
    <div className="max-w-3xl overflow-hidden rounded-lg border border-border">
      <DetailProfile
        mark={mark}
        title="게시판"
        feats={
          <DetailProfile.Feats
            items={["카테고리", "첨부", "댓글", "다국어", "예약", "외부 연동", "슬러그"]}
            emptyLabel="활성 기능 없음"
            overflowLabel={(n) => `기능 ${n}개 더`}
          />
        }
        meta={<DetailProfile.Meta code="BOARDTEST" items={["기본"]} />}
      />
    </div>
  ),
};

export const EmptyFeats: Story = {
  render: () => (
    <div className="max-w-3xl overflow-hidden rounded-lg border border-border">
      <DetailProfile
        mark={mark}
        title="Q&A 채널"
        feats={<DetailProfile.Feats items={[]} emptyLabel="활성 기능 없음" />}
        meta={<DetailProfile.Meta code="QNA" items={["Q&A"]} />}
      />
    </div>
  ),
};

export const MetaWithoutCode: Story = {
  name: "Meta — status only (no code)",
  render: () => (
    <div className="max-w-3xl overflow-hidden rounded-lg border border-border">
      <DetailProfile
        mark={mark}
        title="태그 그룹"
        meta={<DetailProfile.Meta items={["상위 없음", "사용 중"]} />}
      />
    </div>
  ),
};
