import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@simplix-react/ui";

const meta = {
  title: "Base/Overlay/Sheet",
  component: Sheet,
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when done.
          </SheetDescription>
        </SheetHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Label htmlFor="sheet-name">Name</Label>
            <Input id="sheet-name" defaultValue="John Doe" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Label htmlFor="sheet-email">Email</Label>
            <Input id="sheet-email" defaultValue="john@example.com" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const SideRight: Story = {
  name: "Side: right",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Right Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Right Panel</SheetTitle>
          <SheetDescription>This sheet slides in from the right.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideLeft: Story = {
  name: "Side: left",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Application sidebar navigation.</SheetDescription>
        </SheetHeader>
        <nav style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {["Dashboard", "Projects", "Team", "Settings"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 14,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const SideTop: Story = {
  name: "Side: top",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Announcement</SheetTitle>
          <SheetDescription>
            We have released a new version with important updates.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideBottom: Story = {
  name: "Side: bottom",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Cookie Preferences</SheetTitle>
          <SheetDescription>
            Manage your cookie settings and privacy preferences.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Decline All</Button>
          </SheetClose>
          <Button>Accept All</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithoutCloseButton: Story = {
  name: "Without Close Button",
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">No Close Button</Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Required Action</SheetTitle>
          <SheetDescription>
            Complete the required steps before closing.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
