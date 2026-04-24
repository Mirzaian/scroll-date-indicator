/**
 * Framework-agnostic core for tracking the "currently visible date" in a
 * scrollable timeline and exposing a transient floating indicator.
 *
 * Designed for chat and feed timelines but works for any DOM list whose items
 * carry a timestamp.
 */

export interface ScrollDateIndicatorOptions {
  /** Scroll container element. Items are queried inside this element. */
  container: HTMLElement;
  /**
   * CSS selector matching the timeline items inside `container`.
   * Each match must expose its timestamp (see `getTimestamp`).
   * @default "[data-timestamp]"
   */
  itemSelector?: string;
  /**
   * Reads the timestamp (ms epoch) for an item element.
   * @default reads `data-timestamp` attribute
   */
  getTimestamp?: (el: HTMLElement) => number | null;
  /**
   * Called every time the visible date changes.
   * Receives `null` when no item is visible (e.g. empty list).
   */
  onDateChange?: (date: Date | null) => void;
  /**
   * Called when the indicator should appear / disappear.
   * `true` while the user is actively scrolling, `false` after the idle delay.
   */
  onVisibilityChange?: (visible: boolean) => void;
  /** ms of scroll inactivity after which the indicator hides. @default 1200 */
  idleHideDelay?: number;
  /**
   * Which visible item to use as the "current" one.
   * - "topmost"  → first item still in view (good for upward scrolling)
   * - "center"   → item closest to the vertical center of the viewport
   * @default "topmost"
   */
  anchor?: "topmost" | "center";
  /**
   * Optional root margin passed to the IntersectionObserver. Useful to ignore
   * sticky headers etc.
   * @default "0px"
   */
  rootMargin?: string;
}

export interface ScrollDateIndicatorController {
  /** Force a recompute (e.g. after items were prepended). */
  refresh(): void;
  /** Disconnect observers and remove listeners. */
  destroy(): void;
  /** Currently shown date (or null). */
  readonly currentDate: Date | null;
  /** Whether the indicator is currently visible. */
  readonly isVisible: boolean;
}

const DEFAULT_GET_TIMESTAMP = (el: HTMLElement): number | null => {
  const raw = el.getAttribute("data-timestamp");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

/**
 * Attach the indicator behavior to a scroll container.
 *
 * The function is purely behavior, it does not render any UI. Subscribe to
 * `onDateChange` / `onVisibilityChange` and render whatever pill / chip /
 * tooltip you want.
 */
export function createScrollDateIndicator(
  options: ScrollDateIndicatorOptions,
): ScrollDateIndicatorController {
  const {
    container,
    itemSelector = "[data-timestamp]",
    getTimestamp = DEFAULT_GET_TIMESTAMP,
    onDateChange,
    onVisibilityChange,
    idleHideDelay = 1200,
    anchor = "topmost",
    rootMargin = "0px",
  } = options;

  if (!container) {
    throw new Error(
      "[scroll-date-indicator] `container` is required and must be an HTMLElement.",
    );
  }

  const visibleItems = new Set<HTMLElement>();
  let currentDate: Date | null = null;
  let isVisible = false;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let rafToken: number | null = null;
  let destroyed = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visibleItems.add(el);
        else visibleItems.delete(el);
      }
      scheduleRecompute();
    },
    { root: container, rootMargin, threshold: 0 },
  );

  const mutationObserver = new MutationObserver(() => {
    refreshObservedItems();
    scheduleRecompute();
  });
  mutationObserver.observe(container, { childList: true, subtree: true });

  function refreshObservedItems(): void {
    observer.disconnect();
    visibleItems.clear();
    const nodes = container.querySelectorAll<HTMLElement>(itemSelector);
    nodes.forEach((node) => observer.observe(node));
  }

  function pickAnchorItem(): HTMLElement | null {
    if (visibleItems.size === 0) return null;
    const containerRect = container.getBoundingClientRect();

    if (anchor === "center") {
      const centerY = containerRect.top + containerRect.height / 2;
      let best: HTMLElement | null = null;
      let bestDelta = Infinity;
      for (const el of visibleItems) {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const delta = Math.abs(mid - centerY);
        if (delta < bestDelta) {
          best = el;
          bestDelta = delta;
        }
      }
      return best;
    }

    // anchor === "topmost"
    let best: HTMLElement | null = null;
    let bestTop = Infinity;
    for (const el of visibleItems) {
      const r = el.getBoundingClientRect();
      // Prefer items whose top is at/below the container top edge.
      const top = Math.max(r.top, containerRect.top);
      if (top < bestTop) {
        best = el;
        bestTop = top;
      }
    }
    return best;
  }

  function scheduleRecompute(): void {
    if (rafToken !== null) return;
    rafToken = requestAnimationFrame(() => {
      rafToken = null;
      recompute();
    });
  }

  function recompute(): void {
    if (destroyed) return;
    const anchorEl = pickAnchorItem();
    const ts = anchorEl ? getTimestamp(anchorEl) : null;
    const next = ts != null ? new Date(ts) : null;
    if (!isSameInstant(next, currentDate)) {
      currentDate = next;
      onDateChange?.(next);
    }
  }

  function showAndScheduleHide(): void {
    if (!isVisible) {
      isVisible = true;
      onVisibilityChange?.(true);
    }
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      isVisible = false;
      onVisibilityChange?.(false);
      hideTimer = null;
    }, idleHideDelay);
  }

  function handleScroll(): void {
    showAndScheduleHide();
    scheduleRecompute();
  }

  container.addEventListener("scroll", handleScroll, { passive: true });

  // Initial pass.
  refreshObservedItems();
  scheduleRecompute();

  return {
    refresh(): void {
      refreshObservedItems();
      scheduleRecompute();
    },
    destroy(): void {
      destroyed = true;
      container.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      mutationObserver.disconnect();
      if (hideTimer) clearTimeout(hideTimer);
      if (rafToken !== null) cancelAnimationFrame(rafToken);
    },
    get currentDate(): Date | null {
      return currentDate;
    },
    get isVisible(): boolean {
      return isVisible;
    },
  };
}

function isSameInstant(a: Date | null, b: Date | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}
