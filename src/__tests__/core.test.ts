import { afterEach, describe, expect, it, vi } from "vitest";
import { createScrollDateIndicator } from "../core";

function tick(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function buildContainer(timestamps: number[]): HTMLDivElement {
  const container = document.createElement("div");
  container.style.height = "200px";
  container.style.overflowY = "auto";
  for (const ts of timestamps) {
    const item = document.createElement("div");
    item.setAttribute("data-timestamp", String(ts));
    item.style.height = "50px";
    item.textContent = new Date(ts).toISOString();
    container.appendChild(item);
  }
  document.body.appendChild(container);
  return container;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("createScrollDateIndicator", () => {
  it("emits an initial date based on visible items", async () => {
    const ts = Date.UTC(2026, 3, 24, 10, 0, 0);
    const container = buildContainer([ts]);
    const onDateChange = vi.fn();

    const ctrl = createScrollDateIndicator({ container, onDateChange });
    await tick();

    expect(onDateChange).toHaveBeenCalled();
    const arg = onDateChange.mock.calls[0]![0] as Date;
    expect(arg).toBeInstanceOf(Date);
    expect(arg.getTime()).toBe(ts);
    ctrl.destroy();
  });

  it("toggles visibility on scroll and hides after the idle delay", () => {
    vi.useFakeTimers();
    const container = buildContainer([Date.UTC(2026, 3, 24)]);
    const onVisibilityChange = vi.fn();

    const ctrl = createScrollDateIndicator({
      container,
      onVisibilityChange,
      idleHideDelay: 500,
    });

    container.dispatchEvent(new Event("scroll"));
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);

    vi.advanceTimersByTime(500);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    ctrl.destroy();
  });

  it("respects a custom getTimestamp", async () => {
    const container = document.createElement("div");
    const item = document.createElement("div");
    item.setAttribute("data-foo", "1714000000000");
    container.appendChild(item);
    document.body.appendChild(container);

    const onDateChange = vi.fn();
    const ctrl = createScrollDateIndicator({
      container,
      itemSelector: "[data-foo]",
      getTimestamp: (el) => Number(el.getAttribute("data-foo")),
      onDateChange,
    });
    await tick();

    expect(onDateChange).toHaveBeenCalled();
    const arg = onDateChange.mock.calls.at(-1)![0] as Date;
    expect(arg.getTime()).toBe(1714000000000);
    ctrl.destroy();
  });

  it("destroy is idempotent and removes the scroll listener", () => {
    const container = buildContainer([Date.now()]);
    const onVisibilityChange = vi.fn();
    const ctrl = createScrollDateIndicator({ container, onVisibilityChange });
    ctrl.destroy();
    onVisibilityChange.mockClear();
    container.dispatchEvent(new Event("scroll"));
    expect(onVisibilityChange).not.toHaveBeenCalled();
    expect(() => ctrl.destroy()).not.toThrow();
  });

  it("throws when container is missing", () => {
    expect(() =>
      createScrollDateIndicator({ container: null as unknown as HTMLElement }),
    ).toThrow();
  });
});
