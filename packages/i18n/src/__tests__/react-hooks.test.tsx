// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { I18nProvider, useI18nAdapter } from "../react/i18n-provider.js";
import { useTranslation, useI18n, useLocale } from "../react/use-translation.js";
import { useLocalePicker } from "../react/use-locale-picker.js";
import { useEntityTranslation } from "../react/use-entity-translation.js";
import type { II18nAdapter } from "../adapter.js";

// ── Mock Adapter ──

function createMockAdapter(overrides: Partial<II18nAdapter> = {}): II18nAdapter {
  const listeners = new Set<(locale: string) => void>();
  let currentLocale = "en";

  return {
    id: "mock",
    name: "Mock Adapter",
    get locale() {
      return currentLocale;
    },
    fallbackLocale: "en",
    availableLocales: ["en", "ko", "ja"],
    initialize: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn().mockResolvedValue(undefined),
    setLocale: vi.fn().mockImplementation(async (locale: string) => {
      currentLocale = locale;
      for (const fn of listeners) fn(locale);
    }),
    getLocaleInfo: vi.fn().mockReturnValue(null),
    t: vi.fn().mockImplementation((key: string) => `translated:${key}`),
    tn: vi.fn().mockImplementation(
      (ns: string, key: string) => `${ns}:${key}`,
    ),
    tp: vi.fn().mockImplementation(
      (key: string, count: number) => `${key}:${count}`,
    ),
    exists: vi.fn().mockImplementation(
      (key: string, ns?: string) => key === "existing.key" || (ns === "common" && key === "title"),
    ),
    formatDate: vi.fn().mockReturnValue("2025-01-15"),
    formatTime: vi.fn().mockReturnValue("14:30:00"),
    formatDateTime: vi.fn().mockReturnValue("2025-01-15 14:30:00"),
    formatRelativeTime: vi.fn().mockReturnValue("3 hours ago"),
    formatNumber: vi.fn().mockReturnValue("1,234"),
    formatCurrency: vi.fn().mockReturnValue("$100.00"),
    loadTranslations: vi.fn(),
    getLoadState: vi.fn().mockReturnValue("loaded"),
    onLocaleChange: vi.fn().mockImplementation((handler: (locale: string) => void) => {
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
      };
    }),
    ...overrides,
  };
}

function createWrapper(adapter: II18nAdapter) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(I18nProvider, { adapter }, children);
  };
}

// ── Tests ──

describe("I18nProvider", () => {
  it("renders children", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useI18nAdapter(), { wrapper });
    expect(result.current).toBe(adapter);
  });

  it("provides i18n context to descendant components", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useI18nAdapter(), { wrapper });
    expect(result.current).not.toBeNull();
    expect(result.current!.id).toBe("mock");
  });
});

describe("useI18nAdapter", () => {
  it("returns null when no provider is present", () => {
    const { result } = renderHook(() => useI18nAdapter());
    expect(result.current).toBeNull();
  });

  it("returns the adapter from context", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useI18nAdapter(), { wrapper });
    expect(result.current).toBe(adapter);
  });
});

describe("useI18n", () => {
  it("returns the adapter (shorthand for useI18nAdapter)", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current).toBe(adapter);
  });

  it("returns null without provider", () => {
    const { result } = renderHook(() => useI18n());
    expect(result.current).toBeNull();
  });
});

describe("useTranslation", () => {
  let adapter: II18nAdapter;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    adapter = createMockAdapter();
    wrapper = createWrapper(adapter);
  });

  it("returns a translation function", () => {
    const { result } = renderHook(() => useTranslation("common"), { wrapper });
    expect(typeof result.current.t).toBe("function");
  });

  it("translates keys within the given namespace", () => {
    const { result } = renderHook(() => useTranslation("common"), { wrapper });
    const translated = result.current.t("title");
    expect(adapter.tn).toHaveBeenCalledWith("common", "title", undefined);
    expect(translated).toBe("common:title");
  });

  it("returns the current locale", () => {
    const { result } = renderHook(() => useTranslation("common"), { wrapper });
    expect(result.current.locale).toBe("en");
  });

  it("checks whether a translation key exists", () => {
    const { result } = renderHook(() => useTranslation("common"), { wrapper });
    expect(result.current.exists("title")).toBe(true);
    expect(result.current.exists("nonexistent")).toBe(false);
  });

  it("returns key as fallback when no adapter is present", () => {
    const { result } = renderHook(() => useTranslation("common"));
    expect(result.current.t("some.key")).toBe("some.key");
    expect(result.current.locale).toBe("en");
    expect(result.current.exists("anything")).toBe(false);
  });

  it("re-renders when locale changes", async () => {
    const { result } = renderHook(() => useTranslation("common"), { wrapper });
    expect(result.current.locale).toBe("en");

    await act(async () => {
      await adapter.setLocale("ko");
    });

    expect(result.current.locale).toBe("ko");
  });
});

describe("useLocale", () => {
  it("returns the current locale from the adapter", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocale(), { wrapper });
    expect(result.current).toBe("en");
  });

  it("returns 'en' when no provider is present", () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current).toBe("en");
  });

  it("updates when locale changes", async () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current).toBe("en");

    await act(async () => {
      await adapter.setLocale("ko");
    });

    expect(result.current).toBe("ko");
  });
});

describe("useLocalePicker", () => {
  it("returns the current locale", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocalePicker(), { wrapper });
    expect(result.current.locale).toBe("en");
  });

  it("returns locale options with display names", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocalePicker(), { wrapper });
    expect(result.current.locales).toHaveLength(3);
    expect(result.current.locales[0]).toHaveProperty("value");
    expect(result.current.locales[0]).toHaveProperty("displayName");
    expect(result.current.locales.map((l) => l.value)).toEqual(["en", "ko", "ja"]);
  });

  it("provides a setLocale function", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocalePicker(), { wrapper });
    expect(typeof result.current.setLocale).toBe("function");
  });

  it("calls adapter.setLocale when setLocale is invoked", () => {
    const adapter = createMockAdapter();
    const wrapper = createWrapper(adapter);
    const { result } = renderHook(() => useLocalePicker(), { wrapper });

    act(() => {
      result.current.setLocale("ko");
    });

    expect(adapter.setLocale).toHaveBeenCalledWith("ko");
  });

  it("returns empty locales when no adapter is present", () => {
    const { result } = renderHook(() => useLocalePicker());
    expect(result.current.locales).toEqual([]);
    expect(result.current.locale).toBe("en");
  });
});

describe("useEntityTranslation", () => {
  let adapter: II18nAdapter;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    adapter = createMockAdapter();
    wrapper = createWrapper(adapter);
  });

  it("translates entity field labels", () => {
    const { result } = renderHook(() => useEntityTranslation("pet"), {
      wrapper,
    });
    const label = result.current.fieldLabel("name");
    expect(adapter.tn).toHaveBeenCalledWith("entity/pet", "fields.name", undefined);
    expect(label).toBe("entity/pet:fields.name");
  });

  it("translates enum labels", () => {
    const { result } = renderHook(() => useEntityTranslation("pet"), {
      wrapper,
    });
    const label = result.current.enumLabel("petStatus", "available");
    expect(adapter.tn).toHaveBeenCalledWith("enums", "petStatus.available", undefined);
    expect(label).toBe("enums:petStatus.available");
  });

  it("returns stable fieldLabel and enumLabel references", () => {
    const { result, rerender } = renderHook(
      () => useEntityTranslation("pet"),
      { wrapper },
    );
    const first = result.current;
    rerender();
    expect(result.current.fieldLabel).toBe(first.fieldLabel);
    expect(result.current.enumLabel).toBe(first.enumLabel);
  });
});
