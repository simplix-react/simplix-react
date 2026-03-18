import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchPopover, Flex, Text } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/SearchPopover",
  component: SearchPopover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SearchPopover>;

export default meta;

// ── Icons ──

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-muted-foreground" aria-hidden="true">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ── Mock data ──

interface AccessLevel {
  id: string;
  name: string;
}

const allAccessLevels: AccessLevel[] = [
  { id: "al-1", name: "Full Access" },
  { id: "al-2", name: "Lobby Only" },
  { id: "al-3", name: "Parking Garage" },
  { id: "al-4", name: "Server Room" },
  { id: "al-5", name: "Executive Floor" },
];

interface Door {
  id: string;
  name: string;
}

const doorsByController = [
  {
    label: "Controller A (Main Building)",
    items: [
      { id: "d-1", name: "Main Entrance" },
      { id: "d-2", name: "Side Door" },
      { id: "d-3", name: "Loading Dock" },
    ] as Door[],
  },
  {
    label: "Controller B (Parking)",
    items: [
      { id: "d-4", name: "Garage Gate" },
      { id: "d-5", name: "Pedestrian Gate" },
    ] as Door[],
  },
  {
    label: "Controller C (Office)",
    items: [
      { id: "d-6", name: "Floor 1 Entry" },
      { id: "d-7", name: "Floor 2 Entry" },
      { id: "d-8", name: "Floor 3 Entry" },
    ] as Door[],
  },
];

// ── Stories ──

export const FlatList: StoryObj = {
  render: () => {
    const [assigned, setAssigned] = useState<AccessLevel[]>([allAccessLevels[0]!]);
    const available = allAccessLevels.filter(
      (level) => !assigned.some((a) => a.id === level.id),
    );

    return (
      <div style={{ width: 320 }}>
        <SearchPopover
          triggerText="Assign Level"
          items={available}
          getLabel={(l) => l.name}
          getKey={(l) => l.id}
          onSelect={(l) => setAssigned((prev) => [...prev, l])}
        />
        <Flex wrap gap="sm" className="mt-3">
          {assigned.map((level) => (
            <Flex
              key={level.id}
              align="center"
              gap="xs"
              className="rounded-md border bg-card px-3 py-1.5"
            >
              <KeyIcon />
              <Text size="sm">{level.name}</Text>
              <button
                type="button"
                onClick={() => setAssigned((prev) => prev.filter((a) => a.id !== level.id))}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <XIcon />
              </button>
            </Flex>
          ))}
        </Flex>
      </div>
    );
  },
};

export const GroupedList: StoryObj = {
  render: () => {
    const [assigned, setAssigned] = useState<Door[]>([]);
    const usedIds = new Set(assigned.map((d) => d.id));
    const availableGroups = doorsByController
      .map((group) => ({
        ...group,
        items: group.items.filter((d) => !usedIds.has(d.id)),
      }))
      .filter((group) => group.items.length > 0);

    return (
      <div style={{ width: 320 }}>
        <SearchPopover
          triggerText="Assign Door"
          groups={availableGroups}
          getLabel={(d) => d.name}
          getKey={(d) => d.id}
          onSelect={(d) => setAssigned((prev) => [...prev, d])}
        />
        {assigned.length > 0 && (
          <div className="mt-3 space-y-1">
            {assigned.map((door) => (
              <Flex key={door.id} align="center" justify="between" className="rounded-md border px-3 py-1.5">
                <Text size="sm">{door.name}</Text>
                <button
                  type="button"
                  onClick={() => setAssigned((prev) => prev.filter((d) => d.id !== door.id))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                </button>
              </Flex>
            ))}
          </div>
        )}
      </div>
    );
  },
};

export const Disabled: StoryObj = {
  render: () => (
    <SearchPopover
      triggerText="Assign Level"
      items={allAccessLevels}
      getLabel={(l) => l.name}
      getKey={(l) => l.id}
      onSelect={() => {}}
      disabled
      disabledReason="Maximum of 5 access levels reached"
    />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <SearchPopover
      triggerText="Assign Level"
      items={[] as AccessLevel[]}
      getLabel={(l) => l.name}
      getKey={(l) => l.id}
      onSelect={() => {}}
      emptyMessage="All access levels have been assigned"
    />
  ),
};
