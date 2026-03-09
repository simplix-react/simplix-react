// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCrossTabSync } from "../helpers/cross-tab-sync.js";

describe("createCrossTabSync", () => {
  let addEventSpy: ReturnType<typeof vi.spyOn>;
  let removeEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventSpy = vi.spyOn(window, "addEventListener");
    removeEventSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventSpy.mockRestore();
    removeEventSpy.mockRestore();
  });

  function fireStorageEvent(key: string | null, newValue: string | null) {
    const event = new StorageEvent("storage", { key, newValue });
    window.dispatchEvent(event);
  }

  describe("start", () => {
    it("registers a storage event listener", () => {
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout: vi.fn(),
        onExternalTokenUpdate: vi.fn(),
      });

      sync.start();

      expect(addEventSpy).toHaveBeenCalledWith("storage", expect.any(Function));
    });

    it("does not register duplicate listeners on double start", () => {
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout: vi.fn(),
        onExternalTokenUpdate: vi.fn(),
      });

      sync.start();
      sync.start();

      expect(addEventSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("stop", () => {
    it("removes the storage event listener", () => {
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout: vi.fn(),
        onExternalTokenUpdate: vi.fn(),
      });

      sync.start();
      sync.stop();

      expect(removeEventSpy).toHaveBeenCalledWith(
        "storage",
        expect.any(Function),
      );
    });

    it("is safe to call stop without start", () => {
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout: vi.fn(),
        onExternalTokenUpdate: vi.fn(),
      });

      expect(() => sync.stop()).not.toThrow();
      expect(removeEventSpy).not.toHaveBeenCalled();
    });

    it("allows re-starting after stop", () => {
      const onExternalLogout = vi.fn();
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout,
        onExternalTokenUpdate: vi.fn(),
      });

      sync.start();
      sync.stop();
      sync.start();

      fireStorageEvent("access_token", null);

      expect(onExternalLogout).toHaveBeenCalledOnce();
    });
  });

  describe("external logout", () => {
    it("calls onExternalLogout when key is removed", () => {
      const onExternalLogout = vi.fn();
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout,
        onExternalTokenUpdate: vi.fn(),
      });

      sync.start();
      fireStorageEvent("access_token", null);

      expect(onExternalLogout).toHaveBeenCalledOnce();
    });
  });

  describe("external token update", () => {
    it("calls onExternalTokenUpdate when key is updated", () => {
      const onExternalTokenUpdate = vi.fn();
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout: vi.fn(),
        onExternalTokenUpdate,
      });

      sync.start();
      fireStorageEvent("access_token", "new-token-value");

      expect(onExternalTokenUpdate).toHaveBeenCalledWith("new-token-value");
    });
  });

  describe("key filtering", () => {
    it("ignores events for different storage keys", () => {
      const onExternalLogout = vi.fn();
      const onExternalTokenUpdate = vi.fn();
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout,
        onExternalTokenUpdate,
      });

      sync.start();
      fireStorageEvent("other_key", null);
      fireStorageEvent("other_key", "value");

      expect(onExternalLogout).not.toHaveBeenCalled();
      expect(onExternalTokenUpdate).not.toHaveBeenCalled();
    });
  });

  describe("after stop", () => {
    it("does not fire callbacks after stop", () => {
      const onExternalLogout = vi.fn();
      const onExternalTokenUpdate = vi.fn();
      const sync = createCrossTabSync({
        storageKey: "access_token",
        onExternalLogout,
        onExternalTokenUpdate,
      });

      sync.start();
      sync.stop();

      fireStorageEvent("access_token", null);
      fireStorageEvent("access_token", "new-value");

      expect(onExternalLogout).not.toHaveBeenCalled();
      expect(onExternalTokenUpdate).not.toHaveBeenCalled();
    });
  });
});
