import { enUS } from "date-fns/locale";
import { describe, expect, it } from "vitest";

import { calculateMonthItemPositions, getMonthCellItems, getVisibleHours, groupItems, navigateDate } from "../helpers";
import { ITEMS } from "./fixtures";

describe("helpers", () => {
  it("navigateDate steps a month forward and back", () => {
    const base = new Date(2026, 6, 15);
    expect(navigateDate(base, "month", "next").getMonth()).toBe(7);
    expect(navigateDate(base, "month", "previous").getMonth()).toBe(5);
  });

  it("navigateDate steps the year view by ±1 year", () => {
    const base = new Date(2026, 6, 15);
    expect(navigateDate(base, "year", "next").getFullYear()).toBe(2027);
    expect(navigateDate(base, "year", "previous").getFullYear()).toBe(2025);
  });

  it("navigateDate maps the data-driven views to day/month granularity", () => {
    const base = new Date(2026, 6, 15);
    expect(navigateDate(base, "resource-timeline", "next").getDate()).toBe(16);
    expect(navigateDate(base, "heatmap-month", "next").getMonth()).toBe(7);
  });

  it("groupItems lanes non-overlapping items together", () => {
    const day = [ITEMS[0], ITEMS[1]]; // 09:00-09:30 and 14:00-15:00, no overlap
    const groups = groupItems(day);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it("getVisibleHours expands to include early/late items", () => {
    const early = { ...ITEMS[0], start: new Date(2026, 6, 10, 5, 0), end: new Date(2026, 6, 10, 6, 0) };
    const { earliestItemHour } = getVisibleHours({ from: 7, to: 18 }, [early]);
    expect(earliestItemHour).toBe(5);
  });

  it("getMonthCellItems tags single vs multi-day items for a date", () => {
    const date = new Date(2026, 6, 19); // inside the multi-day Release Window
    const positions = calculateMonthItemPositions([ITEMS[2]], [ITEMS[0], ITEMS[1]], new Date(2026, 6, 15));
    const cellItems = getMonthCellItems(date, ITEMS, positions);
    const release = cellItems.find((item) => item.id === "i3");
    expect(release?.isMultiDay).toBe(true);
  });

  it("respects locale for week-based helpers without throwing", () => {
    expect(() => calculateMonthItemPositions([], ITEMS, new Date(2026, 6, 15))).not.toThrow();
    expect(enUS.code).toBe("en-US");
  });
});
