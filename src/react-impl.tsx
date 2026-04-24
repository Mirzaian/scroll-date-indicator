import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createScrollDateIndicator,
  type ScrollDateIndicatorOptions,
} from "./core";
import { formatRelativeDay, type Locale, type RelativeDayOptions } from "./presets";

export interface UseScrollDateIndicatorOptions
  extends Omit<
    ScrollDateIndicatorOptions,
    "container" | "onDateChange" | "onVisibilityChange"
  > {
  /** Ref to the scroll container. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Optional dependency list. When it changes, the controller is reattached
   * (e.g. after switching rooms, after items are re-rendered with new keys).
   */
  deps?: ReadonlyArray<unknown>;
}

export interface ScrollDateIndicatorState {
  /** Currently anchored date, or null when nothing is visible. */
  date: Date | null;
  /** Whether the indicator should be shown (true while user scrolls). */
  visible: boolean;
}

/**
 * React hook providing the current visible date + visibility flag for a
 * scrollable timeline container.
 */
export function useScrollDateIndicator(
  options: UseScrollDateIndicatorOptions,
): ScrollDateIndicatorState {
  const { containerRef, deps = [], ...rest } = options;
  const [state, setState] = useState<ScrollDateIndicatorState>({
    date: null,
    visible: false,
  });

  // Keep latest options in a ref so we don't tear down on every render.
  const optionsRef = useRef(rest);
  optionsRef.current = rest;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const controller = createScrollDateIndicator({
      container: el,
      ...optionsRef.current,
      onDateChange: (date) => setState((s) => ({ ...s, date })),
      onVisibilityChange: (visible) => setState((s) => ({ ...s, visible })),
    });

    return () => controller.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);

  return state;
}

export interface ScrollDateIndicatorProps
  extends UseScrollDateIndicatorOptions {
  /** Locale forwarded to the default formatter. Ignored when `format` is set. */
  locale?: Locale;
  /**
   * Localized labels for relative-day buckets (today / yesterday).
   * Ignored when `format` is provided.
   */
  labels?: RelativeDayOptions["labels"];
  /** Custom formatter. Overrides the default relative-day formatting. */
  format?: (date: Date) => string;
  /** Override the rendered output entirely. */
  children?: (state: ScrollDateIndicatorState & { label: string }) => ReactNode;
  /** Extra class for the floating pill. */
  className?: string;
  /** Inline style for the floating pill. */
  style?: CSSProperties;
  /**
   * Where the pill is anchored relative to the scroll container.
   * @default "top-center"
   */
  position?:
    | "top-center"
    | "top-right"
    | "top-left"
    | "right-edge"
    | "left-edge";
}

/**
 * Drop-in floating date indicator. Render it as a sibling of the scroll
 * container inside a `position: relative` wrapper.
 *
 * ```tsx
 * <div style={{ position: "relative" }}>
 *   <div ref={scrollRef} style={{ overflowY: "auto" }}>...</div>
 *   <ScrollDateIndicator containerRef={scrollRef} locale="de-DE" />
 * </div>
 * ```
 */
export function ScrollDateIndicator(
  props: ScrollDateIndicatorProps,
): JSX.Element | null {
  const {
    locale,
    labels,
    format,
    children,
    className,
    style,
    position = "top-center",
    ...hookOptions
  } = props;

  const { date, visible } = useScrollDateIndicator(hookOptions);

  const label = useMemo(() => {
    if (!date) return "";
    return format ? format(date) : formatRelativeDay(date, { locale, labels });
  }, [date, format, locale, labels]);

  if (children) {
    return <>{children({ date, visible, label })}</>;
  }

  if (!date) return null;

  const baseStyle: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    transition: "opacity 200ms ease, transform 200ms ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(-4px)",
    padding: "4px 12px",
    borderRadius: 999,
    background: "rgba(15, 23, 42, 0.85)",
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: 500,
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    zIndex: 10,
    ...positionStyles(position),
    ...style,
  };

  return (
    <div
      className={["scroll-date-indicator", className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      style={baseStyle}
    >
      {label}
    </div>
  );
}

function positionStyles(position: ScrollDateIndicatorProps["position"]): CSSProperties {
  switch (position) {
    case "top-right":
      return { top: 8, right: 8 };
    case "top-left":
      return { top: 8, left: 8 };
    case "right-edge":
      return { top: "50%", right: 8, transform: "translateY(-50%)" };
    case "left-edge":
      return { top: "50%", left: 8, transform: "translateY(-50%)" };
    case "top-center":
    default:
      return { top: 8, left: "50%", transform: "translateX(-50%)" };
  }
}
