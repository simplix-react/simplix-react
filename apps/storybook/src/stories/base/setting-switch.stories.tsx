import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingSwitch } from "@simplix-react/ui";

const meta = {
  title: "Base/Controls/SettingSwitch",
  component: SettingSwitch,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof SettingSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email Notifications",
    description: "Receive email when someone mentions you.",
    checked: false,
    onCheckedChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    label: "Dark Mode",
    description: "Use a dark color scheme throughout the application.",
    checked: true,
    onCheckedChange: () => {},
  },
};

export const WithoutDescription: Story = {
  name: "Without Description",
  args: {
    label: "Enable notifications",
    checked: true,
    onCheckedChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: "Two-Factor Authentication",
    description: "This setting is managed by your organization.",
    checked: false,
    disabled: true,
    onCheckedChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ width: 360 }}>
        <SettingSwitch
          label="Auto-save documents"
          description="Automatically save your work every 30 seconds."
          checked={checked}
          onCheckedChange={setChecked}
        />
      </div>
    );
  },
};
