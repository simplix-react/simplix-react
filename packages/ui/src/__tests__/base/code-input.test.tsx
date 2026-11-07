// @vitest-environment jsdom
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodeInput } from "../../base/inputs/code-input";
import { codeBackspace, codeFocusable, codePaste, codeType } from "../../base/inputs/code-input-model";

afterEach(cleanup);

describe("code input editing rules", () => {
  it("never focuses past the first empty cell or the last cell", () => {
    expect(codeFocusable("12", 5, 6)).toBe(2);
    expect(codeFocusable("123456", 9, 6)).toBe(5);
    expect(codeFocusable("", -1, 6)).toBe(0);
  });

  it("types into the first empty cell and moves on", () => {
    expect(codeType("12", 4, "3", 6)).toEqual({ value: "123", focus: 3 });
  });

  it("fills forward from the cell an autofill lands in, dropping what is not a digit", () => {
    expect(codeType("", 0, "48-29 13", 6)).toEqual({ value: "482913", focus: 5 });
  });

  it("keeps the code and the focus when what was typed holds no digit", () => {
    expect(codeType("12", 1, "x", 6)).toEqual({ value: "12", focus: 1 });
  });

  it("replaces a filled cell's digit in place", () => {
    expect(codeType("123", 1, "9", 6)).toEqual({ value: "193", focus: 2 });
  });

  it("clears a filled cell and closes the code up, or steps back from an empty one", () => {
    expect(codeBackspace("123", 1, 6)).toEqual({ value: "13", focus: 1 });
    expect(codeBackspace("123", 3, 6)).toEqual({ value: "12", focus: 2 });
    expect(codeBackspace("", 0, 6)).toEqual({ value: "", focus: 0 });
  });

  it("takes a pasted code's digits as the whole code, and ignores a paste with none", () => {
    expect(codePaste("Your code: 482 913", 6)).toEqual({ value: "482913", focus: 5 });
    expect(codePaste("no digits", 6)).toBeNull();
  });
});

function Controlled({ onComplete, invalid }: { onComplete?: (code: string) => void; invalid?: boolean }) {
  const [code, setCode] = useState("");
  return <CodeInput label="Verification code" value={code} onValueChange={setCode} onComplete={onComplete} invalid={invalid} cellLabel={(at, of) => `digit ${at}/${of}`} />;
}

describe("CodeInput", () => {
  it("draws one named cell per digit inside a named group", () => {
    render(<Controlled />);
    expect(screen.getByRole("group", { name: "Verification code" })).toBeDefined();
    const cells = screen.getAllByRole("textbox");
    expect(cells).toHaveLength(6);
    expect(cells[0]?.getAttribute("aria-label")).toBe("digit 1/6");
    expect(cells[0]?.getAttribute("autocomplete")).toBe("one-time-code");
    expect(cells[1]?.getAttribute("autocomplete")).toBe("off");
  });

  it("calls onComplete once the last cell is typed", () => {
    const done = vi.fn();
    render(<Controlled onComplete={done} />);
    const cells = screen.getAllByRole("textbox");
    for (const [index, digit] of ["4", "8", "2", "9", "1", "3"].entries()) fireEvent.keyDown(cells[index] as HTMLElement, { key: digit });
    expect(done).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledWith("482913");
    expect((cells[5] as HTMLInputElement).value).toBe("3");
  });

  it("fills every cell from a paste", () => {
    render(<Controlled />);
    const cells = screen.getAllByRole("textbox");
    fireEvent.paste(cells[0] as HTMLElement, { clipboardData: { getData: () => "482913" } });
    expect(cells.map((cell) => (cell as HTMLInputElement).value).join("")).toBe("482913");
  });

  it("keeps every digit typed faster than a redraw", () => {
    const done = vi.fn();
    render(<Controlled onComplete={done} />);
    const cells = screen.getAllByRole("textbox") as HTMLInputElement[];
    (cells[0] as HTMLInputElement).focus();
    // One act() batch: no rerender between the keys, as when digits arrive faster than a redraw.
    act(() => {
      for (const digit of ["4", "8", "2", "9", "1", "3"]) fireEvent.keyDown(document.activeElement as HTMLElement, { key: digit });
    });
    expect(cells.map((cell) => cell.value).join("")).toBe("482913");
    expect(done).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledWith("482913");
  });

  it("applies a paste and a run of Backspace across cells in one batch", () => {
    render(<Controlled />);
    const cells = screen.getAllByRole("textbox") as HTMLInputElement[];
    (cells[0] as HTMLInputElement).focus();
    act(() => {
      fireEvent.paste(document.activeElement as HTMLElement, { clipboardData: { getData: () => "482913" } });
      for (let press = 0; press < 4; press++) fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Backspace" });
    });
    expect(cells.map((cell) => cell.value).join("")).toBe("48");
    expect(document.activeElement).toBe(cells[2]);
  });

  it("keeps every digit when the parent takes the value asynchronously", async () => {
    vi.useFakeTimers();
    try {
      const done = vi.fn();
      let calls = 0;
      function Later() {
        const [code, setCode] = useState("");
        // Each edit is taken 5 ms after the one before it, so the echoes are drawn one at a time.
        return <CodeInput label="Code" value={code} onValueChange={(next) => setTimeout(() => setCode(next), 5 * ++calls)} onComplete={done} />;
      }
      render(<Later />);
      const cells = screen.getAllByRole("textbox") as HTMLInputElement[];
      (cells[0] as HTMLInputElement).focus();
      act(() => {
        for (const digit of ["4", "8", "2"]) fireEvent.keyDown(document.activeElement as HTMLElement, { key: digit });
      });
      // The first echo lands while two edits are still on their way, and the user keeps typing.
      await act(async () => {
        vi.advanceTimersByTime(5);
      });
      act(() => {
        for (const digit of ["9", "1", "3"]) fireEvent.keyDown(document.activeElement as HTMLElement, { key: digit });
      });
      await act(async () => {
        vi.runAllTimers();
      });
      expect(cells.map((cell) => cell.value).join("")).toBe("482913");
      expect(done).toHaveBeenCalledTimes(1);
      expect(done).toHaveBeenCalledWith("482913");
    } finally {
      vi.useRealTimers();
    }
  });

  it("starts from a value the parent sets on its own, such as a cleared refused code", () => {
    function Clearing() {
      const [code, setCode] = useState("");
      return (
        <>
          <CodeInput label="Code" value={code} onValueChange={setCode} />
          <button type="button" onClick={() => setCode("")}>
            clear
          </button>
        </>
      );
    }
    render(<Clearing />);
    const cells = screen.getAllByRole("textbox") as HTMLInputElement[];
    (cells[0] as HTMLInputElement).focus();
    act(() => {
      for (const digit of ["4", "8", "2"]) fireEvent.keyDown(document.activeElement as HTMLElement, { key: digit });
    });
    fireEvent.click(screen.getByRole("button", { name: "clear" }));
    (cells[0] as HTMLInputElement).focus();
    act(() => {
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: "7" });
    });
    expect(cells.map((cell) => cell.value).join("")).toBe("7");
  });

  it("marks every cell invalid for a refused code and passes a kit's cell attributes on", () => {
    render(<CodeInput label="Code" value="" onValueChange={() => {}} invalid cellAttributes={{ "data-part": "kit-cell" }} />);
    for (const cell of screen.getAllByRole("textbox")) {
      expect(cell.getAttribute("aria-invalid")).toBe("true");
      expect(cell.getAttribute("data-invalid")).toBe("true");
      expect(cell.getAttribute("data-part")).toBe("kit-cell");
      expect(cell.getAttribute("data-slot")).toBe("code-input-cell");
    }
  });
});
