import { parseISO } from "date-fns";

/**
 * Convert argument to the standard Date instance.
 * @param date - ISO string or Date instance
 */
export default function parseDate(date?: string | Date | null): Date {
  if (typeof date === "string") {
    return parseISO(date);
  } else if (date instanceof Date) {
    return date;
  }
  // Raise an error if date cannot be parsed.
  throw new Error(`Cannot parse date: ${date}`);
}
