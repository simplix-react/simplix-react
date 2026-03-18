import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import {
  Button,
  CrudForm,
  Flex,
  FormFields,
  Grid,
  Heading,
  SaveButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useIsDirty,
} from "@simplix-react/ui";

const meta = {
  title: "Recipes/Form Patterns",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 560, height: 640, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

// ── Inline SVG icons ──

function ArrowLeftSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

// ── Shared options ──

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

// ── Stories ──

export const BasicFormWithValidation: StoryObj = {
  render: () => {
    const [values, setValues] = useState({ name: "", email: "", status: "ACTIVE" });
    const initialValues = useRef(values).current;
    const isDirty = useIsDirty(values, initialValues);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const validate = () => {
      const next: Record<string, string> = {};
      if (!values.name.trim()) next.name = "Name is required";
      if (!values.email.trim()) next.email = "Email is required";
      else if (!values.email.includes("@")) next.email = "Invalid email format";
      return next;
    };

    const handleSubmit = () => {
      const validationErrors = validate();
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1500);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
      <CrudForm
        onSubmit={handleSubmit}
        header={<span style={{ fontSize: 14, fontWeight: 600 }}>Create User</span>}
        onClose={() => {}}
        footer={
          <CrudForm.Actions>
            <Button variant="outline" size="sm">Cancel</Button>
            <SaveButton type="submit" isDirty={isDirty} isSaving={isSaving} validationCount={hasErrors ? Object.keys(errors).length : 0}>
              Save
            </SaveButton>
          </CrudForm.Actions>
        }
      >
        <CrudForm.Section title="General" variant="card">
          <FormFields.TextField
            label="Name"
            value={values.name}
            onChange={(v) => { setValues((prev) => ({ ...prev, name: v })); setErrors((prev) => { const { name: _, ...rest } = prev; return rest; }); }}
            error={errors.name}
            required
            placeholder="Enter name"
          />
          <FormFields.TextField
            label="Email"
            value={values.email}
            onChange={(v) => { setValues((prev) => ({ ...prev, email: v })); setErrors((prev) => { const { email: _, ...rest } = prev; return rest; }); }}
            error={errors.email}
            required
            type="email"
            placeholder="user@example.com"
          />
          <FormFields.SelectField
            label="Status"
            value={values.status}
            onChange={(v) => setValues((prev) => ({ ...prev, status: v }))}
            options={STATUS_OPTIONS}
          />
        </CrudForm.Section>
      </CrudForm>
    );
  },
};

export const FormWithTabs: StoryObj = {
  render: () => {
    const [values, setValues] = useState({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+82-10-1234-5678",
      emailNotifications: true,
      vipAccess: false,
    });

    return (
      <CrudForm
        onSubmit={() => {}}
        header={<span style={{ fontSize: 14, fontWeight: 600 }}>Edit User</span>}
        onClose={() => {}}
        footer={
          <CrudForm.Actions>
            <Button variant="outline" size="sm">Cancel</Button>
            <SaveButton type="submit" isSaving={false}>Save</SaveButton>
          </CrudForm.Actions>
        }
      >
        <Tabs defaultValue="profile">
          <TabsList variant="full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" padded>
            <CrudForm.Section title="Personal Info" variant="card" collapsible>
              <Grid columns={2} gap="sm">
                <FormFields.TextField
                  label="First Name"
                  value={values.firstName}
                  onChange={(v) => setValues((prev) => ({ ...prev, firstName: v }))}
                  required
                />
                <FormFields.TextField
                  label="Last Name"
                  value={values.lastName}
                  onChange={(v) => setValues((prev) => ({ ...prev, lastName: v }))}
                  required
                />
              </Grid>
              <Grid columns={2} gap="sm">
                <FormFields.TextField
                  label="Email"
                  value={values.email}
                  onChange={(v) => setValues((prev) => ({ ...prev, email: v }))}
                  type="email"
                />
                <FormFields.TextField
                  label="Phone"
                  value={values.phone}
                  onChange={(v) => setValues((prev) => ({ ...prev, phone: v }))}
                  type="tel"
                />
              </Grid>
            </CrudForm.Section>
          </TabsContent>
          <TabsContent value="settings" padded>
            <CrudForm.Section title="Preferences" variant="card">
              <FormFields.SwitchField
                label="Email Notifications"
                value={values.emailNotifications}
                onChange={(v) => setValues((prev) => ({ ...prev, emailNotifications: v }))}
                layout="inline"
              />
              <FormFields.SwitchField
                label="VIP Access"
                value={values.vipAccess}
                onChange={(v) => setValues((prev) => ({ ...prev, vipAccess: v }))}
                layout="inline"
              />
            </CrudForm.Section>
          </TabsContent>
        </Tabs>
      </CrudForm>
    );
  },
};

export const FormWithDependentFields: StoryObj = {
  render: () => {
    const COMPANIES = [
      { label: "Acme Corp", value: "acme" },
      { label: "Globex Inc", value: "globex" },
      { label: "Initech", value: "initech" },
    ];

    const DEPARTMENTS: Record<string, Array<{ label: string; value: string }>> = {
      acme: [
        { label: "Engineering", value: "eng" },
        { label: "Marketing", value: "mkt" },
        { label: "Sales", value: "sales" },
      ],
      globex: [
        { label: "R&D", value: "rd" },
        { label: "Operations", value: "ops" },
      ],
      initech: [
        { label: "Finance", value: "fin" },
        { label: "HR", value: "hr" },
        { label: "IT", value: "it" },
      ],
    };

    const [values, setValues] = useState({ companyId: "", departmentId: "" });
    const departments = values.companyId ? DEPARTMENTS[values.companyId] ?? [] : [];

    return (
      <CrudForm
        onSubmit={() => {}}
        header={<span style={{ fontSize: 14, fontWeight: 600 }}>Assign Department</span>}
        onClose={() => {}}
        footer={
          <CrudForm.Actions>
            <Button variant="outline" size="sm">Cancel</Button>
            <SaveButton type="submit" isSaving={false}>Save</SaveButton>
          </CrudForm.Actions>
        }
      >
        <CrudForm.Section title="Assignment" variant="card">
          <FormFields.SelectField
            label="Company"
            value={values.companyId}
            onChange={(v) => setValues({ companyId: v, departmentId: "" })}
            options={COMPANIES}
            placeholder="Select a company"
            required
          />
          <FormFields.SelectField
            label="Department"
            value={values.departmentId}
            onChange={(v) => setValues((prev) => ({ ...prev, departmentId: v }))}
            options={departments}
            placeholder={values.companyId ? "Select a department" : "Select a company first"}
            disabled={!values.companyId}
            required
          />
        </CrudForm.Section>
      </CrudForm>
    );
  },
};

export const FormWithMixedFieldTypes: StoryObj = {
  render: () => {
    const [values, setValues] = useState({
      name: "Jane Smith",
      password: "",
      age: 28 as number | null,
      role: "user",
      date: null as Date | null,
      datetime: null as Date | null,
      dateRange: { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
      enableNotifications: true,
      acceptTerms: false,
      volume: 75,
      bio: "Software engineer based in Seoul.",
      plan: "pro",
      color: "#3b82f6",
    });

    return (
      <CrudForm
        onSubmit={() => {}}
        header={<span style={{ fontSize: 14, fontWeight: 600 }}>All Field Types</span>}
        onClose={() => {}}
        footer={
          <CrudForm.Actions>
            <SaveButton type="submit" isSaving={false}>Save</SaveButton>
          </CrudForm.Actions>
        }
      >
        <CrudForm.Section title="Text Inputs" variant="card">
          <FormFields.TextField
            label="Name"
            value={values.name}
            onChange={(v) => setValues((prev) => ({ ...prev, name: v }))}
          />
          <FormFields.PasswordField
            label="Password"
            value={values.password}
            onChange={(v) => setValues((prev) => ({ ...prev, password: v }))}
            placeholder="Enter password"
          />
          <FormFields.NumberField
            label="Age"
            value={values.age}
            onChange={(v) => setValues((prev) => ({ ...prev, age: v }))}
            min={0}
            max={150}
          />
          <FormFields.TextareaField
            label="Bio"
            value={values.bio}
            onChange={(v) => setValues((prev) => ({ ...prev, bio: v }))}
            rows={3}
          />
        </CrudForm.Section>

        <CrudForm.Section title="Selection" variant="card">
          <FormFields.SelectField
            label="Role"
            value={values.role}
            onChange={(v) => setValues((prev) => ({ ...prev, role: v }))}
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Guest", value: "guest" },
            ]}
          />
          <FormFields.RadioGroupField
            label="Plan"
            value={values.plan}
            onChange={(v) => setValues((prev) => ({ ...prev, plan: v }))}
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro", description: "Advanced features" },
              { label: "Enterprise", value: "enterprise", description: "Custom solutions" },
            ]}
            direction="row"
          />
          <FormFields.ColorField
            label="Brand Color"
            value={values.color}
            onChange={(v) => setValues((prev) => ({ ...prev, color: v }))}
          />
        </CrudForm.Section>

        <CrudForm.Section title="Dates" variant="card" collapsible>
          <FormFields.DateField
            label="Start Date"
            value={values.date}
            onChange={(v) => setValues((prev) => ({ ...prev, date: v }))}
          />
          <FormFields.DateTimeField
            label="Event Time"
            value={values.datetime}
            onChange={(v) => setValues((prev) => ({ ...prev, datetime: v }))}
          />
          <FormFields.DateRangeField
            label="Period"
            value={values.dateRange}
            onChange={(v) => setValues((prev) => ({ ...prev, dateRange: v }))}
          />
        </CrudForm.Section>

        <CrudForm.Section title="Toggles" variant="card" collapsible>
          <FormFields.SwitchField
            label="Enable Notifications"
            value={values.enableNotifications}
            onChange={(v) => setValues((prev) => ({ ...prev, enableNotifications: v }))}
            layout="inline"
          />
          <FormFields.CheckboxField
            label="Accept Terms"
            value={values.acceptTerms}
            onChange={(v) => setValues((prev) => ({ ...prev, acceptTerms: v }))}
            layout="left"
          />
          <FormFields.SliderField
            label="Volume"
            value={values.volume}
            onChange={(v) => setValues((prev) => ({ ...prev, volume: v }))}
            min={0}
            max={100}
            showValue
          />
        </CrudForm.Section>
      </CrudForm>
    );
  },
};

export const EditFormWithHeader: StoryObj = {
  render: () => {
    const [values, setValues] = useState({
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
    });
    const initialValues = useRef(values).current;
    const isDirty = useIsDirty(values, initialValues);

    return (
      <CrudForm
        onSubmit={() => {}}
        header={
          <Flex gap="sm" align="center">
            <ArrowLeftSvg className="size-4" />
            <Heading level={5}>Edit User</Heading>
          </Flex>
        }
        footer={
          <CrudForm.Actions spread>
            <Button variant="outline" size="sm">Back</Button>
            <SaveButton type="submit" isDirty={isDirty} isSaving={false}>Update</SaveButton>
          </CrudForm.Actions>
        }
      >
        <CrudForm.Section title="Account" variant="flat">
          <FormFields.TextField
            label="Full Name"
            value={values.name}
            onChange={(v) => setValues((prev) => ({ ...prev, name: v }))}
            required
          />
          <FormFields.TextField
            label="Email"
            value={values.email}
            onChange={(v) => setValues((prev) => ({ ...prev, email: v }))}
            type="email"
            required
          />
          <FormFields.SelectField
            label="Role"
            value={values.role}
            onChange={(v) => setValues((prev) => ({ ...prev, role: v }))}
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Guest", value: "guest" },
            ]}
          />
        </CrudForm.Section>
      </CrudForm>
    );
  },
};
