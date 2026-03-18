// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  PageHeaderProvider,
  usePageHeader,
  usePageHeaderState,
} from "../../layout/page-header";

afterEach(cleanup);

function HeaderDisplay() {
  const header = usePageHeaderState();
  return (
    <div>
      <span data-testid="title">{header.title ?? ""}</span>
      <span data-testid="description">{header.description ?? ""}</span>
      <span data-testid="actions">{header.actions ?? ""}</span>
      <span data-testid="metadata">{header.metadata ?? ""}</span>
      <span data-testid="center">{header.center ?? ""}</span>
    </div>
  );
}

function HeaderSetter({ title, description, metadataKey, actions, metadata, center }: {
  title?: string;
  description?: string;
  metadataKey?: string;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
  center?: React.ReactNode;
}) {
  usePageHeader({ title, description, metadataKey, actions, metadata, center });
  return null;
}

function NullHeaderSetter() {
  usePageHeader(null);
  return null;
}

describe("PageHeaderProvider", () => {
  it("renders children", () => {
    render(
      <PageHeaderProvider>
        <span data-testid="child">hello</span>
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });

  it("provides empty header state by default", () => {
    render(
      <PageHeaderProvider>
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("");
    expect(screen.getByTestId("description").textContent).toBe("");
  });
});

describe("usePageHeader", () => {
  it("sets header state via context", () => {
    render(
      <PageHeaderProvider>
        <HeaderSetter title="My Page" description="Details here" />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("My Page");
    expect(screen.getByTestId("description").textContent).toBe("Details here");
  });

  it("updates header when title changes", () => {
    const { rerender } = render(
      <PageHeaderProvider>
        <HeaderSetter title="First" />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("First");

    rerender(
      <PageHeaderProvider>
        <HeaderSetter title="Second" />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("Second");
  });

  it("clears header on unmount", () => {
    const { rerender } = render(
      <PageHeaderProvider>
        <HeaderSetter title="Active" />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("Active");

    // Remove the setter
    rerender(
      <PageHeaderProvider>
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("");
  });

  it("does not set header when passed null", () => {
    render(
      <PageHeaderProvider>
        <NullHeaderSetter />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    // Header should remain empty
    expect(screen.getByTestId("title").textContent).toBe("");
  });

  it("sets metadata and center", () => {
    render(
      <PageHeaderProvider>
        <HeaderSetter
          title="Title"
          metadata={<span>meta</span>}
          center={<span>center-content</span>}
          metadataKey="v1"
        />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("metadata").textContent).toBe("meta");
    expect(screen.getByTestId("center").textContent).toBe("center-content");
  });
});

describe("usePageHeaderState", () => {
  it("returns the current header state from context", () => {
    render(
      <PageHeaderProvider>
        <HeaderSetter title="State Test" />
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("State Test");
  });

  it("returns empty object when no header has been set", () => {
    render(
      <PageHeaderProvider>
        <HeaderDisplay />
      </PageHeaderProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("");
    expect(screen.getByTestId("description").textContent).toBe("");
  });
});
