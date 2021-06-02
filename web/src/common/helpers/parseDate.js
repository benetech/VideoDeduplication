import { parseISO } from "date-fns";

/**
 * Convert argument to the standard Date instance.
 * @param date - ISO string or Date instance
 */
export default function parseDate(date) {
  if (typeof date === "string" || date instanceof String) {
    return parseISO(date);
  } else if (date == null || date instanceof Date) {
    return date;
  }
  // Raise an error if date cannot be parsed.
  const error = new Error(`Cannot parse date: ${date}`);
  error.date = date;
  throw error;
}
