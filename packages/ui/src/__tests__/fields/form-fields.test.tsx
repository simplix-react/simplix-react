// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TextField } from "../../fields/form/text-field";

afterEach(cleanup);
import { CheckboxField } from "../../fields/form/checkbox-field";
import { SwitchField } from "../../fields/form/switch-field";
import { TextareaField } from "../../fields/form/textarea-field";
import { NumberField } from "../../fields/form/number-field";
import { PasswordField } from "../../fields/form/password-field";
import { ColorField } from "../../fields/form/color-field";
import { Field } from "../../fields/form/field";

// ── TextField ──

describe("TextField", () => {
  it("renders with label", () => {
    render(<TextField label="Email" value="" onChange={vi.fn()} />);
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByTestId("form-field-email")).toBeDefined();
  });

  it("renders input with value", () => {
    render(
      <TextField label="Name" value="John" onChange={vi.fn()} />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveProperty("value", "John");
  });

  it("calls onChange with new value", () => {
    const onChange = vi.fn();
    render(<TextField label="Name" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Jane" },
    });
    expect(onChange).toHaveBeenCalledWith("Jane");
  });

  it("shows error with role=alert", () => {
    render(
      <TextField label="Email" value="" onChange={vi.fn()} error="Required" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("sets aria-invalid when error is provided", () => {
    render(
      <TextField label="Email" value="" onChange={vi.fn()} error="Bad" />,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("renders description text", () => {
    render(
      <TextField
        label="Email"
        value=""
        onChange={vi.fn()}
        description="We will not share your email"
      />,
    );
    expect(screen.getByText("We will not share your email")).toBeDefined();
  });

  it("supports placeholder", () => {
    render(
      <TextField
        label="Email"
        value=""
        onChange={vi.fn()}
        placeholder="Enter email"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("placeholder")).toBe("Enter email");
  });

  it("supports disabled state", () => {
    render(<TextField label="Email" value="" onChange={vi.fn()} disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveProperty("disabled", true);
  });

  it("sets type attribute", () => {
    render(
      <TextField label="Email" value="" onChange={vi.fn()} type="email" />,
    );
    const input = screen.getByTestId("form-field-email").querySelector("input");
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("sets aria-label when labelPosition is hidden", () => {
    render(
      <TextField
        label="Search"
        value=""
        onChange={vi.fn()}
        labelPosition="hidden"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-label")).toBe("Search");
  });
});

// ── CheckboxField ──

describe("CheckboxField", () => {
  it("renders with label", () => {
    render(
      <CheckboxField label="Accept terms" value={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Accept terms")).toBeDefined();
  });

  it("renders checkbox element", () => {
    render(
      <CheckboxField label="Active" value={true} onChange={vi.fn()} />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDefined();
  });

  it("defaults to left label position", () => {
    render(
      <CheckboxField label="Active" value={false} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset.className).toContain("grid");
  });

  it("shows error", () => {
    render(
      <CheckboxField
        label="Terms"
        value={false}
        onChange={vi.fn()}
        error="Must accept"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Must accept");
  });
});

// ── SwitchField ──

describe("SwitchField", () => {
  it("renders with label", () => {
    render(
      <SwitchField label="Notifications" value={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Notifications")).toBeDefined();
  });

  it("renders switch element", () => {
    render(
      <SwitchField label="Enabled" value={true} onChange={vi.fn()} />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeDefined();
  });

  it("defaults to left label position", () => {
    render(
      <SwitchField label="Mode" value={false} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset.className).toContain("grid");
  });

  it("shows error", () => {
    render(
      <SwitchField
        label="Toggle"
        value={false}
        onChange={vi.fn()}
        error="Error here"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Error here");
  });
});

// ── TextareaField ──

describe("TextareaField", () => {
  it("renders with label and value", () => {
    render(
      <TextareaField label="Bio" value="Hello world" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Bio")).toBeDefined();
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveProperty("value", "Hello world");
  });

  it("calls onChange with new value", () => {
    const onChange = vi.fn();
    render(<TextareaField label="Bio" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Updated" },
    });
    expect(onChange).toHaveBeenCalledWith("Updated");
  });

  it("shows error", () => {
    render(
      <TextareaField
        label="Bio"
        value=""
        onChange={vi.fn()}
        error="Too short"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Too short");
  });

  it("supports rows prop", () => {
    render(
      <TextareaField label="Bio" value="" onChange={vi.fn()} rows={5} />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea.getAttribute("rows")).toBe("5");
  });

  it("applies resize class", () => {
    render(
      <TextareaField
        label="Bio"
        value=""
        onChange={vi.fn()}
        resize="none"
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea.className).toContain("resize-none");
  });
});

// ── NumberField ──

describe("NumberField", () => {
  it("renders with label and value", () => {
    render(<NumberField label="Age" value={25} onChange={vi.fn()} />);
    expect(screen.getByText("Age")).toBeDefined();
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveProperty("value", "25");
  });

  it("renders empty string when value is null", () => {
    render(<NumberField label="Count" value={null} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveProperty("value", "");
  });

  it("calls onChange with parsed number", () => {
    const onChange = vi.fn();
    render(<NumberField label="Age" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "42" },
    });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("calls onChange with null when input is cleared", () => {
    const onChange = vi.fn();
    render(<NumberField label="Age" value={25} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not call onChange for NaN values", () => {
    const onChange = vi.fn();
    render(<NumberField label="Age" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "abc" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows error", () => {
    render(
      <NumberField
        label="Age"
        value={null}
        onChange={vi.fn()}
        error="Invalid"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Invalid");
  });
});

// ── PasswordField ──

describe("PasswordField", () => {
  it("renders with label", () => {
    render(
      <PasswordField label="Password" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Password")).toBeDefined();
  });

  it("renders as password type by default", () => {
    render(
      <PasswordField label="Password" value="secret" onChange={vi.fn()} />,
    );
    const input = screen.getByTestId("form-field-password").querySelector("input");
    expect(input?.getAttribute("type")).toBe("password");
  });

  it("toggles visibility when button is clicked", () => {
    render(
      <PasswordField label="Password" value="secret" onChange={vi.fn()} />,
    );
    const toggleBtn = screen.getByLabelText("Show password");
    fireEvent.click(toggleBtn);

    const input = screen.getByTestId("form-field-password").querySelector("input");
    expect(input?.getAttribute("type")).toBe("text");

    const hideBtn = screen.getByLabelText("Hide password");
    fireEvent.click(hideBtn);
    expect(input?.getAttribute("type")).toBe("password");
  });

  it("shows error", () => {
    render(
      <PasswordField
        label="Password"
        value=""
        onChange={vi.fn()}
        error="Too short"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Too short");
  });
});

// ── ColorField ──

describe("ColorField", () => {
  it("renders with label", () => {
    render(
      <ColorField label="Brand Color" value="#ff0000" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Brand Color")).toBeDefined();
  });

  it("renders color and text inputs", () => {
    render(
      <ColorField label="Color" value="#000000" onChange={vi.fn()} />,
    );
    const wrapper = screen.getByTestId("form-field-color");
    const inputs = wrapper.querySelectorAll("input");
    // At least 2 inputs: color picker + text input
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onChange from text input", () => {
    const onChange = vi.fn();
    render(<ColorField label="Color" value="#000000" onChange={onChange} />);
    const textInput = screen.getByRole("textbox");
    fireEvent.change(textInput, { target: { value: "#ff0000" } });
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  it("shows error", () => {
    render(
      <ColorField
        label="Color"
        value="#000"
        onChange={vi.fn()}
        error="Invalid hex"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Invalid hex");
  });
});

// ── Field (generic wrapper) ──

describe("Field", () => {
  it("renders label and children", () => {
    render(
      <Field label="Custom">
        <input data-testid="custom-input" />
      </Field>,
    );
    expect(screen.getByText("Custom")).toBeDefined();
    expect(screen.getByTestId("custom-input")).toBeDefined();
  });

  it("shows error", () => {
    render(
      <Field label="Custom" error="Bad value">
        content
      </Field>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Bad value");
  });

  it("shows description", () => {
    render(
      <Field label="Custom" description="Help text">
        content
      </Field>,
    );
    expect(screen.getByText("Help text")).toBeDefined();
  });
});
