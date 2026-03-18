import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  Badge,
  Button,
  type ButtonProps,
  Input,
  type InputProps,
  Label,
  UIProvider,
  createOverrides,
  withOverride,
} from "@simplix-react/ui";

/** Reusable form section to show component rendering. */
function SampleFormSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge>Draft</Badge>
        <Badge variant="success">Active</Badge>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="user@example.com" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Customization/Override Basics",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Demonstrates the UIProvider override system. Wrap your app in `<UIProvider overrides={{...}}>` to replace any base component globally or within a scope.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "Default (No Overrides)",
  parameters: {
    docs: {
      description: {
        story: "A form section using default Button, Input, and Badge components without any overrides.",
      },
    },
  },
  render: () => <SampleFormSection />,
};

/** A rounded button variant. */
function RoundedButton(props: ButtonProps) {
  return <Button {...props} className={`rounded-full ${props.className ?? ""}`} />;
}

export const CustomButton: Story = {
  name: "Custom Button Override",
  parameters: {
    docs: {
      description: {
        story:
          "Overrides the default Button with a fully-rounded variant. All Buttons inside this UIProvider render with `rounded-full`.",
      },
    },
  },
  render: () => (
    <UIProvider overrides={{ Button: RoundedButton }}>
      <SampleFormSection />
    </UIProvider>
  ),
};

/** A taller Input with larger font. */
const TallInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input ref={ref} {...props} className={`h-12 text-lg ${props.className ?? ""}`} />
));
TallInput.displayName = "TallInput";

export const CustomInput: Story = {
  name: "Custom Input Override",
  parameters: {
    docs: {
      description: {
        story: "Overrides the default Input with a taller, larger-font variant (`h-12 text-lg`).",
      },
    },
  },
  render: () => (
    <UIProvider overrides={{ Input: TallInput }}>
      <SampleFormSection />
    </UIProvider>
  ),
};

export const WithOverrideHelper: Story = {
  name: "withOverride Helper",
  parameters: {
    docs: {
      description: {
        story:
          "Uses the `withOverride` utility to create overrides without writing a full component. " +
          "`withOverride(Component, { className })` merges the given className as a default.",
      },
    },
  },
  render: () => {
    const overrides = createOverrides((defaults) => ({
      Button: withOverride(defaults.Button, { className: "rounded-full shadow-lg" }),
      Input: withOverride(defaults.Input, { className: "h-12 text-lg border-2 border-blue-300" }),
    }));

    return (
      <UIProvider overrides={overrides}>
        <SampleFormSection />
      </UIProvider>
    );
  },
};

export const ScopedOverrides: Story = {
  name: "Scoped (Nested) Overrides",
  parameters: {
    docs: {
      description: {
        story:
          "UIProvider can be nested. The inner provider's overrides take precedence within its subtree, " +
          "while the outer overrides apply everywhere else.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <UIProvider overrides={{ Button: withOverride(Button, { className: "rounded-full" }) }}>
        <div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
            Outer scope: rounded buttons
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        </div>

        <UIProvider
          overrides={{
            Button: withOverride(Button, { className: "rounded-none uppercase tracking-wider" }),
          }}
        >
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              Inner scope: square uppercase buttons
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </div>
          </div>
        </UIProvider>
      </UIProvider>
    </div>
  ),
};
