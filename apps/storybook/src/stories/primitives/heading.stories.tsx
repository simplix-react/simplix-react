import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "@simplix-react/ui";

const meta = {
  title: "Primitives/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
      description: "Heading level (h1-h6) - controls visual size and rendered tag",
    },
    tone: {
      control: "select",
      options: ["default", "muted", "primary", "destructive"],
      description: "Color tone",
    },
    font: {
      control: "select",
      options: ["sans", "display", "mono"],
      description: "Font family",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      description: "Override the rendered HTML tag",
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Playground --

export const Playground: Story = {
  args: {
    level: 1,
    tone: "default",
    children: "Heading Playground",
  },
};

// -- Level variants --

export const Level1: Story = {
  name: "Level 1 (h1)",
  args: { level: 1, children: "Heading Level 1 - Page Title" },
};

export const Level2: Story = {
  name: "Level 2 (h2)",
  args: { level: 2, children: "Heading Level 2 - Section Header" },
};

export const Level3: Story = {
  name: "Level 3 (h3)",
  args: { level: 3, children: "Heading Level 3 - Subsection" },
};

export const Level4: Story = {
  name: "Level 4 (h4)",
  args: { level: 4, children: "Heading Level 4 - Card Title" },
};

export const Level5: Story = {
  name: "Level 5 (h5)",
  args: { level: 5, children: "Heading Level 5 - Label" },
};

export const Level6: Story = {
  name: "Level 6 (h6)",
  args: { level: 6, children: "Heading Level 6 - Small Label" },
};

// -- All levels together --

export const AllLevels: Story = {
  name: "All Levels",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Heading level={1}>Level 1 - text-4xl font-bold</Heading>
      <Heading level={2}>Level 2 - text-3xl font-semibold</Heading>
      <Heading level={3}>Level 3 - text-2xl font-semibold</Heading>
      <Heading level={4}>Level 4 - text-xl font-semibold</Heading>
      <Heading level={5}>Level 5 - text-lg font-medium</Heading>
      <Heading level={6}>Level 6 - text-base font-medium</Heading>
    </div>
  ),
};

// -- Tone variants --

export const ToneDefault: Story = {
  name: "Tone: default",
  args: { level: 2, tone: "default", children: "Default tone heading" },
};

export const ToneMuted: Story = {
  name: "Tone: muted",
  args: { level: 2, tone: "muted", children: "Muted tone heading" },
};

export const TonePrimary: Story = {
  name: "Tone: primary",
  args: { level: 2, tone: "primary", children: "Primary tone heading" },
};

export const ToneDestructive: Story = {
  name: "Tone: destructive",
  args: { level: 2, tone: "destructive", children: "Destructive tone heading" },
};

export const AllTones: Story = {
  name: "All Tones",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["default", "muted", "primary", "destructive"] as const).map((tone) => (
        <Heading key={tone} level={3} tone={tone}>
          Tone: {tone}
        </Heading>
      ))}
    </div>
  ),
};

// -- Font variants --

export const FontSans: Story = {
  name: "Font: sans",
  args: { level: 2, font: "sans", children: "Sans font heading" },
};

export const FontDisplay: Story = {
  name: "Font: display",
  args: { level: 2, font: "display", children: "Display font heading" },
};

export const FontMono: Story = {
  name: "Font: mono",
  args: { level: 2, font: "mono", children: "Mono font heading" },
};

export const AllFonts: Story = {
  name: "All Fonts",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["sans", "display", "mono"] as const).map((font) => (
        <Heading key={font} level={2} font={font}>
          Font: {font}
        </Heading>
      ))}
    </div>
  ),
};

// -- Tag override --

export const TagOverride: Story = {
  name: "Tag Override: visually h1, semantically h3",
  args: {
    level: 1,
    as: "h3",
    children: "Looks like h1, but renders as <h3>",
  },
  parameters: {
    docs: {
      description: {
        story: "Use `as` to decouple visual style from semantic heading level.",
      },
    },
  },
};

// -- Realistic usage --

export const PageHeader: Story = {
  name: "Example: Page Header",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Heading level={1}>User Management</Heading>
      <Heading level={5} tone="muted" as="h2">
        Manage team members, roles, and permissions
      </Heading>
    </div>
  ),
};
