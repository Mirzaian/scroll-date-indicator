import { describe, expect, it } from "vitest";
import { formatRelativeDay, formatMonthYear, matrixTimelinePreset } from "../presets";

const NOW = new Date(2026, 3, 24, 12, 0, 0);

describe("formatRelativeDay", () => {
  it("returns 'Today' for the same calendar day", () => {
    const date = new Date(2026, 3, 24, 3, 0, 0);
    expect(formatRelativeDay(date, { now: NOW })).toBe("Today");
  });

  it("returns 'Yesterday' for the previous calendar day", () => {
    const date = new Date(2026, 3, 23, 22, 0, 0);
    expect(formatRelativeDay(date, { now: NOW })).toBe("Yesterday");
  });

  it("returns weekday name within the last 6 days", () => {
    const date = new Date(2026, 3, 20, 12, 0, 0);
    const out = formatRelativeDay(date, { now: NOW, locale: "en-US" });
    expect(out).toMatch(/Monday/);
  });

  it("returns localized labels", () => {
    const date = new Date(2026, 3, 24, 3, 0, 0);
    expect(
      formatRelativeDay(date, {
        now: NOW,
        labels: { today: "Heute", yesterday: "Gestern" },
      }),
    ).toBe("Heute");
  });

  it("formats older same-year dates without year", () => {
    const date = new Date(2026, 0, 15, 12, 0, 0);
    const out = formatRelativeDay(date, { now: NOW, locale: "en-GB" });
    expect(out).not.toMatch(/2026/);
    expect(out).toMatch(/January|Jan/);
  });

  it("formats different-year dates with year", () => {
    const date = new Date(2024, 5, 1, 12, 0, 0);
    const out = formatRelativeDay(date, { now: NOW, locale: "en-GB" });
    expect(out).toMatch(/2024/);
  });
});

describe("formatMonthYear", () => {
  it("returns month and year", () => {
    const out = formatMonthYear(new Date(2026, 3, 24, 12, 0, 0), "en-US");
    expect(out).toMatch(/April/);
    expect(out).toMatch(/2026/);
  });
});

describe("matrixTimelinePreset", () => {
  it("returns sensible defaults", () => {
    const p = matrixTimelinePreset();
    expect(p.itemSelector).toBe("[data-timestamp]");
    expect(p.timestampAttr).toBe("data-timestamp");
    expect(typeof p.format).toBe("function");
  });

  it("uses provided locale and labels", () => {
    const p = matrixTimelinePreset({
      locale: "de-DE",
      labels: { today: "Heute" },
    });
    expect(p.format(new Date())).toBe("Heute");
  });
});
