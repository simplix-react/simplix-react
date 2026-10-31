// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveBlob } from "../../fields/file-attachment/download-attachment";

describe("saveBlob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clicks an anchor that downloads the bytes under the given name, then releases the URL", () => {
    const create = vi.fn(() => "blob:export");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const clicked: { href: string; download: string }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push({ href: this.getAttribute("href") ?? "", download: this.download });
    });

    const blob = new Blob(["a,b\n"], { type: "text/csv" });
    saveBlob(blob, "audit-log.csv");

    expect(create).toHaveBeenCalledWith(blob);
    expect(clicked).toEqual([{ href: "blob:export", download: "audit-log.csv" }]);
    expect(revoke).toHaveBeenCalledWith("blob:export");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
