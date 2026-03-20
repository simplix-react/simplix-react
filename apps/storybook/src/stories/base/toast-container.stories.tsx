import type { Meta, StoryObj } from "@storybook/react";
import { ToastContainer, addToast } from "@simplix-react/ui";
import { Button } from "@simplix-react/ui";

const meta = {
  title: "Base/Feedback/ToastContainer",
  component: ToastContainer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button variant="default" onClick={() => addToast({ type: "success", message: "Operation completed successfully." })}>
          Success
        </Button>
        <Button variant="default" onClick={() => addToast({ type: "info", message: "A new device was detected on the network." })}>
          Info
        </Button>
        <Button variant="default" onClick={() => addToast({ type: "warning", message: "Certificate expires in 7 days." })}>
          Warning
        </Button>
        <Button variant="destructive" onClick={() => addToast({ type: "error", message: "Failed to connect to the access controller." })}>
          Error
        </Button>
      </div>
      <ToastContainer />
    </>
  ),
};

export const WithAction: Story = {
  name: "With Action Link",
  render: () => (
    <>
      <Button
        onClick={() =>
          addToast({
            type: "info",
            message: "New firmware available for 3 devices.",
            action: { label: "View details", href: "#" },
          })
        }
      >
        Show Toast with Action
      </Button>
      <ToastContainer />
    </>
  ),
};
