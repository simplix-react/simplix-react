import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Shared/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

function SearchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export const Default: Story = {
  args: {
    title: "No items found",
  },
};

export const WithDescription: Story = {
  args: {
    title: "No items found",
    description: "Try adjusting your search or filter to find what you're looking for.",
  },
};

export const WithIcon: Story = {
  args: {
    title: "No results",
    description: "We couldn't find any matching records.",
    icon: <SearchIcon />,
  },
};

export const WithAction: Story = {
  args: {
    title: "No items yet",
    description: "Get started by creating your first item.",
    icon: <InboxIcon />,
    action: (
      <button
        type="button"
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          background: "#3b82f6",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Create item
      </button>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Nothing here",
  },
};
