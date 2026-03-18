// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../../base/display/table";

afterEach(cleanup);

describe("Table", () => {
  it("renders a table element", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Cell")).toBeDefined();
  });

  it("applies default variant classes", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = container.querySelector("table");
    expect(table!.className).toContain("w-full");
    expect(table!.className).toContain("caption-bottom");
  });

  it("applies striped variant to rows", () => {
    const { container } = render(
      <Table variant="striped">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = container.querySelector("tr");
    expect(row!.className).toContain("even:bg-muted/50");
  });

  it("applies bordered variant", () => {
    const { container } = render(
      <Table variant="bordered">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tableContainer = container.querySelector("[data-slot='table-container']");
    expect(tableContainer!.className).toContain("border");
    const table = container.querySelector("table");
    expect(table!.className).toContain("border-separate");
  });

  it("applies size='sm' classes to head and cell", () => {
    const { container } = render(
      <Table size="sm">
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const th = container.querySelector("th");
    expect(th!.className).toContain("px-2");
    expect(th!.className).toContain("h-8");
    const td = container.querySelector("td");
    expect(td!.className).toContain("px-2");
    expect(td!.className).toContain("py-1.5");
  });

  it("applies size='lg' classes", () => {
    const { container } = render(
      <Table size="lg">
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const th = container.querySelector("th");
    expect(th!.className).toContain("px-4");
    expect(th!.className).toContain("h-12");
    const td = container.querySelector("td");
    expect(td!.className).toContain("px-4");
    expect(td!.className).toContain("py-4");
  });

  it("applies density='compact' classes", () => {
    const { container } = render(
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const th = container.querySelector("th");
    expect(th!.className).toContain("h-8");
    const td = container.querySelector("td");
    expect(td!.className).toContain("py-1");
  });

  it("applies density='comfortable' classes", () => {
    const { container } = render(
      <Table density="comfortable">
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const th = container.querySelector("th");
    expect(th!.className).toContain("h-11");
    const td = container.querySelector("td");
    expect(td!.className).toContain("py-3");
  });

  it("applies rounded variant to container", () => {
    const { container } = render(
      <Table rounded="lg">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tableContainer = container.querySelector("[data-slot='table-container']");
    expect(tableContainer!.className).toContain("rounded-lg");
  });

  it("forwards ref to table element", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  it("merges custom className on table", () => {
    const { container } = render(
      <Table className="my-table">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = container.querySelector("table");
    expect(table!.className).toContain("my-table");
  });
});

describe("TableHeader", () => {
  it("renders thead element with base classes", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const thead = container.querySelector("thead");
    expect(thead!.className).toContain("border-t");
    expect(thead!.className).toContain("bg-muted/50");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableHeader ref={ref}>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("THEAD");
  });
});

describe("TableBody", () => {
  it("renders tbody element", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tbody = container.querySelector("tbody");
    expect(tbody).not.toBeNull();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableBody ref={ref}>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("TBODY");
  });
});

describe("TableFooter", () => {
  it("renders tfoot element with base classes", () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>F</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const tfoot = container.querySelector("tfoot");
    expect(tfoot!.className).toContain("border-t");
    expect(tfoot!.className).toContain("bg-muted/50");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableFooter ref={ref}>
          <TableRow>
            <TableCell>F</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("TFOOT");
  });
});

describe("TableRow", () => {
  it("renders tr element with default hover class", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tr = container.querySelector("tr");
    expect(tr!.className).toContain("hover:bg-muted/50");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTableRowElement>();
    render(
      <Table>
        <TableBody>
          <TableRow ref={ref}>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("TR");
  });
});

describe("TableCaption", () => {
  it("renders caption element", () => {
    const { container } = render(
      <Table>
        <TableCaption>Caption text</TableCaption>
      </Table>,
    );
    const caption = container.querySelector("caption");
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toBe("Caption text");
    expect(caption!.className).toContain("text-muted-foreground");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTableCaptionElement>();
    render(
      <Table>
        <TableCaption ref={ref}>Cap</TableCaption>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("CAPTION");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Table>
        <TableCaption className="my-caption">Cap</TableCaption>
      </Table>,
    );
    const caption = container.querySelector("caption");
    expect(caption!.className).toContain("my-caption");
  });
});
