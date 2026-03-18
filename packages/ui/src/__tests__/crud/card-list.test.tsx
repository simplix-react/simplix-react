// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import { CardList } from "../../crud/list/card-list";

describe("CardList", () => {
  it("renders empty message when data is empty", () => {
    render(
      <CardList
        data={[]}
        renderCard={(item) => <div key={String(item)}>{String(item)}</div>}
      />,
    );
    expect(screen.getByText("No items to display.")).toBeTruthy();
  });

  it("renders cards for each item", () => {
    const data = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    render(
      <CardList
        data={data}
        renderCard={(item) => <div key={item.id}>{item.name}</div>}
      />,
    );
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
  });

  it("passes index to renderCard", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const renderCard = (item: { id: number }, index: number) => (
      <div key={item.id}>Item {index}</div>
    );
    render(<CardList data={data} renderCard={renderCard} />);
    expect(screen.getByText("Item 0")).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <CardList
        data={[{ id: 1 }]}
        renderCard={(item) => <div key={item.id}>Card</div>}
        className="my-grid"
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-grid");
  });

  it("applies className when data is empty", () => {
    const { container } = render(
      <CardList
        data={[]}
        renderCard={() => <div>never</div>}
        className="empty-class"
      />,
    );
    expect(container.firstElementChild?.className).toContain("empty-class");
  });
});
