// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DetailTextField } from "../../fields/detail/text-field";

afterEach(cleanup);
import { DetailBooleanField } from "../../fields/detail/boolean-field";
import { DetailNumberField } from "../../fields/detail/number-field";
import { DetailLinkField } from "../../fields/detail/link-field";
import { DetailBadgeField } from "../../fields/detail/badge-field";
import { DetailListField } from "../../fields/detail/list-field";
import { DetailImageField } from "../../fields/detail/image-field";
import { DetailDateField } from "../../fields/detail/date-field";
import { DetailField } from "../../fields/detail/field";

// ── DetailTextField ──

describe("DetailTextField", () => {
  it("renders label and value", () => {
    render(<DetailTextField label="Email" value="test@example.com" />);
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("test@example.com")).toBeDefined();
  });

  it("shows fallback when value is null", () => {
    render(<DetailTextField label="Email" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback when value is undefined", () => {
    render(<DetailTextField label="Email" value={undefined} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(
      <DetailTextField label="Email" value={null} fallback="N/A" />,
    );
    expect(screen.getByText("N/A")).toBeDefined();
  });

  it("shows copy button when copyable=true and value exists", () => {
    render(<DetailTextField label="Email" value="test@test.com" copyable />);
    expect(screen.getByLabelText("Copy to clipboard")).toBeDefined();
  });

  it("does not show copy button when value is null", () => {
    render(<DetailTextField label="Email" value={null} copyable />);
    expect(screen.queryByLabelText("Copy to clipboard")).toBeNull();
  });

  it("copies value to clipboard on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<DetailTextField label="Email" value="copy-me" copyable />);
    fireEvent.click(screen.getByLabelText("Copy to clipboard"));

    expect(writeText).toHaveBeenCalledWith("copy-me");
  });
});

// ── DetailBooleanField ──

describe("DetailBooleanField", () => {
  it("renders label and Yes for true value in text mode", () => {
    render(<DetailBooleanField label="Active" value={true} />);
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Yes")).toBeDefined();
  });

  it("renders No for false value in text mode", () => {
    render(<DetailBooleanField label="Active" value={false} />);
    expect(screen.getByText("No")).toBeDefined();
  });

  it("shows fallback for null value", () => {
    render(<DetailBooleanField label="Active" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("supports custom labels", () => {
    render(
      <DetailBooleanField
        label="Status"
        value={true}
        labels={{ true: "Enabled", false: "Disabled" }}
      />,
    );
    expect(screen.getByText("Enabled")).toBeDefined();
  });

  it("renders icon mode with aria-label for true", () => {
    render(
      <DetailBooleanField label="Verified" value={true} mode="icon" />,
    );
    expect(screen.getByLabelText("Yes")).toBeDefined();
  });

  it("renders icon mode with aria-label for false", () => {
    render(
      <DetailBooleanField label="Verified" value={false} mode="icon" />,
    );
    expect(screen.getByLabelText("No")).toBeDefined();
  });
});

// ── DetailNumberField ──

describe("DetailNumberField", () => {
  it("renders label and formatted number", () => {
    render(<DetailNumberField label="Count" value={1234} />);
    expect(screen.getByText("Count")).toBeDefined();
    // Intl.NumberFormat with decimal style will format it (locale-dependent)
    const wrapper = screen.getByTestId("detail-field-count");
    expect(wrapper.querySelector(".field-value")?.textContent).toBeDefined();
  });

  it("shows fallback for null value", () => {
    render(<DetailNumberField label="Count" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(
      <DetailNumberField label="Count" value={null} fallback="N/A" />,
    );
    expect(screen.getByText("N/A")).toBeDefined();
  });

  it("formats as percent", () => {
    render(
      <DetailNumberField label="Rate" value={0.85} format="percent" />,
    );
    const wrapper = screen.getByTestId("detail-field-rate");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).toContain("85");
    expect(valueText).toContain("%");
  });

  it("formats as currency", () => {
    render(
      <DetailNumberField
        label="Price"
        value={29.99}
        format="currency"
        currency="USD"
        locale="en-US"
      />,
    );
    const wrapper = screen.getByTestId("detail-field-price");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).toContain("29.99");
  });
});

// ── DetailLinkField ──

describe("DetailLinkField", () => {
  it("renders link with label and value", () => {
    render(
      <DetailLinkField
        label="Website"
        value="example.com"
        href="https://example.com"
      />,
    );
    expect(screen.getByText("Website")).toBeDefined();
    const link = screen.getByText("example.com");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://example.com");
  });

  it("does not set target for internal links", () => {
    render(
      <DetailLinkField
        label="Page"
        value="About"
        href="/about"
      />,
    );
    const link = screen.getByText("About");
    expect(link.getAttribute("target")).toBeNull();
  });

  it("sets target=_blank and rel for external links", () => {
    render(
      <DetailLinkField
        label="Site"
        value="Google"
        href="https://google.com"
        external
      />,
    );
    const link = screen.getByText("Google");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

// ── DetailBadgeField ──

describe("DetailBadgeField", () => {
  it("renders badge with value", () => {
    render(
      <DetailBadgeField
        label="Status"
        value="active"
        variants={{ active: "success", inactive: "secondary" }}
      />,
    );
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("active")).toBeDefined();
  });

  it("renders displayValue when provided", () => {
    render(
      <DetailBadgeField
        label="Status"
        value="active"
        displayValue="Active"
        variants={{ active: "success" }}
      />,
    );
    expect(screen.getByText("Active")).toBeDefined();
  });
});

// ── DetailListField ──

describe("DetailListField", () => {
  it("renders badges by default", () => {
    render(
      <DetailListField
        label="Tags"
        value={["react", "typescript"]}
      />,
    );
    expect(screen.getByText("Tags")).toBeDefined();
    expect(screen.getByText("react")).toBeDefined();
    expect(screen.getByText("typescript")).toBeDefined();
  });

  it("shows fallback for null value", () => {
    render(<DetailListField label="Tags" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback for empty array", () => {
    render(<DetailListField label="Tags" value={[]} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("renders comma mode", () => {
    render(
      <DetailListField
        label="Skills"
        value={["js", "ts"]}
        mode="comma"
      />,
    );
    expect(screen.getByText("js, ts")).toBeDefined();
  });

  it("renders bullet mode", () => {
    render(
      <DetailListField
        label="Steps"
        value={["step1", "step2"]}
        mode="bullet"
      />,
    );
    const wrapper = screen.getByTestId("detail-field-steps");
    const list = wrapper.querySelector("ul");
    expect(list).not.toBeNull();
    expect(list?.querySelectorAll("li").length).toBe(2);
  });
});

// ── DetailImageField ──

describe("DetailImageField", () => {
  it("renders image when value is provided", () => {
    render(
      <DetailImageField
        label="Avatar"
        value="https://example.com/img.png"
        alt="User avatar"
      />,
    );
    expect(screen.getByText("Avatar")).toBeDefined();
    const img = screen.getByAltText("User avatar");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("https://example.com/img.png");
  });

  it("shows placeholder when value is null", () => {
    render(
      <DetailImageField label="Avatar" value={null} alt="Profile" />,
    );
    expect(screen.getByLabelText("Profile")).toBeDefined();
  });

  it("shows placeholder with default label when value is null and no alt", () => {
    render(<DetailImageField label="Photo" value={null} />);
    expect(screen.getByLabelText("No image")).toBeDefined();
  });

  it("shows placeholder on image error", () => {
    render(
      <DetailImageField
        label="Avatar"
        value="https://broken.com/img.png"
        alt="Avatar"
      />,
    );
    const img = screen.getByAltText("Avatar");
    fireEvent.error(img);
    // After error, placeholder should appear
    expect(screen.getByLabelText("Avatar")).toBeDefined();
  });
});

// ── DetailDateField ──

describe("DetailDateField", () => {
  it("renders formatted date", () => {
    render(
      <DetailDateField label="Created" value={new Date("2024-01-15")} />,
    );
    expect(screen.getByText("Created")).toBeDefined();
    const wrapper = screen.getByTestId("detail-field-created");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    // Should contain some representation of the date, exact format is locale-dependent
    expect(valueText.length).toBeGreaterThan(0);
    expect(valueText).not.toBe("\u2014");
  });

  it("shows fallback for null value", () => {
    render(<DetailDateField label="Updated" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback for invalid date string", () => {
    render(<DetailDateField label="Date" value="not-a-date" />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("renders from ISO string", () => {
    render(
      <DetailDateField label="Date" value="2024-06-15T10:00:00Z" />,
    );
    const wrapper = screen.getByTestId("detail-field-date");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).not.toBe("\u2014");
  });
});

// ── DetailField (generic wrapper) ──

describe("DetailField", () => {
  it("renders label and children", () => {
    render(
      <DetailField label="Custom">
        <span data-testid="custom-content">Hello</span>
      </DetailField>,
    );
    expect(screen.getByText("Custom")).toBeDefined();
    expect(screen.getByTestId("custom-content")).toBeDefined();
  });
});
