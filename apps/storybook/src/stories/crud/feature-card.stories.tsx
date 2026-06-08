import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FeatureCard } from "@simplix-react/ui";

const meta = {
  title: "Crud/Modal/FeatureCard",
  component: FeatureCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bordered section card for detail/form modal bodies: an optional header (leading icon + title + a right-aligned action slot) over a content body. Modal bodies stack these instead of pulling in a tabbed shell — each card is one self-contained section. Presentational only; the caller owns every visible string (already localized) and any interactive control. The `action` slot is where a feature's on/off switch, a button, or a status badge goes.",
      },
    },
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj;

// ── Icons (inline SVG — lucide-react is not a storybook dependency) ──

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

// A bare switch mock (the real app passes its themed Switch via the provider).
function MiniSwitch({ on }: { on: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${on ? "justify-end bg-primary" : "justify-start bg-muted"}`}
    >
      <span className="size-4 rounded-full bg-white shadow" />
    </span>
  );
}

export const WithTitle: Story = {
  name: "Title + body",
  render: () => (
    <div className="max-w-xl">
      <FeatureCard title="기본 정보" icon={<MessageIcon />}>
        <p className="text-sm text-muted-foreground">
          이름·코드·설명을 입력하는 섹션입니다. 본문에는 어떤 콘텐츠든 들어갈 수 있습니다.
        </p>
      </FeatureCard>
    </div>
  ),
};

export const WithToggleAction: Story = {
  name: "Feature toggle (action slot)",
  render: () => {
    const [on, setOn] = React.useState(true);
    return (
      <div className="max-w-xl">
        <FeatureCard
          title="댓글"
          icon={<MessageIcon />}
          action={
            <button type="button" onClick={() => setOn((v) => !v)} aria-label="댓글 기능 토글">
              <MiniSwitch on={on} />
            </button>
          }
        >
          <p className={`text-sm ${on ? "text-foreground" : "text-muted-foreground opacity-60"}`}>
            {on ? "댓글이 활성화되어 있습니다. 작성·신고 정책을 설정하세요." : "댓글이 꺼져 있습니다."}
          </p>
        </FeatureCard>
      </div>
    );
  },
};

export const HeaderLess: Story = {
  name: "Header-less (body only)",
  render: () => (
    <div className="max-w-xl">
      <FeatureCard>
        <p className="text-sm text-muted-foreground">제목/액션 없이 본문만 담은 범용 카드입니다.</p>
      </FeatureCard>
    </div>
  ),
};

export const Stack: Story = {
  name: "Modal body — card stack",
  render: () => {
    const [comments, setComments] = React.useState(true);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <FeatureCard title="기본 정보" icon={<MessageIcon />}>
          <p className="text-sm text-muted-foreground">이름·코드·설명.</p>
        </FeatureCard>
        <FeatureCard
          title="댓글"
          icon={<MessageIcon />}
          action={
            <button type="button" onClick={() => setComments((v) => !v)} aria-label="댓글 기능 토글">
              <MiniSwitch on={comments} />
            </button>
          }
        >
          <p className="text-sm text-muted-foreground">댓글 작성·신고 정책.</p>
        </FeatureCard>
        <FeatureCard title="첨부" icon={<MessageIcon />}>
          <p className="text-sm text-muted-foreground">허용 파일 유형·용량 제한.</p>
        </FeatureCard>
      </div>
    );
  },
};
