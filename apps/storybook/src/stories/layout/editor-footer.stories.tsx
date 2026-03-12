import type { Meta, StoryObj } from "@storybook/react";
import { EditorFooter } from "@simplix-react/ui";

const meta = {
  title: "Layout/EditorFooter",
  component: EditorFooter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
} satisfies Meta<typeof EditorFooter>;

export default meta;

function MockButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      style={{
        padding: "6px 16px",
        borderRadius: 6,
        border: primary ? "none" : "1px solid #e5e7eb",
        background: primary ? "#3b82f6" : "transparent",
        color: primary ? "#fff" : "inherit",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export const Default: StoryObj = {
  render: () => (
    <EditorFooter>
      <MockButton label="Cancel" />
      <MockButton label="Save" primary />
    </EditorFooter>
  ),
};

export const WithBackAndSave: StoryObj = {
  render: () => (
    <EditorFooter>
      <MockButton label="Back" />
      <div style={{ display: "flex", gap: 8 }}>
        <MockButton label="Save draft" />
        <MockButton label="Publish" primary />
      </div>
    </EditorFooter>
  ),
};

export const SingleAction: StoryObj = {
  render: () => (
    <EditorFooter>
      <span />
      <MockButton label="Submit" primary />
    </EditorFooter>
  ),
};
