import parseDate from "./parseDate";
import { PartialRange } from "./Range";

/**
 * Convert ISO-string date range to Date-based range.
 */
export function parseDateRange(
  range: PartialRange<string>
): PartialRange<Date> {
  return {
    lower: parseDate(range.lower),
    upper: parseDate(range.upper),
  };
}

/**
 * Convert Date-based date range to ISO-string date range.
 */
export function stringifyDateRange(
  range: PartialRange<Date>
): PartialRange<string> {
  return {
    lower: range.lower == null ? null : range.lower.toISOString(),
    upper: range.upper == null ? null : range.upper.toISOString(),
  };
}
