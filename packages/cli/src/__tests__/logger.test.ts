import { describe, it, expect, vi } from "vitest";
import { log } from "../utils/logger.js";

describe("logger", () => {
  it("log.info calls console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.info("test message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("test message");
    spy.mockRestore();
  });

  it("log.success calls console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.success("done");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("done");
    spy.mockRestore();
  });

  it("log.warn calls console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.warn("warning");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("warning");
    spy.mockRestore();
  });

  it("log.error calls console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.error("error");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("error");
    spy.mockRestore();
  });

  it("log.step calls console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.step("step");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("step");
    spy.mockRestore();
  });
});
