import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@simplix-react/ui";

const meta = {
  title: "Primitives/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["lg", "base", "sm", "caption"],
      description: "Text size scale",
    },
    tone: {
      control: "select",
      options: ["default", "muted", "primary", "destructive"],
      description: "Color tone",
    },
    font: {
      control: "select",
      options: ["sans", "display", "mono"],
      description: "Font family (mono defaults to <code> tag)",
    },
    as: {
      control: "select",
      options: ["p", "span", "div", "label", "code"],
      description: "Override the rendered HTML tag",
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Playground --

export const Playground: Story = {
  args: {
    size: "base",
    tone: "default",
    children: "Customize this text using the controls below.",
  },
};

// -- Size variants --

export const SizeLg: Story = {
  name: "Size: lg",
  args: { size: "lg", children: "Large text for emphasis and introductions" },
};

export const SizeBase: Story = {
  name: "Size: base (default)",
  args: { size: "base", children: "Base text for body content and paragraphs" },
};

export const SizeSm: Story = {
  name: "Size: sm",
  args: { size: "sm", children: "Small text for secondary information" },
};

export const SizeCaption: Story = {
  name: "Size: caption",
  args: { size: "caption", children: "Caption text for labels, hints, and metadata" },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["lg", "base", "sm", "caption"] as const).map((size) => (
        <Text key={size} size={size}>
          Size: {size} - The quick brown fox jumps over the lazy dog
        </Text>
      ))}
    </div>
  ),
};

// -- Tone variants --

export const ToneDefault: Story = {
  name: "Tone: default",
  args: { tone: "default", children: "Default tone text" },
};

export const ToneMuted: Story = {
  name: "Tone: muted",
  args: { tone: "muted", children: "Muted tone for secondary content" },
};

export const TonePrimary: Story = {
  name: "Tone: primary",
  args: { tone: "primary", children: "Primary tone for emphasis" },
};

export const ToneDestructive: Story = {
  name: "Tone: destructive",
  args: { tone: "destructive", children: "Destructive tone for errors and warnings" },
};

export const AllTones: Story = {
  name: "All Tones",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["default", "muted", "primary", "destructive"] as const).map((tone) => (
        <Text key={tone} tone={tone}>
          Tone: {tone}
        </Text>
      ))}
    </div>
  ),
};

// -- Font variants --

export const FontSans: Story = {
  name: "Font: sans",
  args: { font: "sans", children: "Sans-serif font for body text" },
};

export const FontDisplay: Story = {
  name: "Font: display",
  args: { font: "display", children: "Display font for decorative text" },
};

export const FontMono: Story = {
  name: "Font: mono (renders as <code>)",
  args: { font: "mono", children: "const result = await fetchData();" },
};

export const AllFonts: Story = {
  name: "All Fonts",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["sans", "display", "mono"] as const).map((font) => (
        <Text key={font} font={font}>
          Font: {font} - The quick brown fox jumps over the lazy dog
        </Text>
      ))}
    </div>
  ),
};

// -- Tag override --

export const AsSpan: Story = {
  name: "Tag: span",
  args: { as: "span", children: "Inline text as <span>" },
};

export const AsLabel: Story = {
  name: "Tag: label",
  args: { as: "label", children: "Label text as <label>" },
};

export const AsCode: Story = {
  name: "Tag: code (explicit)",
  args: { as: "code", font: "mono", size: "sm", children: "npm install @simplix-react/ui" },
};

// -- Combinations --

export const SizeAndToneMatrix: Story = {
  name: "Size x Tone Matrix",
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#6b7280" }}>
            Size / Tone
          </th>
          {(["default", "muted", "primary", "destructive"] as const).map((tone) => (
            <th
              key={tone}
              style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#6b7280" }}
            >
              {tone}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(["lg", "base", "sm", "caption"] as const).map((size) => (
          <tr key={size}>
            <td
              style={{
                padding: "8px 12px",
                fontSize: 12,
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {size}
            </td>
            {(["default", "muted", "primary", "destructive"] as const).map((tone) => (
              <td key={tone} style={{ padding: "8px 12px" }}>
                <Text size={size} tone={tone}>
                  Sample
                </Text>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

// -- Realistic usage --

export const ArticleBody: Story = {
  name: "Example: Article Content",
  render: () => (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text size="lg">
        Understanding React Server Components
      </Text>
      <Text tone="muted" size="sm">
        Published on March 12, 2026
      </Text>
      <Text>
        React Server Components represent a fundamental shift in how we think about rendering.
        They allow components to run on the server, reducing the JavaScript bundle sent to the
        client.
      </Text>
      <Text font="mono" size="sm">
        {`import { Suspense } from "react";`}
      </Text>
      <Text size="sm" tone="muted">
        Note: This feature requires React 19 or later.
      </Text>
    </div>
  ),
};
