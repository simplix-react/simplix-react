import type { Meta, StoryObj } from "@storybook/react";
import { FilterActions } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/FilterActions",
  component: FilterActions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof FilterActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoActiveFilters: Story = {
  args: {
    hasActiveFilters: false,
    onClear: () => {},
    onApply: () => alert("Apply clicked"),
    isPending: false,
  },
};

export const WithActiveFilters: Story = {
  args: {
    hasActiveFilters: true,
    onClear: () => alert("Cleared!"),
    onApply: () => alert("Applied!"),
    isPending: true,
  },
};

export const PendingChanges: Story = {
  args: {
    hasActiveFilters: true,
    onClear: () => {},
    onApply: () => alert("Applied!"),
    isPending: true,
  },
};

export const ClearOnly: Story = {
  args: {
    hasActiveFilters: true,
    onClear: () => alert("Cleared!"),
  },
};
