import parseDate from "./parseDate";
import { PartialRange } from "./Range";

/**
 * Check if the string value is defined.
 */
function isBlank(value?: string | null): boolean {
  return value == null || value.length === 0;
}

/**
 * Convert ISO-string date range to Date-based range.
 */
export function parseDateRange(
  range: PartialRange<string>
): PartialRange<Date> {
  return {
    lower: isBlank(range.lower) ? null : parseDate(range.lower),
    upper: isBlank(range.upper) ? null : parseDate(range.upper),
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
