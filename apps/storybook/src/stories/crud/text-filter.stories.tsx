import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextFilter } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/TextFilter",
  component: TextFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof TextFilter>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");
    return <TextFilter label="Search" value={value} onChange={setValue} />;
  },
};

export const WithPlaceholder: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");
    return <TextFilter label="Search pets" value={value} onChange={setValue} placeholder="Type a pet name..." />;
  },
};

export const WithValue: StoryObj = {
  render: () => {
    const [value, setValue] = useState("Buddy");
    return <TextFilter label="Search" value={value} onChange={setValue} />;
  },
};
