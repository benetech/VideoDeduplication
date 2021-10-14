/**
 * Parsed duration.
 */
import { IntlShape } from "react-intl";

export type ParsedDuration = {
  millis: number;
  seconds: number;
  minutes: number;
  hours: number;
};

/**
 * Parse duration milliseconds
 * @param duration duration in milliseconds
 */
export function parseDuration(duration: number): ParsedDuration {
  const millis = Math.floor(duration % 1000);
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const hours = Math.floor(duration / (1000 * 60 * 60));
  return { millis, seconds, minutes, hours };
}

/**
 * Pad number to two-digit format.
 */
function pad(time: number): string {
  return String(time).padStart(2, "0");
}

/**
 * Format duration.
 * @param duration duration in milliseconds.
 * @param intl
 * @param showUnits
 */
export function formatDuration(
  duration: number,
  intl: IntlShape,
  showUnits = true
): string {
  const t = parseDuration(duration);
  if (t.hours > 0) {
    if (showUnits) {
      const units = intl.formatMessage({ id: "value.time.hours" });
      return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)} ${units}`;
    } else {
      return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
    }
  }
  if (showUnits) {
    const units = intl.formatMessage({ id: "value.time.minutes" });
    return `${pad(t.minutes)}:${pad(t.seconds)} ${units}`;
  } else {
    return `${pad(t.minutes)}:${pad(t.seconds)}`;
  }
}

/**
 * Format date according to the locale.
 */
export function formatDate(
  date: Date | null | undefined,
  intl: IntlShape
): string | undefined {
  if (date == null) {
    return;
  }
  return intl.formatDate(date, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Format boolean value.
 */
export function formatBool(value: boolean, intl: IntlShape): string {
  const messageID = value ? "value.bool.true" : "value.bool.false";
  return intl.formatMessage({ id: messageID });
}

/**
 * Format potentially large count.
 */
export function formatCount(count: number): string {
  if (count < 1e3) {
    return `${count}`;
  }
  if (count < 1e6) {
    return `${Math.round(count / 1e3)}K+`;
  }
  return `${Math.round(count / 1e6)}M+`;
}
