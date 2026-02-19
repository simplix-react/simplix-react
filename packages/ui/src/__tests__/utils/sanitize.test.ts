// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "../../utils/sanitize";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe("");
  });

  it("strips inline event handlers", () => {
    const input = '<img src="x" onerror="alert(1)">';
    expect(sanitizeHtml(input)).toBe('<img src="x">');
  });

  it("strips javascript: protocol in href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    expect(sanitizeHtml(input)).toBe("<a>click</a>");
  });

  it("preserves safe HTML tags", () => {
    const input = "<p>Hello <b>world</b></p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("preserves safe attributes", () => {
    const input = '<a href="https://example.com">link</a>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("strips nested script injection", () => {
    const input = '<div><script>alert("xss")</script><p>safe</p></div>';
    expect(sanitizeHtml(input)).toBe("<div><p>safe</p></div>");
  });
});
