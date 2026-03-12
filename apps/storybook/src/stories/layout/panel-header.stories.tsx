import type { Meta, StoryObj } from "@storybook/react";
import { PanelHeader } from "@simplix-react/ui";

const meta = {
  title: "Layout/PanelHeader",
  component: PanelHeader,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof PanelHeader>;

export default meta;

export const Default: StoryObj<typeof PanelHeader> = {
  args: {
    title: "User Details",
    onClose: () => {},
  },
};

export const WithDescription: StoryObj<typeof PanelHeader> = {
  args: {
    title: "Pet Information",
    description: "View and manage pet records",
    onClose: () => {},
  },
};

export const WithChildren: StoryObj = {
  render: () => (
    <PanelHeader title="Orders" description="Recent order history" onClose={() => {}}>
      <button
        type="button"
        style={{
          padding: "4px 12px",
          borderRadius: 6,
          border: "none",
          background: "#3b82f6",
          color: "#fff",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        New order
      </button>
    </PanelHeader>
  ),
};

export const WithoutClose: StoryObj<typeof PanelHeader> = {
  args: {
    title: "Settings",
    description: "Application configuration",
  },
};

export const LongTitle: StoryObj<typeof PanelHeader> = {
  args: {
    title: "This is a very long panel title that should be truncated when it overflows the available space",
    description: "And this is also a long description that tests truncation behavior in the panel header",
    onClose: () => {},
  },
};
