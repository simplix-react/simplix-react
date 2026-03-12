import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/NoteField",
  component: DetailFields.DetailNoteField,
  tags: ["autodocs"],
} satisfies Meta<typeof DetailFields.DetailNoteField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "This is a description or note that provides additional context about the item. It can span multiple lines and is displayed with a subtle background.",
  },
};

export const MultiLine: Story = {
  args: {
    value: "First paragraph of the note.\n\nSecond paragraph with more details about the item.\n\nThird paragraph explaining additional context.",
  },
};

export const NullValue: Story = {
  args: {
    value: null,
  },
};

export const WithFallback: Story = {
  args: {
    value: null,
    fallback: "No description provided",
  },
};

export const LongText: Story = {
  args: {
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
};
