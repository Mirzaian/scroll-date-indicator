/**
 * Date-formatting presets useful for chat / Matrix timelines.
 *
 * Pure functions, safe to use anywhere, no DOM dependency.
 */

export type Locale = string | string[];

export interface RelativeDayOptions {
  /** Locale(s) for `Intl.DateTimeFormat`. @default browser default */
  locale?: Locale;
  /**
   * Reference "now" used to determine "today" / "yesterday".
   * @default new Date()
   */
  now?: Date;
  /** i18n strings for the relative buckets. */
  labels?: {
    today?: string;
    yesterday?: string;
  };
  /**
   * If true, dates within the current week show their weekday name
   * (e.g. "Monday"). @default true
   */
  showWeekdayWithinWeek?: boolean;
}

/**
 * Format a date the way most chat apps do:
 *  - same day → "Today"
 *  - previous day → "Yesterday"
 *  - within last 7 days → weekday ("Monday")
 *  - same year → "24 April"
 *  - older → "24 April 2024"
 */
export function formatRelativeDay(
  date: Date,
  options: RelativeDayOptions = {},
): string {
  const {
    locale,
    now = new Date(),
    labels: { today = "Today", yesterday = "Yesterday" } = {},
    showWeekdayWithinWeek = true,
  } = options;

  const dayDiff = diffInCalendarDays(date, now);

  if (dayDiff === 0) return today;
  if (dayDiff === -1) return yesterday;

  if (showWeekdayWithinWeek && dayDiff < 0 && dayDiff >= -6) {
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

/** Format a date as "April 2024" / "April 2024" (locale-aware). */
export function formatMonthYear(date: Date, locale?: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Sensible defaults for Matrix / chat timelines.
 *
 * Use as:
 *   const preset = matrixTimelinePreset({ locale: "de-DE" });
 *   onDateChange: (d) => setLabel(d ? preset.format(d) : "")
 */
export function matrixTimelinePreset(opts: {
  locale?: Locale;
  labels?: RelativeDayOptions["labels"];
} = {}) {
  return {
    /** Recommended `data-timestamp` attribute name. */
    timestampAttr: "data-timestamp" as const,
    /** Default DOM selector for items with a timestamp. */
    itemSelector: "[data-timestamp]" as const,
    /** Recommended idle hide delay (ms). */
    idleHideDelay: 1200,
    /** Format function ready to plug into `onDateChange`. */
    format(date: Date): string {
      return formatRelativeDay(date, {
        locale: opts.locale,
        labels: opts.labels,
      });
    },
  };
}

function diffInCalendarDays(a: Date, b: Date): number {
  const aMid = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bMid = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const ms = aMid - bMid;
  return Math.round(ms / 86_400_000);
}
