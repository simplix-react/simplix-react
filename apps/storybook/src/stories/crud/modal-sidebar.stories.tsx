import type { Meta, StoryObj } from "@storybook/react";
import { ModalSidebar } from "@simplix-react/ui";

const meta = {
  title: "Crud/Modal/ModalSidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Compact key→value row grid for detail/form modal sidebars. Presentational shell — all label/value content is caller-provided (already localized). Compose with `ModalSidebar.Block` / `ModalSidebar.Row`. The only internally-translated string is the on/off badge's aria-label (`onLabel`/`offLabel` override it).",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <aside className="flex w-[320px] flex-col gap-6 rounded-lg border border-border bg-surface-2 p-6">
      <ModalSidebar>
        <ModalSidebar.Block title="기본 정보">
          <ModalSidebar.Row label="코드" value="NOTICE" />
          <ModalSidebar.Row label="유형" value="공지" />
          <ModalSidebar.Row label="상태" value="사용 중" />
        </ModalSidebar.Block>
      </ModalSidebar>
    </aside>
  ),
};

export const WithBooleanBadges: Story = {
  name: "Boolean badges (on / off)",
  render: () => (
    <aside className="flex w-[320px] flex-col gap-6 rounded-lg border border-border bg-surface-2 p-6">
      <ModalSidebar>
        <ModalSidebar.Block title="기능">
          <ModalSidebar.Row label="댓글" bool on onLabel="사용" offLabel="미사용" />
          <ModalSidebar.Row label="첨부" bool on onLabel="사용" offLabel="미사용" />
          <ModalSidebar.Row label="예약 발행" bool on={false} onLabel="사용" offLabel="미사용" />
          <ModalSidebar.Row label="다국어" bool on={false} onLabel="사용" offLabel="미사용" />
        </ModalSidebar.Block>
      </ModalSidebar>
    </aside>
  ),
};

export const EmptyValues: Story = {
  name: "Empty values (muted)",
  render: () => (
    <aside className="flex w-[320px] flex-col gap-6 rounded-lg border border-border bg-surface-2 p-6">
      <ModalSidebar>
        <ModalSidebar.Block title="메타">
          <ModalSidebar.Row label="상위 카테고리" value="−" />
          <ModalSidebar.Row label="설명" value="" />
          <ModalSidebar.Row label="등록일" value="2026-06-04" />
        </ModalSidebar.Block>
      </ModalSidebar>
    </aside>
  ),
};
