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
import { drawnClasses } from "../helpers/drawn-classes";

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
    expect(drawnClasses(table)).toContain("w-full");
    expect(drawnClasses(table)).toContain("caption-bottom");
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
    expect(drawnClasses(row)).toContain("even:bg-muted/50");
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
    expect(drawnClasses(tableContainer)).toContain("border");
    const table = container.querySelector("table");
    expect(drawnClasses(table)).toContain("border-separate");
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
    expect(drawnClasses(th)).toContain("px-2");
    expect(drawnClasses(th)).toContain("h-8");
    const td = container.querySelector("td");
    expect(drawnClasses(td)).toContain("px-2");
    expect(drawnClasses(td)).toContain("py-1.5");
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
    expect(drawnClasses(th)).toContain("px-4");
    expect(drawnClasses(th)).toContain("h-12");
    const td = container.querySelector("td");
    expect(drawnClasses(td)).toContain("px-4");
    expect(drawnClasses(td)).toContain("py-4");
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
    expect(drawnClasses(th)).toContain("h-8");
    const td = container.querySelector("td");
    expect(drawnClasses(td)).toContain("py-1");
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
    expect(drawnClasses(th)).toContain("h-11");
    const td = container.querySelector("td");
    expect(drawnClasses(td)).toContain("py-3");
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
    expect(drawnClasses(tableContainer)).toContain("rounded-lg");
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
    expect(drawnClasses(table)).toContain("my-table");
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
    expect(drawnClasses(thead)).toContain("border-t");
    expect(drawnClasses(thead)).toContain("bg-muted/40");
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
    expect(drawnClasses(tfoot)).toContain("border-t");
    expect(drawnClasses(tfoot)).toContain("bg-muted/50");
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
    expect(drawnClasses(tr)).toContain("hover:bg-muted/40");
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
    expect(drawnClasses(caption)).toContain("text-muted-foreground");
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
    expect(drawnClasses(caption)).toContain("my-caption");
  });
});
