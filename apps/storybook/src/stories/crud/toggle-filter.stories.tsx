import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleFilter } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/ToggleFilter",
  component: ToggleFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ToggleFilter>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState<boolean | undefined>(undefined);
    return <ToggleFilter label="Active only" value={value} onChange={setValue} />;
  },
};

export const InitiallyTrue: StoryObj = {
  render: () => {
    const [value, setValue] = useState<boolean | undefined>(true);
    return <ToggleFilter label="Published" value={value} onChange={setValue} />;
  },
};

export const InitiallyFalse: StoryObj = {
  render: () => {
    const [value, setValue] = useState<boolean | undefined>(false);
    return <ToggleFilter label="Verified" value={value} onChange={setValue} />;
  },
};
