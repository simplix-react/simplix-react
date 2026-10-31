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
    const { languageSegmentStyle, languageTriggerStyle } = await import("../../fields/shared/language-selector.style");
    expect(languageSegmentStyle.variants.current.true).not.toMatch(/ring/);
    expect(languageTriggerStyle.base).toMatch(/focus-visible:!shadow-none/);
  });
});
