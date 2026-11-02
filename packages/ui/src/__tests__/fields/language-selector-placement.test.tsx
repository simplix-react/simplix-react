// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(import("@simplix-react/i18n/react"), async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en" as const,
    exists: () => true,
  }),
}));

import { I18nTextField } from "../../fields/form/i18n-text-field";
import { I18nTextareaField } from "../../fields/form/i18n-textarea-field";
import { UIProvider } from "../../provider/ui-provider";
import type { LanguageSelectorPlacement } from "../../fields/shared/language-selector";

afterEach(cleanup);

const languages = [
  { code: "en", name: "English" },
  { code: "ko", name: "Korean" },
] as never;

type Placement = LanguageSelectorPlacement | undefined;

function renderField(kind: "input" | "textarea", placement: Placement, wrap?: (n: ReactNode) => ReactNode) {
  const props = {
    label: "Name",
    value: { en: "", ko: "" },
    onChange: () => {},
    languages,
    languageSelectorPlacement: placement,
  };
  const field = kind === "input" ? <I18nTextField {...props} /> : <I18nTextareaField {...props} />;
  return render(<>{wrap ? wrap(field) : field}</>);
}

function where(container: HTMLElement, kind: "input" | "textarea") {
  const selector = container.querySelector('[data-slot="field-language-selector"]');
  const control = container.querySelector(kind);
  const label = container.querySelector("label");
  const inset = container.querySelector('[data-slot="field-language-inset"]');
  return {
    selector,
    inLabelRow: !!selector && !!label?.parentElement?.contains(selector),
    inControlFrame: !!selector && !!inset && inset.contains(selector) && inset.contains(control),
    placementAttr: selector?.getAttribute("data-placement"),
  };
}

describe.each(["input", "textarea"] as const)("language selector placement (%s)", (kind) => {
  it("defaults to the label row when nothing is set", () => {
    const { container } = renderField(kind, undefined);
    const w = where(container, kind);
    expect(w.inLabelRow).toBe(true);
    expect(w.inControlFrame).toBe(false);
    expect(w.placementAttr).toBe("label");
  });

  it("draws inside the control's frame, and not in the label row, with inset", () => {
    const { container } = renderField(kind, "inset");
    const w = where(container, kind);
    expect(w.inControlFrame).toBe(true);
    expect(w.inLabelRow).toBe(false);
    expect(w.placementAttr).toBe("inset");
    expect(container.querySelector('[data-slot="field-language-inset"]')?.getAttribute("data-control")).toBe(kind);
  });

  it("takes the installation default from UIProvider", () => {
    const { container } = renderField(kind, undefined, (n) => (
      <UIProvider defaults={{ languageSelectorPlacement: "inset" }}>{n}</UIProvider>
    ));
    const w = where(container, kind);
    expect(w.inControlFrame).toBe(true);
    expect(w.inLabelRow).toBe(false);
  });

  it("lets the field prop override the provider default", () => {
    const { container } = renderField(kind, "label", (n) => (
      <UIProvider defaults={{ languageSelectorPlacement: "inset" }}>{n}</UIProvider>
    ));
    const w = where(container, kind);
    expect(w.inLabelRow).toBe(true);
    expect(w.inControlFrame).toBe(false);
  });
});

describe("language selector look", () => {
  it("marks the current segment without a ring", async () => {
    const { languageSegmentStyle } = await import("../../fields/shared/language-selector.style");
    expect(languageSegmentStyle.variants.current.true).not.toMatch(/ring/);
  });

  it("draws the inset halo on every focusable part under keyboard focus, never a bare tint", async () => {
    const styles = await import("../../fields/shared/language-selector.style");
    for (const style of [styles.languageStepStyle, styles.languageTriggerStyle, styles.languageInsetTriggerStyle, styles.languageOptionStyle]) {
      expect(style.base).toMatch(/focus-visible:!?shadow-\[var\(--focus-halo-inset\)\]/);
      expect(style.base).not.toMatch(/focus-visible:!?shadow-none/);
    }
  });
});

const manyLanguages = [
  { code: "en", name: "English" },
  { code: "ko", name: "한국어" },
  { code: "ja", name: "日本語" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "pt", name: "Português" },
] as never;

function renderInset(kind: "input" | "textarea", onLanguageChange = vi.fn(), selected = "en") {
  const props = {
    label: "Name",
    value: { en: "Hello", ko: "", ja: "", de: "", fr: "", pt: "" },
    onChange: () => {},
    languages: manyLanguages,
    selectedLanguage: selected,
    onLanguageChange,
    languageSelectorPlacement: "inset" as const,
  };
  return render(kind === "input" ? <I18nTextField {...props} /> : <I18nTextareaField {...props} />);
}

describe.each(["input", "textarea"] as const)("inset placement (%s)", (kind) => {
  it("lays the fill bar across the control with one segment per language", () => {
    const { container } = renderInset(kind);
    const bar = container.querySelector('[data-slot="field-language-fill-bar"]');
    const overlay = container.querySelector('[data-slot="field-language-inset-overlay"]');
    expect(bar).not.toBeNull();
    expect(bar?.parentElement).toBe(overlay);
    expect(bar?.getAttribute("aria-hidden")).toBe("true");
    const segments = bar?.querySelectorAll('[data-slot="field-language-fill"]') ?? [];
    expect(segments).toHaveLength(6);
    expect(segments[0].getAttribute("data-filled")).toBe("true");
    expect(segments[0].getAttribute("data-current")).toBe("true");
    expect(segments[1].getAttribute("data-filled")).toBe("false");
    // The bar is not inside the selector's segment, so it is not limited to its width.
    expect(container.querySelector('[data-slot="field-language-inset-anchor"]')?.contains(bar ?? null)).toBe(false);
  });

  it("draws no step buttons and no divider borders", () => {
    const { container } = renderInset(kind);
    expect(container.querySelector('[data-slot="field-language-step"]')).toBeNull();
    expect(container.querySelector('[data-slot="field-language-segments"]')).toBeNull();
  });
});

describe("inset placement, input", () => {
  it("is one select trigger with an accessible name, showing the current name in full", () => {
    const { container, getByRole } = renderInset("input", vi.fn(), "ko");
    const trigger = getByRole("combobox", { name: "field.selectLanguage" });
    expect(container.querySelector('[data-slot="field-language-inset-anchor"]')?.contains(trigger)).toBe(true);
    const visible = [...trigger.querySelectorAll("span.whitespace-nowrap")].filter((n) => !n.classList.contains("invisible"));
    expect(visible.map((n) => n.textContent)).toEqual(["한국어"]);
    expect(trigger.querySelectorAll("span.whitespace-nowrap.truncate")).toHaveLength(0);
  });
});

describe("inset placement, textarea", () => {
  it("stacks the languages as a radio group with the current one checked and tabbable", () => {
    const { getByRole, getAllByRole } = renderInset("textarea", vi.fn(), "ja");
    const group = getByRole("radiogroup", { name: "field.selectLanguage" });
    expect(group.getAttribute("data-slot")).toBe("field-language-list");
    const radios = getAllByRole("radio");
    expect(radios.map((r) => r.textContent)).toEqual(["English", "한국어", "日本語", "Deutsch", "Français", "Português"]);
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "false", "true", "false", "false", "false"]);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, -1, 0, -1, -1, -1]);
  });

  it("moves the language with the arrow keys, Home and End, wrapping at either end", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const change = vi.fn();
    const { getAllByRole } = renderInset("textarea", change, "en");
    const radios = getAllByRole("radio");
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    fireEvent.keyDown(radios[0], { key: "ArrowUp" });
    fireEvent.keyDown(radios[0], { key: "End" });
    fireEvent.keyDown(radios[0], { key: "Home" });
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    fireEvent.click(radios[4]);
    expect(change.mock.calls.map((c) => c[0])).toEqual(["ko", "pt", "pt", "en", "ko", "fr"]);
  });

  it("keeps the textarea from resizing, since the column takes its corner", () => {
    const { container } = renderInset("textarea");
    expect(container.querySelector("textarea")?.className).toMatch(/resize-none/);
  });
});
