import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@simplix-react/ui";

const meta = {
  title: "Base/Overlay/Popover",
  component: Popover,
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>Dimensions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label htmlFor="width" style={{ width: 60 }}>Width</Label>
              <Input id="width" defaultValue="100%" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label htmlFor="height" style={{ width: 60 }}>Height</Label>
              <Input id="height" defaultValue="auto" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignStart: Story = {
  name: "Align: start",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align Start</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <p style={{ fontSize: 14, margin: 0 }}>
          This popover is aligned to the start of the trigger.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignEnd: Story = {
  name: "Align: end",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align End</Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p style={{ fontSize: 14, margin: 0 }}>
          This popover is aligned to the end of the trigger.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  name: "With Form",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Quick Feedback</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>Send Feedback</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Label htmlFor="feedback">Your feedback</Label>
            <Input id="feedback" placeholder="What can we improve?" />
          </div>
          <Button size="sm">Submit</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
