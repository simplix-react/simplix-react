import type { Meta, StoryObj } from "@storybook/react";
import { QueryFallback } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Shared/QueryFallback",
  component: QueryFallback,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
} satisfies Meta<typeof QueryFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const NotFound: Story = {
  args: {
    isLoading: false,
  },
};

export const CustomNotFoundMessage: Story = {
  args: {
    isLoading: false,
    notFoundMessage: "Pet not found. It may have been deleted.",
  },
};
