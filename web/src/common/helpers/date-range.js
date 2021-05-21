import parseDate from "./parseDate";

/**
 * Convert ISO-string date range to Date-based range.
 */
export function parseDateRange(range) {
  return {
    lower: parseDate(range.lower),
    upper: parseDate(range.upper),
  };
}

/**
 * Convert Date-based date range to ISO-string date range.
 */
export function stringifyDateRange(range) {
  return {
    lower: range.lower == null ? null : range.lower.toISOString(),
    upper: range.upper == null ? null : range.upper.toISOString(),
  };
}
