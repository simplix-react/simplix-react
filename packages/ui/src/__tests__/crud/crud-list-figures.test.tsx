// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { I18nextAdapter } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";
import en from "../../locales/en.json";
import ko from "../../locales/ko.json";
import { CrudList } from "../../crud/list/crud-list";
import { ListTotalBadge } from "../../crud/shared/list-total-badge";

afterEach(cleanup);

// The wide-pager layout draws the numbered buttons; the compact one draws "page / pages".
let containerWidth = 1200;
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => containerWidth,
}));

/**
 * These tests run the real i18next adapter over the shipped catalogs: a figure the pager draws
 * is grouped by the reader's own locale, the same way the catalog sentences group theirs. A
 * mocked translator would pass on the ungrouped form too.
 */
let adapter: I18nextAdapter;

async function adapterFor(locale: string): Promise<I18nextAdapter> {
  const next = new I18nextAdapter({
    defaultLocale: locale,
    fallbackLocale: "en",
    locales: [
      { code: "en", name: "English", englishName: "English" },
      { code: "ko", name: "한국어", englishName: "Korean" },
      { code: "de", name: "Deutsch", englishName: "German" },
    ],
    resources: {
      en: { "simplix/ui": en },
      ko: { "simplix/ui": ko },
      de: { "simplix/ui": en },
    },
  });
  await next.initialize();
  return next;
}

function withAdapter(node: ReactNode) {
  return <I18nProvider adapter={adapter}>{node}</I18nProvider>;
}

function pager() {
  return (
    <CrudList.Pagination page={2} pageSize={20} total={3820} totalPages={191} onPageChange={vi.fn()} />
  );
}

function range(container: HTMLElement): string | null | undefined {
  return container.querySelector("[data-slot=crud-list-pagination-range]")?.textContent;
}

describe("the figures a list draws are grouped by the reader's locale", () => {
  beforeAll(() => {
    containerWidth = 1200;
  });

  it("groups the range total of the pager", async () => {
    adapter = await adapterFor("en");
    const { container } = render(withAdapter(pager()));
    expect(range(container)).toBe("21-40 / 3,820");
  });

  it("takes the separator from the locale, never a written-in comma", async () => {
    adapter = await adapterFor("de");
    const { container } = render(withAdapter(pager()));
    expect(range(container)).toBe("21-40 / 3.820");
  });

  it("groups a range bound past a thousand", async () => {
    adapter = await adapterFor("ko");
    const { container } = render(
      withAdapter(<CrudList.Pagination page={60} pageSize={20} total={3820} totalPages={191} onPageChange={vi.fn()} />),
    );
    expect(range(container)).toBe("1,181-1,200 / 3,820");
  });

  it("groups the page buttons and their accessible names", async () => {
    adapter = await adapterFor("en");
    const { container } = render(
      withAdapter(<CrudList.Pagination page={1200} pageSize={10} total={20000} totalPages={2000} onPageChange={vi.fn()} />),
    );
    const current = container.querySelector("[aria-current=page]");
    expect(current?.textContent).toBe("1,200");
    expect(current?.getAttribute("aria-label")).toBe("Page 1,200");
  });

  it("groups the compact page status", async () => {
    containerWidth = 400;
    adapter = await adapterFor("en");
    const { container } = render(
      withAdapter(<CrudList.Pagination page={1200} pageSize={10} total={20000} totalPages={2000} onPageChange={vi.fn()} />),
    );
    expect(container.textContent).toContain("1,200 / 2,000");
    containerWidth = 1200;
  });

  it("keeps the unknown total as its own sentence", async () => {
    adapter = await adapterFor("en");
    const { container } = render(
      withAdapter(<CrudList.Pagination page={1} pageSize={20} total={undefined as unknown as number} totalPages={1} onPageChange={vi.fn()} />),
    );
    expect(range(container)).toBe("– / –");
  });

  it("agrees with the total badge above the list", async () => {
    adapter = await adapterFor("en");
    const { container } = render(withAdapter(<ListTotalBadge count={3820} />));
    expect(container.textContent).toContain("3,820");
  });
});
