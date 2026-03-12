import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@simplix-react/ui";

const meta = {
  title: "Base/Navigation/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ width: 400, padding: 8 }}>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Introduction</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Learn the basics of the framework and start building.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Installation</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Step-by-step guide to set up your development environment.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Configuration</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Customize settings to match your project requirements.
                </p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ width: 320, padding: 8 }}>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Button</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Trigger actions with multiple style variants.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Dialog</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Modal overlays for user interactions.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Table</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Display structured data with sorting and filtering.
                </p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SimpleLinks: Story = {
  name: "Simple Links",
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithoutViewport: Story = {
  name: "Without Viewport",
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ width: 300, padding: 8 }}>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Analytics</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Track your website performance and user behavior.
                </p>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div style={{ fontWeight: 500 }}>Monitoring</div>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                  Real-time alerts and system health dashboards.
                </p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
