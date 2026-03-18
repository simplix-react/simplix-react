import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AssignmentPanel,
  ConfirmDialog,
  FormFields,
  SearchPopover,
  Flex,
  Text,
} from "@simplix-react/ui";

const meta = {
  title: "CRUD/Assignment/AssignmentPanel",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

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

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-muted-foreground" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
}

function UnlinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
      <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
      <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
      <line x1="8" y1="2" x2="8" y2="5" />
      <line x1="2" y1="8" x2="5" y2="8" />
      <line x1="16" y1="19" x2="16" y2="22" />
      <line x1="19" y1="16" x2="22" y2="16" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-muted-foreground" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
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
  doorCount: number;
  scheduleCount: number;
}

const mockAccessLevels: AccessLevel[] = [
  { id: "al-1", name: "Full Access", doorCount: 12, scheduleCount: 3 },
  { id: "al-2", name: "Lobby Only", doorCount: 2, scheduleCount: 1 },
  { id: "al-3", name: "Parking Garage", doorCount: 4, scheduleCount: 2 },
  { id: "al-4", name: "Server Room", doorCount: 1, scheduleCount: 1 },
  { id: "al-5", name: "Executive Floor", doorCount: 6, scheduleCount: 2 },
];

const allAccessLevels: AccessLevel[] = [
  ...mockAccessLevels,
  { id: "al-6", name: "Visitor Access", doorCount: 3, scheduleCount: 1 },
  { id: "al-7", name: "Maintenance", doorCount: 8, scheduleCount: 2 },
];

interface DoorAssignment {
  id: string;
  name: string;
  entrySchedule: string;
  exitSchedule: string;
}

const scheduleOptions = [
  { label: "24/7", value: "sch-1" },
  { label: "Business Hours", value: "sch-2" },
  { label: "Night Shift", value: "sch-3" },
  { label: "Weekends Only", value: "sch-4" },
];

const mockDoorAssignments: DoorAssignment[] = [
  { id: "da-1", name: "Main Entrance", entrySchedule: "sch-1", exitSchedule: "sch-1" },
  { id: "da-2", name: "Side Door", entrySchedule: "sch-2", exitSchedule: "sch-2" },
  { id: "da-3", name: "Loading Dock", entrySchedule: "sch-3", exitSchedule: "sch-1" },
];

interface UserGroup {
  id: string;
  name: string;
  memberCount: number;
}

const mockUserGroups: UserGroup[] = [
  { id: "ug-1", name: "Administrators", memberCount: 5 },
  { id: "ug-2", name: "Operators", memberCount: 12 },
  { id: "ug-3", name: "Security Guards", memberCount: 8 },
  { id: "ug-4", name: "Front Desk", memberCount: 3 },
];

const allUserGroups: UserGroup[] = [
  ...mockUserGroups,
  { id: "ug-5", name: "IT Support", memberCount: 6 },
  { id: "ug-6", name: "Management", memberCount: 4 },
];

interface AreaDoor {
  id: string;
  name: string;
  fromArea: string;
  toArea: string;
}

const areaOptions = [
  { label: "Outside", value: "area-0" },
  { label: "Lobby", value: "area-1" },
  { label: "Office", value: "area-2" },
  { label: "Parking", value: "area-3" },
  { label: "Server Room", value: "area-4" },
];

const mockAreaDoors: AreaDoor[] = [
  { id: "ad-1", name: "Main Entrance", fromArea: "area-0", toArea: "area-1" },
  { id: "ad-2", name: "Office Door", fromArea: "area-1", toArea: "area-2" },
  { id: "ad-3", name: "Parking Gate", fromArea: "area-0", toArea: "area-3" },
];

// ── Stories ──

export const TableMode: StoryObj = {
  render: () => {
    const [levels, setLevels] = useState(mockAccessLevels.slice(0, 3));
    const available = allAccessLevels.filter(
      (al) => !levels.some((l) => l.id === al.id),
    );

    return (
      <div style={{ maxWidth: 640 }}>
        <AssignmentPanel
          title="Access Levels"
          count={levels.length}
          action={
            <SearchPopover
              triggerText="Assign"
              items={available}
              getLabel={(l) => l.name}
              getKey={(l) => l.id}
              onSelect={(l) => setLevels((prev) => [...prev, l])}
            />
          }
        >
          <AssignmentPanel.Table
            data={levels}
            rowId={(r) => r.id}
            actions={[
              {
                type: "unlink",
                onClick: (row) => setLevels((prev) => prev.filter((l) => l.id !== row.id)),
              },
            ]}
          >
            <AssignmentPanel.Column<AccessLevel> field="name" header="Name" />
            <AssignmentPanel.Column<AccessLevel> field="doorCount" header="Doors" width={80} />
            <AssignmentPanel.Column<AccessLevel> field="scheduleCount" header="Schedules" width={100} />
          </AssignmentPanel.Table>
        </AssignmentPanel>
      </div>
    );
  },
};

export const TableWithInlineEditing: StoryObj = {
  render: () => {
    const [doors, setDoors] = useState(mockDoorAssignments);

    const updateSchedule = (id: string, field: "entrySchedule" | "exitSchedule", value: string) => {
      setDoors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      );
    };

    return (
      <div style={{ maxWidth: 700 }}>
        <AssignmentPanel
          title="Door Assignments"
          count={doors.length}
          action={
            <SearchPopover
              triggerText="Add Door"
              items={[
                { id: "da-4", name: "Floor 2 Entry" },
                { id: "da-5", name: "Garage Gate" },
              ]}
              getLabel={(d) => d.name}
              getKey={(d) => d.id}
              onSelect={(d) =>
                setDoors((prev) => [...prev, { ...d, entrySchedule: "sch-1", exitSchedule: "sch-1" }])
              }
            />
          }
        >
          <AssignmentPanel.Table
            data={doors}
            rowId={(r) => r.id}
            actions={[
              {
                type: "unlink",
                onClick: (row) => setDoors((prev) => prev.filter((d) => d.id !== row.id)),
              },
            ]}
          >
            <AssignmentPanel.Column<DoorAssignment> field="name" header="Door" />
            <AssignmentPanel.Column<DoorAssignment> header="Entry Schedule" width={160}>
              {({ row }) => (
                <FormFields.SelectField
                  compact
                  value={row.entrySchedule}
                  onChange={(v) => updateSchedule(row.id, "entrySchedule", v)}
                  options={scheduleOptions}
                />
              )}
            </AssignmentPanel.Column>
            <AssignmentPanel.Column<DoorAssignment> header="Exit Schedule" width={160}>
              {({ row }) => (
                <FormFields.SelectField
                  compact
                  value={row.exitSchedule}
                  onChange={(v) => updateSchedule(row.id, "exitSchedule", v)}
                  options={scheduleOptions}
                />
              )}
            </AssignmentPanel.Column>
          </AssignmentPanel.Table>
        </AssignmentPanel>
      </div>
    );
  },
};

export const ChipsMode: StoryObj = {
  render: () => {
    const [groups, setGroups] = useState(mockUserGroups.slice(0, 3));
    const available = allUserGroups.filter(
      (ug) => !groups.some((g) => g.id === ug.id),
    );

    return (
      <div style={{ maxWidth: 500 }}>
        <AssignmentPanel
          title="User Groups"
          count={groups.length}
          action={
            <SearchPopover
              triggerText="Add Group"
              items={available}
              getLabel={(g) => g.name}
              getKey={(g) => g.id}
              onSelect={(g) => setGroups((prev) => [...prev, g])}
            />
          }
        >
          <AssignmentPanel.Chips
            data={groups}
            renderItem={(group) => (
              <Flex
                key={group.id}
                align="center"
                gap="xs"
                className="h-8 rounded-md border bg-card px-3"
              >
                <UsersIcon />
                <Text size="sm">{group.name}</Text>
                <span className="ml-0.5 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {group.memberCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
                  className="ml-1 rounded-sm text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                </button>
              </Flex>
            )}
          />
        </AssignmentPanel>
      </div>
    );
  },
};

export const ChipsWithBuiltInChip: StoryObj = {
  render: () => {
    const [groups, setGroups] = useState(mockUserGroups.slice(0, 3));
    const available = allUserGroups.filter(
      (ug) => !groups.some((g) => g.id === ug.id),
    );

    return (
      <div style={{ maxWidth: 500 }}>
        <AssignmentPanel
          title="User Groups"
          count={groups.length}
          action={
            <SearchPopover
              triggerText="Add Group"
              items={available}
              getLabel={(g) => g.name}
              getKey={(g) => g.id}
              onSelect={(g) => setGroups((prev) => [...prev, g])}
            />
          }
        >
          <AssignmentPanel.Chips
            data={groups}
            renderItem={(group) => (
              <AssignmentPanel.Chip
                key={group.id}
                label={group.name}
                icon={<UsersIcon />}
                onRemove={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
              />
            )}
          />
        </AssignmentPanel>
      </div>
    );
  },
};

export const CustomBody: StoryObj = {
  render: () => {
    const [doors, setDoors] = useState(mockAreaDoors);

    const updateArea = (id: string, field: "fromArea" | "toArea", value: string) => {
      setDoors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      );
    };

    return (
      <div style={{ maxWidth: 480 }}>
        <AssignmentPanel
          title="Area Doors"
          count={doors.length}
          action={
            <SearchPopover
              triggerText="Add Door"
              items={[
                { id: "ad-4", name: "Stairwell A" },
                { id: "ad-5", name: "Emergency Exit" },
              ]}
              getLabel={(d) => d.name}
              getKey={(d) => d.id}
              onSelect={(d) =>
                setDoors((prev) => [...prev, { ...d, fromArea: "area-0", toArea: "area-1" }])
              }
            />
          }
        >
          <div className="divide-y">
            {doors.map((door) => (
              <div key={door.id} className="flex items-center gap-3 px-4 py-3">
                <DoorIcon />
                <div className="min-w-0 flex-1 space-y-2">
                  <Flex align="center" justify="between">
                    <Text size="sm" className="font-medium">{door.name}</Text>
                    <button
                      type="button"
                      onClick={() => setDoors((prev) => prev.filter((d) => d.id !== door.id))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <UnlinkIcon />
                    </button>
                  </Flex>
                  <Flex gap="sm">
                    <FormFields.SelectField
                      compact
                      value={door.fromArea}
                      onChange={(v) => updateArea(door.id, "fromArea", v)}
                      options={areaOptions}
                      placeholder="From area"
                    />
                    <Text size="sm" className="self-center text-muted-foreground">to</Text>
                    <FormFields.SelectField
                      compact
                      value={door.toArea}
                      onChange={(v) => updateArea(door.id, "toArea", v)}
                      options={areaOptions}
                      placeholder="To area"
                    />
                  </Flex>
                </div>
              </div>
            ))}
          </div>
        </AssignmentPanel>
      </div>
    );
  },
};

export const WithConfirmDialog: StoryObj = {
  render: () => {
    const [levels, setLevels] = useState(mockAccessLevels.slice(0, 3));
    const [confirmTarget, setConfirmTarget] = useState<AccessLevel | null>(null);
    const available = allAccessLevels.filter(
      (al) => !levels.some((l) => l.id === al.id),
    );

    return (
      <div style={{ maxWidth: 640 }}>
        <AssignmentPanel
          title="Access Levels"
          count={levels.length}
          action={
            <SearchPopover
              triggerText="Assign"
              items={available}
              getLabel={(l) => l.name}
              getKey={(l) => l.id}
              onSelect={(l) => setLevels((prev) => [...prev, l])}
            />
          }
        >
          <AssignmentPanel.Table
            data={levels}
            rowId={(r) => r.id}
            actions={[
              {
                type: "unlink",
                onClick: (row) => setConfirmTarget(row),
              },
            ]}
          >
            <AssignmentPanel.Column<AccessLevel> field="name" header="Name">
              {({ row }) => (
                <Flex align="center" gap="xs">
                  <KeyIcon />
                  <Text size="sm">{row.name}</Text>
                </Flex>
              )}
            </AssignmentPanel.Column>
            <AssignmentPanel.Column<AccessLevel> field="doorCount" header="Doors" width={80} />
          </AssignmentPanel.Table>
        </AssignmentPanel>

        <ConfirmDialog
          open={confirmTarget !== null}
          onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
          title="Unlink Access Level"
          description={
            confirmTarget
              ? `Remove "${confirmTarget.name}" from this cardholder? The access level itself will not be deleted.`
              : ""
          }
          confirmLabel="Unlink"
          onConfirm={() => {
            if (confirmTarget) {
              setLevels((prev) => prev.filter((l) => l.id !== confirmTarget.id));
              setConfirmTarget(null);
            }
          }}
        />
      </div>
    );
  },
};

export const WithMaxLimit: StoryObj = {
  render: () => {
    const MAX_GROUPS = 4;
    const [groups, setGroups] = useState(mockUserGroups);
    const available = allUserGroups.filter(
      (ug) => !groups.some((g) => g.id === ug.id),
    );
    const isMaxReached = groups.length >= MAX_GROUPS;

    return (
      <div style={{ maxWidth: 500 }}>
        <AssignmentPanel
          title="User Groups"
          count={groups.length}
          action={
            <SearchPopover
              triggerText="Add Group"
              items={available}
              getLabel={(g) => g.name}
              getKey={(g) => g.id}
              onSelect={(g) => setGroups((prev) => [...prev, g])}
              disabled={isMaxReached}
              disabledReason={`Maximum of ${MAX_GROUPS} groups allowed`}
            />
          }
        >
          <AssignmentPanel.Chips
            data={groups}
            renderItem={(group) => (
              <AssignmentPanel.Chip
                key={group.id}
                label={group.name}
                icon={<ShieldIcon />}
                onRemove={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
              />
            )}
          />
        </AssignmentPanel>
        {isMaxReached && (
          <Text size="sm" className="mt-2 text-muted-foreground">
            Remove a group to add a new one (max {MAX_GROUPS}).
          </Text>
        )}
      </div>
    );
  },
};
